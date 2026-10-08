const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('../../frontend/node_modules/typescript');
const prices = { anime: 'pri_01m4836qgmhwf660152jre819f', magic: 'pri_01m483gaf7f1k8x49tmzcgkggp', arena: 'pri_01m483nvtkjcdzvwf8cd6y36kc' };
const packs = Object.keys(prices).map(id => ({ id, name: id, amount_minor: 99, currency: 'USD', sale_enabled: true }));
packs.push({id:'bundle',name:'All packs',amount_minor:199,currency:'USD',sale_enabled:true});
let claimAmount=199, owned=false;
let requestPack, handler, requestBody, priceOverride = {}, updates = [];
const admin = {
  auth: { getUser: async () => ({ data: { user: { id: 'test-user' } }, error: null }) },
  from: table => ({
    select: () => table === 'visual_pack_catalog'
      ? { order: async () => ({ data: packs }) }
      : { eq: () => ({ in: () => ({ eq: () => ({ limit: async () => ({ data: owned ? [{id:'owned'}] : [] }) }) }) }) },
    update: row => ({ eq: () => ({ eq: async () => { updates.push(row); return {}; } }) }),
  }),
  rpc: async () => ({ data: { claimed: true, order_id: 'test-order', amount_minor: requestPack === 'bundle' ? claimAmount : 99 } }),
};
const code = ts.transpileModule(fs.readFileSync(__dirname + '/../functions/visual-pack-checkout/index.ts', 'utf8').replace(/import.*createClient.*\n/, ''), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;
new Function('createClient', 'Deno', 'fetch', code)(() => admin, { env: { get: () => 'local-test-value' }, serve: fn => { handler = fn; } }, async (url, options) => {
  if(url==='https://api.paddle.com/transactions/preview'){const body=JSON.parse(options.body);return Response.json({data:{items:[{quantity:1,price:{...body.items[0].price,type:'custom'}}]}});}
  assert.equal(url, 'https://api.paddle.com/transactions');
  requestBody = JSON.parse(options.body);
  return Response.json({ data: { id: 'txn_test', currency_code: 'USD', subscription_id: null, items: [{ quantity: 1, price: { id: requestBody.items[0].price_id ?? 'pri_custom', type: requestBody.items[0].price ? 'custom' : 'standard', name: requestBody.items[0].price?.name, unit_price: { amount: String(requestPack === 'bundle' ? claimAmount : 99), currency_code: 'USD' }, tax_mode: 'internal', billing_cycle: null, trial_period: null, ...priceOverride } }] } });
});
const request = (pack, token = 'test-token', origin = 'https://www.aqryo.com') => (requestPack=pack, new Request('https://local/checkout', { method: 'POST', headers: { origin, authorization: token ? 'Bearer ' + token : '', 'content-type': 'application/json' }, body: JSON.stringify({ pack_id: pack, price_id: 'malicious-price', amount_minor:1 }) }));
(async () => {
  const listed=await (await handler(new Request('https://local/checkout',{method:'GET'}))).json();
  assert.equal(listed.packs.find(p=>p.id==='bundle').checkout_available,true);
  assert.equal((await handler(request('anime', ''))).status, 401);
  assert.equal((await handler(request('anime', 'test', 'https://evil.example'))).status, 403);
  for (const [id, price] of Object.entries(prices)) {
    assert.equal((await handler(request(id))).status, 200);
    assert.deepEqual(requestBody.items, [{ quantity: 1, price_id: price }]);
    assert.equal(requestBody.custom_data.aqryo_pack, id);
  }
  for (const amount of [199,100]) {
    claimAmount=amount;
    assert.equal((await handler(request('bundle'))).status,200);
    assert.equal(requestBody.items[0].price.unit_price.amount,String(amount));
    assert.equal(requestBody.items[0].price.billing_cycle,null);
    assert.equal(requestBody.custom_data.aqryo_pack,'bundle');
  }
  claimAmount=1; assert.equal((await handler(request('bundle'))).status,503);
  claimAmount=199; owned=true; assert.equal((await (await handler(request('anime'))).json()).already_owned,true); owned=false;
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
