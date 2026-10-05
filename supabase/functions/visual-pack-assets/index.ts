import { createClient } from "npm:@supabase/supabase-js@2.111.0";

const PACK_DIRECTORIES: Record<string, string> = { anime: "anime", magic: "magic-academy", arena: "fighting-arena" };

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "";
  const allowed = ["https://aqryo.com", "https://www.aqryo.com", "http://localhost:5173"];
  const headers: Record<string, string> = { "content-type": "application/json", "cache-control": "no-store", "vary": "Origin",
    "access-control-allow-headers": "authorization, apikey, content-type, x-client-info", "access-control-allow-methods": "POST, OPTIONS" };
  if (allowed.includes(origin)) headers["access-control-allow-origin"] = origin;
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
  if (origin && !allowed.includes(origin)) return json({ error: "origin_not_allowed" }, 403);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: auth, error: authError } = await admin.auth.getUser(token);
  if (!token || authError || !auth.user || auth.user.is_anonymous) return json({ error: "unauthorized" }, 401);
  let body: { pack_id?: string };
  try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
  const directory = PACK_DIRECTORIES[body.pack_id ?? ""];
  if (!directory) return json({ error: "unknown_pack" }, 400);
  const { data: pack, error: packError } = await admin.from("visual_pack_catalog").select("sale_enabled").eq("id", body.pack_id).single();
  if (packError) return json({ error: "access_check_failed" }, 503);
  // Until checkout is activated, existing creators can continue using the launch preview.
  if (pack.sale_enabled) {
    const { data: owned, error } = await admin.from("visual_pack_orders").select("id")
      .eq("user_id", auth.user.id).eq("pack_id", body.pack_id).eq("status", "completed").limit(1);
    if (error) return json({ error: "access_check_failed" }, 503);
    if (!owned?.length) return json({ error: "pack_not_owned" }, 403);
  }
  const paths: string[] = [];
  for (const group of ["single", "couple", "scene"]) {
    const { data: files, error } = await admin.storage.from("visual-packs").list(`${directory}/${group}`, { limit: 10, sortBy: { column: "name", order: "asc" } });
    if (error || files?.length !== 10) return json({ error: "pack_assets_unavailable" }, 503);
    paths.push(...files.map((file) => `${directory}/${group}/${file.name}`));
  }
  const { data: signed, error: signedError } = await admin.storage.from("visual-packs").createSignedUrls(paths, 300);
  if (signedError || signed?.some((entry) => entry.error || !entry.signedUrl)) return json({ error: "pack_assets_unavailable" }, 503);
  return json({ expires_in: 300, assets: Object.fromEntries((signed ?? []).map((entry) => [`/puzzle/${entry.path}`, entry.signedUrl])) });
});
