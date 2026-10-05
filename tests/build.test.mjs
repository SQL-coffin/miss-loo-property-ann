// 运行：node --test tests/build.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { build, buildSitemap, localize, splitLocales, SITE_URL } from "../scripts/build-properties.mjs";
import { GENERATED_MARKER } from "../scripts/property-page-template.mjs";
import { translatePage, findSourcePages } from "../scripts/i18n-pages.mjs";

const listing = {
  title: "Renovated Terrace",
  listingType: "sale",
  propertyType: "terrace",
  area: "Tampoi",
  location: "Taman Gembira, Tampoi",
  address: "46, Jalan Riang 2, Taman Gembira, Tampoi, Johor",
  city: "Johor Bahru",
  price: 558000,
  bedrooms: 3,
  bathrooms: 3,
  landSize: "22' × 70'",
  photos: [{ image: "front.webp", alt: "Front", caption: "Front exterior" }],
  dateAdded: "2026-10-01",
};

function makeSite(listings, extra = () => {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "site-"));
  fs.mkdirSync(path.join(root, "data"));
  fs.writeFileSync(path.join(root, "sitemap.xml"), `<urlset><url><loc>${SITE_URL}properties/old-house/</loc></url></urlset>`);
  fs.mkdirSync(path.join(root, "i18n"));
  fs.writeFileSync(path.join(root, "i18n", "zh.json"), JSON.stringify({ Home: "首页" }));
  fs.writeFileSync(path.join(root, "i18n", "ms.json"), JSON.stringify({ Home: "Laman Utama" }));
  fs.writeFileSync(path.join(root, "index.html"), `<html lang="en"><head>\n<link rel="stylesheet" href="style.css"></head><body><header class="site-header"><nav><a href="properties/">Home</a></nav></header></body></html>`);
  for (const [slug, data, photos = ["front.webp"]] of listings) {
    const dir = path.join(root, "properties", slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "listing.json"), JSON.stringify(data));
    photos.forEach((p) => fs.writeFileSync(path.join(dir, p), ""));
  }
  fs.mkdirSync(path.join(root, "properties"), { recursive: true });
  extra(root);
  return root;
}

const quiet = { log: () => {}, warn: () => {} };
const read = (root, ...p) => fs.readFileSync(path.join(root, ...p), "utf8");

test("build: 生成详情页、卡片资料、sitemap", () => {
  const root = makeSite([["taman-gembira", listing]]);
  const result = build(root, quiet);
  assert.equal(result.listings, 1);

  const page = read(root, "properties", "taman-gembira", "index.html");
  assert.ok(page.includes(GENERATED_MARKER));
  assert.ok(page.includes("<h1>Renovated Terrace</h1>"));
  assert.ok(page.includes("RM558,000"));
  assert.ok(page.includes(`<meta property="og:image" content="${SITE_URL}properties/taman-gembira/front.webp">`));

  const cards = JSON.parse(read(root, "data", "properties.json"));
  assert.equal(cards[0].image, "taman-gembira/front.webp");
  assert.equal(cards[0].url, "taman-gembira/");

  const sitemap = read(root, "sitemap.xml");
  assert.ok(sitemap.includes(`${SITE_URL}properties/taman-gembira/`));
  assert.ok(sitemap.includes(`${SITE_URL}zh/properties/taman-gembira/`));
  assert.ok(sitemap.includes(`<loc>${SITE_URL}</loc>`), "固定页面要列出");
  assert.ok(sitemap.includes(`<loc>${SITE_URL}ms/</loc>`), "固定页面的语言版本要列出");
  assert.ok(!sitemap.includes("old-house"), "已不存在的房源要移除");
});

test("build: 恶意内容会被转义，不会变成 HTML / 脚本", () => {
  const evil = '<script>alert(1)</script>"><img src=x onerror=alert(1)>';
  const root = makeSite([["evil", { ...listing, title: evil, description: evil, features: [{ title: evil }] }]]);
  build(root, quiet);
  const page = read(root, "properties", "evil", "index.html");
  assert.ok(!page.includes("<script>alert"));
  assert.ok(!page.includes("<img src=x"));
});

test("build: 有问题的房源会被跳过，其他照常生成", () => {
  const root = makeSite([
    ["good", listing],
    ["no-photo-file", listing, []],
    ["bad-price", { ...listing, price: "RM558,000" }],
    ["bad-facebook", { ...listing, facebookUrl: "javascript:alert(1)" }],
    ["Bad Folder", listing],
  ]);
  const { listings, problems } = build(root, quiet);
  assert.equal(listings, 1);
  assert.ok(problems.some((p) => p.startsWith("no-photo-file") && p.includes("找不到照片")));
  assert.ok(problems.some((p) => p.startsWith("bad-price") && p.includes("price")));
  assert.ok(problems.some((p) => p.startsWith("bad-facebook")));
  assert.ok(problems.some((p) => p.startsWith("Bad Folder")));
  assert.ok(!fs.existsSync(path.join(root, "properties", "bad-price", "index.html")));
});

test("build: 删除 listing.json 后，只删除自动生成的页面", () => {
  const root = makeSite([], (r) => {
    fs.mkdirSync(path.join(r, "properties", "deleted"), { recursive: true });
    fs.writeFileSync(path.join(r, "properties", "deleted", "index.html"), GENERATED_MARKER);
    fs.mkdirSync(path.join(r, "properties", "handmade"), { recursive: true });
    fs.writeFileSync(path.join(r, "properties", "handmade", "index.html"), "<h1>hand written</h1>");
  });
  build(root, quiet);
  assert.ok(!fs.existsSync(path.join(root, "properties", "deleted", "index.html")));
  assert.ok(fs.existsSync(path.join(root, "properties", "handmade", "index.html")));
});

test("build: 仓库里现有的房源全部通过检查", () => {
  const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "repo-"));
  fs.cpSync(path.join(repoRoot, "properties"), path.join(tmp, "properties"), { recursive: true });
  fs.cpSync(path.join(repoRoot, "i18n"), path.join(tmp, "i18n"), { recursive: true });
  for (const page of findSourcePages(repoRoot)) {
    fs.mkdirSync(path.dirname(path.join(tmp, page)), { recursive: true });
    fs.copyFileSync(path.join(repoRoot, page), path.join(tmp, page));
  }
  fs.mkdirSync(path.join(tmp, "data"));
  fs.copyFileSync(path.join(repoRoot, "sitemap.xml"), path.join(tmp, "sitemap.xml"));
  const warnings = [];
  const { problems } = build(tmp, { log: () => {}, warn: (w) => warnings.push(w) });
  assert.deepEqual(problems, []);
  assert.deepEqual(warnings, [], "所有固定页面的句子都要有中文和马来文翻译");
});

test("sitemap: 固定页面 + 房源，三种语言", () => {
  const xml = buildSitemap(["", "areas/"], ["a"]);
  for (const prefix of ["", "zh/", "ms/"]) {
    for (const p of ["", "areas/", "properties/a/"]) assert.ok(xml.includes(`<loc>${SITE_URL}${prefix}${p}</loc>`), prefix + p);
  }
});

test("多语言房源：生成三种语言的详情页，没翻译的栏位用英文", () => {
  const root = makeSite([["taman-gembira", {
    en: { ...listing, description: "English description", whatsappMessage: "Hi custom" },
    zh: { title: "翻新排屋", photos: [{ image: "front.webp", caption: "正面" }] },
  }]]);
  build(root, quiet);
  const zh = read(root, "zh", "properties", "taman-gembira", "index.html");
  assert.ok(zh.includes('<html lang="zh-Hans">'));
  assert.ok(zh.includes("<h1>翻新排屋</h1>"));
  assert.ok(zh.includes("English description"), "没翻译的介绍用英文");
  assert.ok(zh.includes('src="../../../properties/taman-gembira/front.webp"'), "照片指向英文版的文件夹");
  assert.ok(zh.includes("<figcaption>正面</figcaption>"));
  assert.ok(!zh.includes("Hi%20custom"), "英文的 WhatsApp 讯息不沿用到中文");
  const ms = read(root, "ms", "properties", "taman-gembira", "index.html");
  assert.ok(ms.includes("<h1>Renovated Terrace</h1>"), "没有马来文翻译时整页用英文");
  const cards = JSON.parse(read(root, "data", "properties.json"));
  assert.equal(cards[0].i18n.zh.title, "翻新排屋");
});

test("localize: 列表按位置合并，空白栏位用英文", () => {
  const t = splitLocales({ en: { a: "A", list: [{ x: "1", y: "2" }] }, zh: { a: "", list: [{ x: "一" }] } });
  assert.deepEqual(localize(t, "zh"), { a: "A", list: [{ x: "一", y: "2" }] });
  assert.deepEqual(splitLocales({ title: "old" }), { en: { title: "old" } }, "旧格式当英文");
});

test("translatePage: 翻译文字和属性，修正资源路径，网页链接不变", () => {
  const html = `<html lang="en"><head><meta name="description" content="Hello"><meta name="robots" content="Hello"><link rel="stylesheet" href="../style.css"><script type="module" src="../js/a.js"></script></head>
<body><a href="../buy/">Hello</a><img src="../logo.jpg" alt="Hello"><input placeholder="Missing one"><a href="https://wa.me/1">Hello</a><a href="#top">1</a></body></html>`;
  const missing = new Set();
  const out = translatePage(html, { dict: { Hello: "你好 <b>" }, lang: "zh", relPath: "properties/index.html", missing });
  assert.ok(out.includes('<html lang="zh-Hans">'));
  assert.ok(out.includes('<meta name="description" content="你好 &lt;b&gt;">'));
  assert.ok(out.includes('<meta name="robots" content="Hello">'), "其他 meta 不能动");
  assert.ok(out.includes('href="../../style.css"') && out.includes('src="../../js/a.js"') && out.includes('src="../../logo.jpg"'));
  assert.ok(out.includes('<a href="../buy/">你好 &lt;b&gt;</a>'), "网页链接留在同一语言");
  assert.ok(out.includes('href="https://wa.me/1"') && out.includes('href="#top"'));
  assert.deepEqual([...missing], ["Missing one"]);
});
