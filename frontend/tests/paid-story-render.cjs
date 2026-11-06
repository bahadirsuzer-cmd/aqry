const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
for(const route of ['experience.$experienceId.tsx','creator-experiences_.$experienceId.tsx']){
 const source=fs.readFileSync('src/routes/'+route,'utf8');
 const file=ts.createSourceFile(route,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const declaration=file.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='PaidStoryContinuation');
 assert.ok(declaration);
 const context={exports:{},React,useState:React.useState,require};
 vm.runInNewContext(ts.transpileModule(declaration.getText(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,context);
 for(const premiumItems of [[],[{id:'t',type:'text',text:'Paid content test'}],[{id:'i',type:'image',imageUrl:'https://example.com/test.png'}]]){
 const html=renderToStaticMarkup(React.createElement(context.PaidStoryContinuation,{result:{kind:'story',offerTitle:'Offer test',premiumDescription:'No content fallback',premiumItems},onBack(){}}));
 assert.ok(html.includes(premiumItems.length?(premiumItems[0].type==='text'?'Paid content test':'https://example.com/test.png'):'No content fallback'));
 }
}
console.log('PASS: creator and participant paid story render text, images and empty fallback without undefined variables.');
