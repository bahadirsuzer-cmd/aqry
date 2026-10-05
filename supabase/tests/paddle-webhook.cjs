const fs=require('fs');const ts=require('../../frontend/node_modules/typescript');const assert=require('node:assert/strict');const crypto=require('node:crypto');
const root=require('node:path').resolve(__dirname,'../..');
let handler;let calls=[];let handled=true;let dbError=false;
const admin={rpc:async(name,args)=>{calls.push({name,args});return {data:{handled},error:dbError?{code:'test'}:null}},from:()=>({upsert:async(row)=>{calls.push({upsert:row});return {error:null}},update:(row)=>({eq:async(k,v)=>{calls.push({update:row,k,v});return {error:null}}})})};
const code=ts.transpileModule(fs.readFileSync(root+'/supabase/functions/paddle-webhook/index.ts','utf8').replace(/import.*createClient.*\n/,''),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
new Function('createClient','Deno',code)(()=>admin,{env:{get:(key)=>key==='PADDLE_WEBHOOK_SECRET'?'local-test-secret':'local-value'},serve:(fn)=>handler=fn});
async function event(payload,signed=true){const raw=JSON.stringify(payload),timestamp=String(Math.floor(Date.now()/1000));const signature=crypto.createHmac('sha256','local-test-secret').update(timestamp+':'+raw).digest('hex');return handler(new Request('https://local/webhook',{method:'POST',body:raw,headers:{'paddle-signature':signed?`ts=${timestamp};h1=${signature}`:'invalid'}}));}
(async()=>{
 assert.equal((await event({event_type:'transaction.completed'},false)).status,401);assert.equal(calls.length,0);
 assert.equal((await event({event_type:'transaction.completed',data:{id:'test-pack'}})).status,200);assert.equal(calls.length,1);assert.equal(calls[0].name,'process_visual_pack_event');
 handled=false;calls=[];
 assert.equal((await event({event_type:'subscription.activated',data:{id:'sub_test',status:'active',custom_data:{user_id:'qa'}}})).status,200);assert.equal(calls[1].upsert.subscription_id,'sub_test');
 calls=[];assert.equal((await event({event_type:'transaction.completed',data:{id:'txn_test',subscription_id:'sub_test'}})).status,200);assert.equal(calls[1].update.status,'active');
 calls=[];assert.equal((await event({event_type:'transaction.payment_failed',data:{id:'txn_test',subscription_id:'sub_test'}})).status,200);assert.equal(calls[1].update.status,'past_due');
 dbError=true;assert.equal((await event({event_type:'transaction.completed',data:{id:'txn_test'}})).status,500);
 console.log('Webhook: unsigned requests rejected; packs processed; legacy subscriptions preserved; DB errors retryable');
})().catch(e=>{console.error(e);process.exit(1)});
