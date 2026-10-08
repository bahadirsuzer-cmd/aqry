import { supabase } from "./supabase";
import { openVisualPackCheckout } from "./paddle";
import type { VisualPack } from "@/lib/animeSingleTemplates";

export type PaidVisualPack = Exclude<VisualPack, "classic">;
export type PurchaseVisualPack = PaidVisualPack | "bundle";
export const BUNDLE_PACKS: PaidVisualPack[] = ["anime", "magic", "arena"];
export type PackCatalogEntry = { id: PurchaseVisualPack; name: string; amount_minor: number; currency: string; sale_enabled: boolean; checkout_available: boolean };
export type PackAccess = { catalog: PackCatalogEntry[]; owned: PaidVisualPack[] };

export async function getVisualPackAccess(): Promise<PackAccess> {
  const [{ data: catalog, error: catalogError }, { data: orders, error: ordersError }] = await Promise.all([
    supabase.functions.invoke<{ packs: PackCatalogEntry[] }>("visual-pack-checkout", { method: "GET" }),
    supabase.from("visual_pack_orders").select("pack_id").eq("status", "completed"),
  ]);
  if (catalogError || ordersError || !catalog?.packs) throw new Error("pack_access_unavailable");
  const ids = (orders ?? []).map((order) => order.pack_id);
  return { catalog: catalog.packs, owned: ids.includes("bundle") ? [...BUNDLE_PACKS] : [...new Set(ids.filter((id): id is PaidVisualPack => BUNDLE_PACKS.includes(id as PaidVisualPack)))] };
}

export function canUseVisualPack(pack: VisualPack, access: PackAccess | null) {
  if (pack === "classic") return true;
  const entry = access?.catalog.find((item) => item.id === pack);
  return Boolean(entry && (!entry.sale_enabled || access?.owned.includes(pack)));
}

export async function purchaseVisualPack(pack: PurchaseVisualPack, beforeCheckout: () => void) {
  const { data, error } = await supabase.functions.invoke<{ already_owned?: boolean; order_id?: string; transaction_id?: string }>(
    "visual-pack-checkout", { body: { pack_id: pack } },
  );
  if (error || !data) throw new Error("pack_checkout_unavailable");
  if (data.already_owned) return { alreadyOwned: true };
  if (!data.transaction_id || !data.order_id) throw new Error("pack_checkout_unavailable");
  // Release the host dialog's focus/pointer lock before Paddle mounts its overlay.
  beforeCheckout();
  await openVisualPackCheckout(data.transaction_id, data.order_id);
  return { alreadyOwned: false, orderId: data.order_id, transactionId: data.transaction_id };
}

export async function getVisualPackOrder(orderId: string) {
  const { data, error } = await supabase.from("visual_pack_orders").select("id,pack_id,status,transaction_id")
    .eq("id", orderId).maybeSingle();
  if (error) throw new Error("pack_order_unavailable");
  return data as { id: string; pack_id: PurchaseVisualPack; status: string; transaction_id: string | null } | null;
}

const assetsCache = new Map<VisualPack, { expires: number; assets: Record<string, string> }>();
const pendingAssets = new Map<VisualPack, Promise<Record<string, string>>>();

export function clearVisualPackAssets() { assetsCache.clear(); }

export async function resolveVisualPackAsset(src: string, pack: VisualPack): Promise<string> {
  if (pack === "classic") return src;
  let cached = assetsCache.get(pack);
  if (!cached || cached.expires <= Date.now()) {
    let pending = pendingAssets.get(pack);
    if (!pending) {
      pending = (async () => {
        const { data, error } = await supabase.functions.invoke<{ assets: Record<string, string>; expires_in: number }>(
          "visual-pack-assets", { body: { pack_id: pack } },
        );
        if (error || !data?.assets) throw new Error("pack_assets_unavailable");
        assetsCache.set(pack, { assets: data.assets, expires: Date.now() + (data.expires_in - 30) * 1000 });
        return data.assets;
      })().finally(() => pendingAssets.delete(pack));
      pendingAssets.set(pack, pending);
    }
    const assets = await pending;
    cached = assetsCache.get(pack) ?? { assets, expires: 0 };
  }
  const url = cached.assets[src];
  if (!url) throw new Error("pack_asset_unknown");
  return url;
}

export function visualBundleAmount(access: PackAccess | null): number | null {
  const bundle = access?.catalog.find((entry) => entry.id === "bundle");
  if (!bundle?.checkout_available) return null;
  const count = BUNDLE_PACKS.filter((pack) => access?.owned.includes(pack)).length;
  return count < 2 ? bundle.amount_minor - count * 99 : null;
}
