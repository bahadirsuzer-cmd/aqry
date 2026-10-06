const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('../node_modules/typescript');

let response, dialogMounted, opened, handoffs, sdkError;
const exportsObject = {};
const source = fs.readFileSync(__dirname + '/../src/services/visual-packs.ts', 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
new Function('require', 'exports', code)(name => {
  if (name === './supabase') return { supabase: { functions: { invoke: async () => response } } };
  if (name === './paddle') return { openVisualPackCheckout: async (transaction, order) => {
    assert.equal(dialogMounted, false, 'Host modal must be unmounted before Paddle opens');
    assert.equal(transaction, 'txn_test'); assert.equal(order, 'order_test');
    opened++;
    if (sdkError) throw new Error('sdk_error');
  } };
  throw new Error('Unexpected import: ' + name);
}, exportsObject);

function reset(result) {
  response = result; dialogMounted = true; opened = 0; handoffs = 0; sdkError = false;
}
function handoff() { handoffs++; dialogMounted = false; }

(async () => {
  for (const pack of ['anime', 'magic', 'arena']) {
    reset({ data: { transaction_id: 'txn_test', order_id: 'order_test' } });
    const result = await exportsObject.purchaseVisualPack(pack, handoff);
    assert.equal(result.orderId, 'order_test'); assert.equal(opened, 1); assert.equal(handoffs, 1);
  }
  reset({ data: { already_owned: true } });
  assert.equal((await exportsObject.purchaseVisualPack('anime', handoff)).alreadyOwned, true);
  assert.equal(handoffs, 0); assert.equal(opened, 0);
  for (const bad of [{ error: new Error('provider_error') }, { data: {} }]) {
    reset(bad);
    await assert.rejects(exportsObject.purchaseVisualPack('anime', handoff), /pack_checkout_unavailable/);
    assert.equal(dialogMounted, true); assert.equal(handoffs, 0); assert.equal(opened, 0);
  }
  reset({ data: { transaction_id: 'txn_test', order_id: 'order_test' } }); sdkError = true;
  await assert.rejects(exportsObject.purchaseVisualPack('anime', handoff), /sdk_error/);
  assert.equal(handoffs, 1);
  console.log('Checkout handoff: all three packs release the modal before Paddle; ownership/API failures preserve the dialog; SDK errors propagate');
})().catch(error => { console.error(error); process.exitCode = 1; });
