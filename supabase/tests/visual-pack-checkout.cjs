const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('../../frontend/node_modules/typescript');
const prices = { anime: 'pri_01m4836qgmhwf660152jre819f', magic: 'pri_01m483gaf7f1k8x49tmzcgkggp', arena: 'pri_01m483nvtkjcdzvwf8cd6y36kc' };
const packs = Object.keys(prices).map(id => ({ id, name: id, amount_minor: 99, currency: 'USD', sale_enabled: true }));
let handler, requestBody, priceOverride = {}, updates = [];
const admin = {
  auth: { getUser: async () => ({ data: { user: { id: 'test-user' } }, error: null }) },
  from: table => ({
    select: () => table === 'visual_pack_catalog'
      ? { order: async () => ({ data: packs }) }
      : { eq: () => ({ eq: () => ({ eq: () => ({ limit: async () => ({ data: [] }) }) }) }) },
    update: row => ({ eq: () => ({ eq: async () => { updates.push(row); return {}; } }) }),
  }),
  rpc: async () => ({ data: { claimed: true, order_id: 'test-order' } }),
};
const code = ts.transpileModule(fs.readFileSync(__dirname + '/../functions/visual-pack-checkout/index.ts', 'utf8').replace(/import.*createClient.*\n/, ''), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;
new Function('createClient', 'Deno', 'fetch', code)(() => admin, { env: { get: () => 'local-test-value' }, serve: fn => { handler = fn; } }, async (url, options) => {
  assert.equal(url, 'https://api.paddle.com/transactions');
  requestBody = JSON.parse(options.body);
  return Response.json({ data: { id: 'txn_test', currency_code: 'USD', subscription_id: null, items: [{ quantity: 1, price: { id: requestBody.items[0].price_id, unit_price: { amount: '99', currency_code: 'USD' }, tax_mode: 'internal', billing_cycle: null, trial_period: null, ...priceOverride } }] } });
});
const request = (pack, token = 'test-token', origin = 'https://www.aqryo.com') => new Request('https://local/checkout', { method: 'POST', headers: { origin, authorization: token ? 'Bearer ' + token : '', 'content-type': 'application/json' }, body: JSON.stringify({ pack_id: pack, price_id: 'malicious-price' }) });
(async () => {
  assert.equal((await handler(request('anime', ''))).status, 401);
  assert.equal((await handler(request('anime', 'test', 'https://evil.example'))).status, 403);
  for (const [id, price] of Object.entries(prices)) {
    assert.equal((await handler(request(id))).status, 200);
    assert.deepEqual(requestBody.items, [{ quantity: 1, price_id: price }]);
    assert.equal(requestBody.custom_data.aqryo_pack, id);
  }
  for (const override of [{ unit_price: { amount: '499', currency_code: 'USD' } }, { billing_cycle: { interval: 'month', frequency: 1 } }, { id: prices.magic }, { tax_mode: 'external' }]) {
    priceOverride = override; updates = [];
    assert.equal((await handler(request('anime'))).status, 502);
    assert.equal(updates[0].status, 'failed');
    assert.ok(!updates.some(row => row.transaction_id));
  }
  priceOverride = {}; packs[0].sale_enabled = false;
  assert.equal((await handler(request('anime'))).status, 503);
  console.log('Checkout: all three catalog prices bound; client price ignored; invalid/recurring prices blocked; launch and auth gates preserved');
})().catch(error => { console.error(error); process.exit(1); });
