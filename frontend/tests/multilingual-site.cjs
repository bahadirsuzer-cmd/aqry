const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');
const cache = new Map();
const browser = {};
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  const exports = {}; cache.set(file, exports);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const context = { exports, require: spec => spec.startsWith('.') ? load(path.resolve(path.dirname(file), spec + (path.extname(spec) ? '' : '.ts'))) : require(spec), URL, URLSearchParams, Request, Response, ...browser };
  vm.runInNewContext(code, context, { filename: file });
  return exports;
}
const storage = new Map();
browser.window = { navigator: { languages: ['nl-NL', 'es-ES'], language: 'nl-NL' }, location: { search: '' }, localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v) } };
const i18n = load('src/lib/i18n.ts');
assert.equal(i18n.detectLocale(), 'es', 'Skip unsupported primary device languages');
browser.window.location.search='?lang=ar';assert.equal(i18n.detectLocale(),'ar');
browser.window.location.search='';assert.equal(i18n.detectLocale(),'ar','Keep explicit selection');
assert.equal(i18n.localizedPath('/#how-it-works','tr'),'/?lang=tr#how-it-works');
assert.equal(i18n.localizedPath('/creator-auth?next=%2Fpuzzle-builder','es'),'/creator-auth?next=%2Fpuzzle-builder&lang=es');
assert.equal(i18n.localizedPath('mailto:hey@buum-e.com','ar'),'mailto:hey@buum-e.com');
assert.equal(i18n.normalizeLocale('pt-BR'),'pt');assert.equal(i18n.normalizeLocale('unsupported'),'en');
const dictionaries = ['participantUiCopy:PARTICIPANT_UI_COPY','puzzleUiCopy:PUZZLE_UI_COPY','authCopy:AUTH_COPY','publicCopy:PUBLIC_COPY','anonymousBuilderCopy:ANONYMOUS_BUILDER_COPY','flowEditorCopy:FLOW_EDITOR_COPY','resetPasswordCopy:RESET_PASSWORD_COPY'];
for(const item of dictionaries){const [file,key]=item.split(':');const dict=load('src/lib/'+file+'.ts')[key];const keys=Object.keys(dict.en).sort();for(const [lang] of i18n.AQRYO_LANGUAGES){assert.deepEqual(Object.keys(dict[lang]).sort(),keys,`${file}: missing ${lang} keys`);for(const value of Object.values(dict[lang]))assert.ok(typeof value==='string'&&value.trim(),`${file}: blank ${lang} copy`);}}
const packs=load('src/lib/visualPackCopy.ts');
const social=load('src/lib/homepage-social-preview.ts');
(async()=>{for(const [lang] of i18n.AQRYO_LANGUAGES){
 assert.ok(!packs.visualPackCopy(lang).contents.includes('Single'));
 const response=social.homepageSocialPreview(new Request('https://www.aqryo.com/?lang='+lang,{headers:{'user-agent':'Twitterbot/1.0'}}));
 assert.equal(response.status,200);const html=await response.text();assert.ok(html.includes(`lang="${lang}"`));assert.ok(html.includes(i18n.translate(lang,'studioTitle').replace(/&/g,'&amp;').replace(/'/g,'&#39;')));assert.ok(html.includes(`dir="${['ar','ur'].includes(lang)?'rtl':'ltr'}"`));
}
assert.equal(social.homepageSocialPreview(new Request('https://www.aqryo.com/pricing',{headers:{'user-agent':'Twitterbot'}})),null);
const head=social.homepageSocialPreview(new Request('https://www.aqryo.com/?lang=ar',{method:'HEAD',headers:{'user-agent':'Twitterbot'}}));assert.equal(await head.text(),'');
console.log('PASS: 15 complete locale dictionaries, device fallback, persistent choice, localized packs and crawler metadata/RTL.');})();
