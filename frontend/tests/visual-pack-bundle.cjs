const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const ts=require('typescript');
const catalog=['anime','magic','arena','bundle'].map(id=>({id,amount_minor:id==='bundle'?199:99,checkout_available:true,sale_enabled:true}));
let orders=[];
const supabase={functions:{invoke:async()=>({data:{packs:catalog}})},from:()=>({select:()=>({eq:async(_,status)=>{assert.equal(status,'completed');return {data:orders.map(pack_id=>({pack_id}))};}})})};
const source=ts.transpileModule(fs.readFileSync('src/services/visual-packs.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const moduleExports={};
vm.runInNewContext(source,{exports:moduleExports,require:name=>name==='./supabase'?{supabase}:{openVisualPackCheckout:async()=>{}},Map,Set,Date});
(async()=>{
 let access=await moduleExports.getVisualPackAccess();assert.equal(moduleExports.visualBundleAmount(access),199);assert.equal(moduleExports.canUseVisualPack('anime',access),false);
 orders=['anime'];access=await moduleExports.getVisualPackAccess();assert.equal(moduleExports.visualBundleAmount(access),100);assert.equal(moduleExports.canUseVisualPack('anime',access),true);assert.equal(moduleExports.canUseVisualPack('arena',access),false);
 orders=['anime','magic'];access=await moduleExports.getVisualPackAccess();assert.equal(moduleExports.visualBundleAmount(access),null);
 orders=['bundle'];access=await moduleExports.getVisualPackAccess();for(const id of ['anime','magic','arena'])assert.equal(moduleExports.canUseVisualPack(id,access),true);assert.equal(access.owned.length,3);assert.equal(moduleExports.visualBundleAmount(access),null);
 orders=[];access=await moduleExports.getVisualPackAccess();assert.equal(moduleExports.canUseVisualPack('magic',access),false);
 catalog[3].checkout_available=false;assert.equal(moduleExports.visualBundleAmount(access),null);
 console.log('Bundle: ownership expands to all three packs; 199/100 pricing; remaining single and refunded access handled');
})().catch(e=>{console.error(e);process.exit(1)});
