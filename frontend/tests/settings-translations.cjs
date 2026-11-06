const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  vm = require("node:vm"),
  path = require("node:path"),
  ts = require("typescript"),
  React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
function compile(source, extra = {}) {
  const ctx = {
    exports: {},
    require,
    URL,
    URLSearchParams,
    Intl,
    Date,
    crypto: globalThis.crypto,
    ...extra,
  };
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    ctx,
  );
  return ctx.exports;
}
const copy = compile(fs.readFileSync("src/lib/settingsCopy.ts", "utf8"));
const locales = [
  "tr",
  "en",
  "es",
  "pt",
  "fr",
  "de",
  "it",
  "ar",
  "hi",
  "id",
  "ru",
  "bn",
  "ur",
  "vi",
  "fil",
];
for (const locale of locales) {
  assert.deepEqual(
    Object.keys(copy.SETTINGS_COPY[locale]).sort(),
    Object.keys(copy.SETTINGS_COPY.en).sort(),
  );
  for (const value of Object.values(copy.SETTINGS_COPY[locale]))
    assert.ok(typeof value === "string" && value.trim());
  const phrase = copy.SETTINGS_COPY[locale].deletePhrase;
  assert.ok(copy.isDeletionConfirmation(" " + phrase + " ", locale));
  assert.ok(copy.isDeletionConfirmation(phrase.toLocaleLowerCase(locale), locale));
  assert.ok(!copy.isDeletionConfirmation("", locale));
  assert.ok(!copy.isDeletionConfirmation("yes", locale));
  assert.equal(
    copy.settingsFeedback(locale, "raw database error"),
    copy.SETTINGS_COPY[locale].saveError,
  );
}
assert.equal(copy.DELETION_CONFIRMATION_TOKEN, "HESABIMI SİL");
let activeLocale = "en";
let deletionFixture = null;
const baseProfile = {
  displayName: "Çağrı Özel",
  email: "qa@example.test",
  username: "creatorqa",
  bio: "Özgün bio aynen kalır",
  avatarUrl: "",
  avatarStyle: "classic",
  avatarBg: "violet",
  avatarZoom: 1,
  avatarX: 50,
  avatarY: 50,
  avatarFrame: true,
  emailVerified: true,
  provider: "email",
  createdAt: "2026-11-01T12:00:00Z",
  lastSignInAt: "2026-11-02T12:00:00Z",
};
const i18n = compile(fs.readFileSync("src/lib/i18n.ts", "utf8"));
function instrument(source) {
  const f = ts.createSourceFile(
    "route.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const edits = [];
  function visit(n) {
    if (
      ts.isCallExpression(n) &&
      n.expression.getText(f) === "useState" &&
      ts.isVariableDeclaration(n.parent)
    ) {
      const first = n.arguments[0];
      if (first)
        edits.push([
          n.getStart(f),
          first.getStart(f),
          "qaState(" + JSON.stringify(n.parent.name.getText(f)) + ", ",
        ]);
    }
    ts.forEachChild(n, visit);
  }
  visit(f);
  for (const [a, b, v] of edits.sort((a, b) => b[0] - a[0]))
    source = source.slice(0, a) + v + source.slice(b);
  return source;
}
function qaState(name, initial) {
  const stateKey = name.replace(/\s/g, "").slice(1).split(",")[0];
  const chosen =
    stateKey === "confirmationText" && deletionFixture !== null ? deletionFixture :
    stateKey === "loading"
      ? false
      : ["account", "profile"].includes(stateKey)
        ? baseProfile
        : typeof initial === "function"
          ? initial()
          : initial;
  return React.useState(chosen);
}
const hook = () => ({
  locale: activeLocale,
  sc: (text) => copy.settingsText(activeLocale, text),
  feedback: (text) => copy.settingsFeedback(activeLocale, text),
});
const jsxLink = ({ to, children, ...props }) =>
  React.createElement("a", { ...props, href: to }, children);
const defaultAvatar = {
  avatarStyle: "classic",
  avatarBg: "violet",
  avatarZoom: 1,
  avatarX: 50,
  avatarY: 50,
  avatarFrame: true,
  avatarUrl: "",
};
function loadRoute(file) {
  const source = instrument(fs.readFileSync(file, "utf8"));
  return compile(source, {
    qaState,
    require: (spec) => {
      if (spec === "@/lib/useSettingsCopy") return { useSettingsCopy: hook };
      if (spec === "@/lib/settingsCopy") return copy;
      if (spec === "@/lib/i18n")
        return {
          ...i18n,
          useAqryoLocale: () => ({
            locale: activeLocale,
            t: (key) => i18n.translate(activeLocale, key),
          }),
        };
      if (spec === "@tanstack/react-router")
        return { createFileRoute: () => (options) => ({ options }), Link: jsxLink };
      if (spec === "react") return { ...React, useEffect: () => {} };
      if (spec === "@/components/CreatorNavigation") return { CreatorNavigation: () => null };
      if (spec === "@/components/creator/CreatorAvatar") return { CreatorAvatar: () => null };
      if (spec === "@/components/creator/AvatarCustomizer") return { AvatarCustomizer: () => null };
      if (spec === "@/services/creatorAvatar")
        return { defaultCreatorAvatarSettings: defaultAvatar };
      if (spec === "@/services/anonymousInbox") return { getUnreadAnonymousCount: () => 0 };
      if (spec === "@/services/pushNotifications")
        return { getPushSupport: () => ({ supported: true, configured: true, isIos: false }) };
      if (spec.startsWith("@/services/"))
        return new Proxy({}, { get: () => () => Promise.resolve(null) });
      return require(spec);
    },
  });
}
const pages = [
  "account",
  "profile",
  "privacy",
  "security",
  "legal",
  "delete-account",
  "payments",
  "earnings",
  "notifications",
];
const loaded = pages.map((page) => [
  page,
  loadRoute("src/routes/creator-" + page + ".tsx").Route.options.component,
]);
for (const locale of locales) {
  activeLocale = locale;
  for (const [page, Component] of loaded) {
    let html;
    try {
      html = renderToStaticMarkup(React.createElement(Component));
    } catch (error) {
      console.error(page, locale);
      throw error;
    }
    assert.ok(html.length > 100, page + " " + locale);
    if (locale !== "tr") {
      for (const raw of [
        "Hesabım",
        "Güvenlik",
        "Hesabı sil",
        "Gizlilik ve izinler",
        "Kazançlar",
        "Ödemeler",
        "Şifreni değiştir",
        "Verilerini dışa aktar",
        "Yeni mesajı kaçırma.",
      ])
        assert.ok(!html.includes(raw), page + " " + locale + " leaked " + raw);
    }
    if (["account", "profile"].includes(page))
      assert.ok(html.includes("Çağrı Özel"), "Authored profile name must not be translated");
  }
}
const avatarModule = loadRoute("src/components/creator/AvatarCustomizer.tsx");
for (const locale of locales) {
  activeLocale = locale;
  const html = renderToStaticMarkup(
    React.createElement(avatarModule.AvatarCustomizer, {
      value: defaultAvatar,
      onChange() {},
      displayName: "Çağrı Özel",
      bio: "Özgün bio aynen kalır",
    }),
  );
  assert.ok(html.includes(copy.SETTINGS_COPY[locale].avatarEdit));
  assert.ok(html.includes("Çağrı Özel"));
  assert.ok(html.includes("Özgün bio aynen kalır"));
  if (locale !== "tr")
    for (const raw of [
      "Profil görselini düzenle",
      "Konumu sıfırla",
      "Yüzü dairenin merkezinde",
      "Çerçeveli",
    ])
      assert.ok(!html.includes(raw), "avatar " + locale + " leaked " + raw);
}
console.log("PASS: avatar controls in 15 languages retain authored profile text.");
console.log(
  "PASS: complete settings copy, localized deletion confirmation, unchanged service token and 135 loaded account/settings renders in 15 languages.",
);

const deletionPage = loaded.find(([page]) => page === "delete-account")[1];
for (const locale of locales) {
  activeLocale = locale;
  deletionFixture = "";
  const invalid = renderToStaticMarkup(React.createElement(deletionPage));
  deletionFixture = copy.SETTINGS_COPY[locale].deletePhrase;
  const valid = renderToStaticMarkup(React.createElement(deletionPage));
  const requestButton = html => [...html.matchAll(/<button\b[^>]*>/g)].map(match => match[0]).find(tag => tag.includes("bg-red-600"));
  assert.ok(/\sdisabled(?:=|\s|>)/.test(requestButton(invalid)), locale + " empty confirmation");
  assert.ok(!/\sdisabled(?:=|\s|>)/.test(requestButton(valid)), locale + " correct localized confirmation");
}
deletionFixture = null;
console.log("PASS: deletion request stays disabled until the displayed localized phrase is entered; no requests are submitted.");
