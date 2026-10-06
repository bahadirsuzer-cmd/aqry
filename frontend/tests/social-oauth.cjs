const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { webcrypto } = require("node:crypto");
const root = path.resolve(__dirname, "../../supabase/functions");
const env = { SUPABASE_URL: "https://test.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "test-only", X_CLIENT_ID: "client", X_CLIENT_SECRET: "secret" };
const tables = { creator_publish_profiles: [{ id: "profile", creator_id: "owner" }], social_oauth_requests: [], social_accounts: [], social_account_credentials: [], social_publish_receipts: [], experiences: [{ id: "experience", creator_id: "owner", status: "published", type: "story" }] };
let authenticated = true, upstreamCalls = 0, credentialFailure = false, postFailure = false;
function client() {
  return {
    auth: { getUser: async () => ({ data: { user: authenticated ? { id: "owner" } : null } }) },
    from(table) {
      let action = "read", payload, predicates = [];
      const query = {
        select() { return query; }, eq(key, value) { predicates.push(row => row[key] === value); return query; },
        gt(key, value) { predicates.push(row => row[key] > value); return query; },
        lt(key, value) { predicates.push(row => row[key] < value); return query; },
        delete() { action = "delete"; return query; }, insert(value) { action = "insert"; payload = value; return query; },
        update(value) { action = "update"; payload = value; return query; }, upsert(value) { action = "upsert"; payload = value; return query; },
        async run() {
          if (table === "social_account_credentials" && credentialFailure) return { data: null, error: {} };
          let rows = tables[table].filter(row => predicates.every(test => test(row)));
          if (action === "delete") tables[table] = tables[table].filter(row => !rows.includes(row));
          if (action === "update") rows.forEach(row => Object.assign(row, payload));
          if (action === "insert" || action === "upsert") {
            const existing = action === "upsert" && tables[table].find(row => table === "social_accounts" ? row.platform_account_id === payload.platform_account_id : row.account_id === payload.account_id);
            const row = existing || { id: "account-" + tables[table].length };
            Object.assign(row, payload); if (!existing) tables[table].push(row); rows = [row];
          }
          return { data: rows, error: null };
        },
        async single() { const result = await query.run(); return { ...result, data: result.data?.[0] ?? null }; },
        maybeSingle() { return query.single(); },
        then(resolve, reject) { return query.run().then(resolve, reject); },
      };
      return query;
    },
  };
}
const context = { Request, Response, URL, URLSearchParams, TextEncoder, Uint8Array, Date, AbortSignal, crypto: webcrypto, btoa, console, Deno: { env: { get: key => env[key] }, serve: fn => { context.handler = fn; } }, fetch: async url => {
  upstreamCalls++;
  if (url.endsWith("/tweets")) { if (postFailure) throw new Error("network timeout"); return Response.json({ data: { id: "123456789" } }); }
  if (url.endsWith("/token")) return Response.json({ access_token: "private-access", refresh_token: "private-refresh", scope: "tweet.read tweet.write users.read offline.access", expires_in: 7200 });
  return Response.json({ data: { id: "x-123", name: "Creator", username: "example" } });
} };
function load(file, dependencies) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, { ...context, exports, require: name => dependencies[name] });
  return exports;
}
const shared = load("_shared/social.ts", { "https://esm.sh/@supabase/supabase-js@2.111.0": { createClient: client } });
function handler(file) {
  let fn;
  const source = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, { ...context, exports: {}, require: () => shared, Deno: { ...context.Deno, serve: value => { fn = value; } } });
  return fn;
}
const start = handler("social-oauth/index.ts"), callback = handler("social-oauth-callback/index.ts"), publish = handler("social-publish/index.ts");
const base = env.SUPABASE_URL + "/functions/v1/social-oauth";
const connect = profileId => start(new Request(base, { method: "POST", headers: { Authorization: "Bearer test", Origin: "https://www.aqryo.com" }, body: JSON.stringify({ platform: "x", profileId }) }));
(async () => {
  authenticated = false;
  assert.equal((await connect("profile")).status, 401);
  authenticated = true;
  assert.equal((await connect("other-owner-profile")).status, 404);
  const response = await connect("profile");
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "https://www.aqryo.com");
  const payload = await response.json();
  const state = new URL(payload.url).searchParams.get("authorize");
  assert.equal(new URL(payload.url).origin, env.SUPABASE_URL);
  assert.ok(!JSON.stringify(payload).includes("verifier"));
  assert.equal(tables.social_oauth_requests[0].state_hash, await shared.hash(state));
  const redirect = await start(new Request(payload.url));
  assert.equal(redirect.status, 302);
  assert.match(redirect.headers.get("set-cookie"), /HttpOnly; Secure; SameSite=Lax/);
  const xUrl = new URL(redirect.headers.get("location"));
  assert.equal(xUrl.searchParams.get("code_challenge"), await shared.hash(tables.social_oauth_requests[0].verifier));
  const callbackAddress = env.SUPABASE_URL + "/functions/v1/social-oauth-callback?state=" + state;
  const invalid = await callback(new Request(callbackAddress + "&code=test"));
  assert.match(invalid.headers.get("location"), /social=invalid/);
  assert.equal(tables.social_oauth_requests.length, 1);
  assert.equal(upstreamCalls, 0);
  const success = await callback(new Request(callbackAddress + "&code=test", { headers: { Cookie: "__Host-aqryo-social=" + state } }));
  assert.match(success.headers.get("location"), /social=connected/);
  assert.equal(tables.social_oauth_requests.length, 0);
  assert.equal(tables.social_accounts[0].publish_profile_id, "profile");
  assert.equal(tables.social_accounts[0].status, "connected");
  assert.equal(tables.social_accounts[0].access_token_encrypted, null);
  assert.equal(tables.social_account_credentials[0].access_token, "private-access");
  const replay = await callback(new Request(callbackAddress + "&code=test", { headers: { Cookie: "__Host-aqryo-social=" + state } }));
  assert.match(replay.headers.get("location"), /social=expired/);
  assert.equal(upstreamCalls, 2);
  const postInput = { requestId: webcrypto.randomUUID(), profileId: "profile", accountId: tables.social_accounts[0].id, experienceId: "experience", text: "Hikayemi oku", confirmed: true };
  const post = overrides => publish(new Request(env.SUPABASE_URL + "/functions/v1/social-publish", { method: "POST", headers: { Authorization: "Bearer test" }, body: JSON.stringify({ ...postInput, ...overrides }) }));
  assert.equal((await post({ confirmed: false })).status, 400);
  assert.equal((await post({ experienceId: "another-users-experience" })).status, 403);
  assert.equal((await post({ profileId: "another-profile" })).status, 403);
  assert.equal(upstreamCalls, 2);
  const published = await post({});
  assert.equal(published.status, 200);
  assert.equal((await published.json()).url, "https://x.com/i/status/123456789");
  assert.equal(tables.social_publish_receipts[0].status, "published");
  assert.ok(tables.social_publish_receipts[0].text.endsWith("?card=v2"));
  assert.equal((await post({})).status, 200);
  assert.equal(upstreamCalls, 3);
  postFailure = true;
  const failedId = webcrypto.randomUUID();
  assert.equal((await post({ requestId: failedId })).status, 502);
  assert.equal(tables.social_publish_receipts[1].status, "uncertain");
  assert.equal((await post({ requestId: failedId })).status, 409);
  assert.equal(upstreamCalls, 4);
  const second = await (await connect("profile")).json();
  const secondState = new URL(second.url).searchParams.get("authorize");
  const canceled = await callback(new Request(env.SUPABASE_URL + "/functions/v1/social-oauth-callback?state=" + secondState + "&error=access_denied", { headers: { Cookie: "__Host-aqryo-social=" + secondState } }));
  assert.match(canceled.headers.get("location"), /social=canceled/);
  assert.equal(tables.social_oauth_requests.length, 0);
  delete env.X_CLIENT_SECRET;
  const status = await (await start(new Request(base + "?action=status"))).json();
  assert.equal(status.channels[0].ready, false);
  assert.equal((await connect("profile")).status, 503);
  assert.equal(upstreamCalls, 4);
  console.log("PASS: ownership, CORS, PKCE, browser binding, cancellation, replay protection, service-only credentials, publish confirmation, duplicate prevention, uncertain outcome and missing configuration.");
})().catch(error => { console.error(error); process.exit(1); });
