const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const exportsObject = {};
const source = ts.transpileModule(fs.readFileSync("src/lib/storyItems.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
vm.runInNewContext(source, { exports: exportsObject });
const { reflowStoryItems, placeStoryImage, imageTextPosition } = exportsObject;
const text = (id, value) => ({ id, type: "text", text: value });
const image = id => ({ id, type: "image", imageUrl: "https://example.com/" + id + ".jpg" });
const originals = [image("cover-scene"), text("first", "First page"), image("middle-scene"), image("second-middle"), text("second", "Second page"), image("ending-scene")];
const ids = items => Array.from(items, item => item.id);
const expanded = reflowStoryItems(originals, ["Edited page one", "Edited page two", "New page three"]);
assert.deepEqual(ids(expanded), ["cover-scene", "story-page-0", "middle-scene", "second-middle", "story-page-1", "ending-scene", "story-page-2"]);
assert.equal(imageTextPosition(expanded, "middle-scene"), 1);
const shortened = reflowStoryItems(originals, ["Only one page now"]);
assert.deepEqual(ids(shortened), ["cover-scene", "story-page-0", "middle-scene", "second-middle", "ending-scene"]);
const withoutText = reflowStoryItems(originals, []);
assert.deepEqual(ids(withoutText), ["cover-scene", "middle-scene", "second-middle", "ending-scene"]);
assert.ok(withoutText.every(item => item.type === "image" && item.imageUrl));
const moved = placeStoryImage(originals, "ending-scene", 1);
assert.deepEqual(ids(moved), ["cover-scene", "first", "middle-scene", "second-middle", "ending-scene", "second"]);
assert.equal(imageTextPosition(moved, "ending-scene"), 1);
assert.equal(imageTextPosition(placeStoryImage(originals, "ending-scene", 0), "ending-scene"), 0);
assert.equal(imageTextPosition(placeStoryImage(originals, "middle-scene", 999), "middle-scene"), 2);
assert.deepEqual(ids(originals), ["cover-scene", "first", "middle-scene", "second-middle", "second", "ending-scene"]);
const restored = JSON.parse(JSON.stringify(moved));
assert.deepEqual(ids(reflowStoryItems(restored, ["One", "Two"])), ["cover-scene", "story-page-0", "middle-scene", "second-middle", "ending-scene", "story-page-1"]);
assert.equal(imageTextPosition([text("blank", ""), image("photo")], "photo"), 0);
console.log("PASS: images retained through text edits, shrinking/clearing pages, before/between/after positions, stable ordering and saved draft restore.");

const route = ts.createSourceFile("story-builder.tsx", fs.readFileSync("src/routes/story-builder.tsx", "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let uploadFunction;
function find(node) { if (ts.isFunctionDeclaration(node) && node.name?.text === "uploadQuickImages") uploadFunction = node; ts.forEachChild(node, find); }
find(route);
assert.ok(uploadFunction);
const uploadSource = ts.createPrinter().printNode(ts.EmitHint.Unspecified, uploadFunction, route) + "\nglobalThis.runUpload = uploadQuickImages;";
let draft, calls, uploadError, uploading;
const context = {
  creatorId: "creator", publishing: false, uploadingId: null, locale: "tr",
  quickUploadRef: { current: false }, crypto: { randomUUID: () => "uploaded-" + calls },
  setState: update => { draft = update(draft); },
  setQuickUploadError: value => { uploadError = value; },
  setUploadingId: value => { uploading = value; context.uploadingId = value; },
  uploadExperienceImage: async (_creator, file) => { calls++; if (file.name === "fail") throw new Error("upload failed"); return { publicUrl: "https://example.com/" + file.name }; },
};
vm.runInNewContext(ts.transpileModule(uploadSource, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, context);
const reset = () => { draft = { sourceText: "My entire story", items: [text("first", "First page")] }; calls = 0; uploadError = ""; uploading = null; context.uploadingId = null; context.quickUploadRef.current = false; };
const file = name => ({ name, type: "image/jpeg", size: 1000 });
(async () => {
  reset();
  await context.runUpload([file("first.jpg"), file("second.jpg")]);
  assert.equal(calls, 2); assert.equal(draft.sourceText, "My entire story");
  assert.deepEqual(Array.from(draft.items.filter(item => item.type === "image"), item => item.imageUrl), ["https://example.com/first.jpg", "https://example.com/second.jpg"]);
  assert.equal(uploading, null); assert.equal(context.quickUploadRef.current, false);
  reset();
  await context.runUpload([{ ...file("invalid"), type: "image/gif" }]);
  assert.equal(calls, 0); assert.ok(uploadError);
  reset();
  await context.runUpload([{ ...file("large"), size: 8 * 1024 * 1024 + 1 }]);
  assert.equal(calls, 0); assert.ok(uploadError);
  reset();
  await context.runUpload([file("first.jpg"), file("fail"), file("third.jpg")]);
  assert.equal(calls, 2); assert.equal(draft.items.length, 2); assert.ok(uploadError);
  assert.equal(uploading, null); assert.equal(context.quickUploadRef.current, false);
  reset(); context.quickUploadRef.current = true;
  await context.runUpload([file("duplicate")]); assert.equal(calls, 0);
  console.log("PASS: actual upload handler validates files, keeps order/text, retains partial success and blocks concurrent uploads.");
})().catch(error => { console.error(error); process.exit(1); });
