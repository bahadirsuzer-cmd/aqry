const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const source=fs.readFileSync('src/services/anonymousExperienceEditor.ts','utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
(async()=>{
for(const mode of ['question','confession',undefined]) {
 const content={other:{keep:true},questionConfession:{...(mode?{mode}:{}),extra:'keep'}};
 const calls=[];let patch;
 const supabase={from(table){const filters=[];let updating=false;return {select(){return this},eq(k,v){filters.push([k,v]);return this},update(value){patch=value;updating=true;return this},async single(){calls.push({table,filters,updating});return {data:updating?{id:'original-id'}:{id:'original-id',title:'old',content},error:null}}}}};
 const exports={};vm.runInNewContext(compiled,{exports,require:()=>({supabase})});
 await exports.updateAnonymousExperience('original-id','owner-id',{title:' New title ',intro:' Intro ',questionLabel:'Question',confessionLabel:'Confession',placeholder:'Write',accent:'rose'});
 assert.equal(patch.title,'New title');assert.equal(patch.content.questionConfession.mode,mode);assert.equal(patch.content.questionConfession.extra,'keep');assert.equal(patch.content.other.keep,true);
 for(const key of ['id','creator_id','status','published_at','paused_by','moderated_at','result_config','offer_config'])assert.ok(!(key in patch),key+' must remain unchanged');
 for(const call of calls){assert.equal(call.table,'experiences');assert.ok(call.filters.some(([k,v])=>k==='id'&&v==='original-id'));assert.ok(call.filters.some(([k,v])=>k==='creator_id'&&v==='owner-id'));assert.ok(call.filters.some(([k,v])=>k==='type'&&v==='question_confession'));}
}
const exports={};const supabase={from(){return {select(){return this},eq(){return this},async single(){return {data:null,error:null}}}}};vm.runInNewContext(compiled,{exports,require:()=>({supabase})});await assert.rejects(()=>exports.loadAnonymousExperienceForEdit('missing','owner'));
console.log('PASS: same ID/owner update, no status or date reset, preserved mode/legacy fields, missing records fail closed.');
})();
