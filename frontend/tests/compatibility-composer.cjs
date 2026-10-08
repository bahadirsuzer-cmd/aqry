const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');
const root = path.resolve(__dirname, '../src');
const context = { exports: {}, Math, Set, JSON, Error };
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, 'lib/compatibilityComposer.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
const { compatibilityInputError, compatibilityGenerationPrompt, prepareCompatibilityBlueprint } = context.exports;
const inputs = Array.from({ length: 5 }, (_, i) => ({ question: `Soru ${i + 1}?`, answer: `Tercihim ${i + 1}` }));
const bands = [[0,19],[20,39],[40,59],[60,79],[80,100]];
const blueprint = () => ({ version: 1, type: 'compatibility', title: 'Konu', description: 'Konuya özel açıklama', tone: 'fun', questions: inputs.map((input, i) => ({ id: `q${i+1}`, text: input.question, options: [input.answer, 'Farklı tercih', 'Başka bir tercih'].map((text, n) => ({ id: `q${i+1}_${n}`, text, signals: [{ key: 'preference', weight: n / 2 }], meaning: text })) })), resultModel: { mode: 'similarity', profiles: bands.map(([minScore, maxScore], i) => ({ id: `band${i}`, title: `Sonuç ${i}`, description: `Yüzdeye uygun konu yorumu ${i}`, minScore, maxScore })) }, compatibility: { creatorAnswers: Object.fromEntries(inputs.map((_,i) => [`q${i+1}`,`q${i+1}_0`])) } });

assert.equal(compatibilityInputError('Konu', inputs), null);
assert.equal(compatibilityInputError('', inputs), 'title');
assert.equal(compatibilityInputError('Konu', inputs.slice(0,4)), 'count');
assert.equal(compatibilityInputError('Konu', [...inputs,...inputs,{question:'x',answer:'y'}]), 'count');
assert.equal(compatibilityInputError('Konu', [{question:'',answer:'a'},...inputs.slice(1)]), 'incomplete');
assert.throws(() => compatibilityGenerationPrompt('Konu', Array.from({length:10}, () => ({question:'q'.repeat(240),answer:'a'.repeat(240)})), 'tr'), /INPUT_TOO_LONG/);
assert.ok(compatibilityGenerationPrompt('Konu', Array.from({length:10}, () => ({question:'q'.repeat(160),answer:'a'.repeat(160)})), 'tr').length <= 5000);

const output = prepareCompatibilityBlueprint(blueprint(), inputs, () => 0);
for (const [index, question] of output.questions.entries()) {
  assert.equal(question.text, inputs[index].question);
  assert.equal(question.options[output.creatorAnswers[question.id]], inputs[index].answer);
  assert.notEqual(output.creatorAnswers[question.id], 0, 'Reference position must follow the shuffle');
}
for (let score = 0; score <= 100; score++) assert.equal(output.results.filter(result => { const [min,max] = result.range.match(/\d+/g).map(Number); return score >= min && score <= max; }).length, 1);
const missing = blueprint(); missing.questions[0].options[0].text = 'Changed reference';
assert.throws(() => prepareCompatibilityBlueprint(missing, inputs), /INVALID_GENERATION/);
const duplicate = blueprint(); duplicate.questions[0].options[1].text = inputs[0].answer;
assert.throws(() => prepareCompatibilityBlueprint(duplicate, inputs), /INVALID_GENERATION/);
const gap = blueprint(); gap.resultModel.profiles[0].maxScore = 18;
assert.throws(() => prepareCompatibilityBlueprint(gap, inputs), /INVALID_GENERATION/);
const wrongType = blueprint(); wrongType.type = 'test';
assert.throws(() => prepareCompatibilityBlueprint(wrongType, inputs), /INVALID_GENERATION/);

// Exercise the unchanged participant runtime against the adapter's shuffled answer map.
const source = fs.readFileSync(path.join(root, 'routes/experience.$experienceId.tsx'), 'utf8');
const file = ts.createSourceFile('runtime.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const scoring = file.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'calculateCompatibilityScore');
assert.ok(scoring);
const scoreContext = { Math };
vm.runInNewContext(ts.transpileModule(scoring.getText(file), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, scoreContext);
assert.equal(scoreContext.calculateCompatibilityScore(output.questions, output.creatorAnswers, output.creatorAnswers), 100);
const different = Object.fromEntries(output.questions.map(q => [q.id, (output.creatorAnswers[q.id]+1)%q.options.length]));
assert.equal(scoreContext.calculateCompatibilityScore(output.questions, output.creatorAnswers, different), 0);
const mixed = {...different, 1: output.creatorAnswers[1], 2: output.creatorAnswers[2]};
assert.equal(scoreContext.calculateCompatibilityScore(output.questions, output.creatorAnswers, mixed), 40);
console.log('PASS: input bounds, exact references after shuffling, complete result bands, invalid generations, participant scores 0/40/100.');
