const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), ts = require('typescript');
function load(file, deps={}) { const exports={}; vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:name=>deps[name]}); return exports; }
const {fitMessage}=load('src/lib/anonymousMessageCard.ts',{'./anonymousFormats':{}});
const {anonymousMessageLimit,characterCount}=load('src/lib/anonymousMessageLimits.ts');
assert.equal(anonymousMessageLimit('question'),160); assert.equal(anonymousMessageLimit('confession'),750);
assert.equal(characterCount('😀İ'),2);
const context={font:'',measureText(text){return {width:Array.from(text).length*parseFloat(this.font.split(' ')[1])*0.6}}};
for(const text of ['İtirafım bu. '.repeat(63).slice(0,750),'x'.repeat(3000),'😀'.repeat(750),'ilk\nsatır\n\nson','مرحبا '.repeat(125),'bir iki üç '.repeat(180)]) {
 const fitted=fitMessage(context,text,872,1230);
 assert.equal(fitted.lines.join(''),text.replace(/\n/g,''),'must preserve all content');
 assert.ok(fitted.lines.length*fitted.lineHeight<=1230);
 assert.ok(fitted.lines.every(line=>context.measureText(line).width<=872));
}
console.log('PASS: limits, Unicode, complete wrapping, old long text, newlines, RTL and bounds.');
