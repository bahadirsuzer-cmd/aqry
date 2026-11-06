const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const source=fs.readFileSync('src/routes/experience.$experienceId.tsx','utf8');
const file=ts.createSourceFile('runtime.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
let handler;function visit(n){if(ts.isFunctionDeclaration(n)&&n.name?.text==='confirmCompletion')handler=n;ts.forEachChild(n,visit)}visit(file);assert.ok(handler);
const code=ts.transpileModule(handler.getText(file),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
(async()=>{for(const type of ['story','compatibility','guess','test']){
 let screen,state,calls=0;
 const context={experience:{type,questions:[{id:1}]},experienceId:'test',participantAnswers:{1:0},resultScore:80,result:{title:'Result'},completionSavedRef:{current:false},setScreen:v=>screen=v,setCompletionState:v=>state=v,saveCompletion:async payload=>{calls++;assert.equal(payload.score,['story','guess'].includes(type)?100:80)},console};
 vm.runInNewContext(code,context);context.confirmCompletion();assert.equal(screen,'completion',type+' must show save feedback');assert.equal(state,'saving');await new Promise(resolve=>setImmediate(resolve));assert.equal(state,'saved');context.confirmCompletion();assert.equal(calls,1,'repeated confirmation must not save twice');
}
console.log('PASS: story, match, guess and test show completion feedback and save once.');})();
