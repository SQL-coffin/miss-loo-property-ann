// 运行：node --test tests/build.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { build, buildSitemap, localize, splitLocales, SITE_URL } from "../scripts/build-properties.mjs";
import { GENERATED_MARKER } from "../scripts/property-page-template.mjs";
import { translatePage, findSourcePages, CSP, GA_MEASUREMENT_ID } from "../scripts/i18n-pages.mjs";

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
  assert.ok(page.includes('<meta property="og:image:alt" content="Front">'));
  const waLinks = page.match(/href="https:\/\/wa\.me\/[^"]*"/g);
  assert.ok(waLinks.length >= 3 && waLinks.every((h) => h.includes("?text=Hi%20Miss%20Loo")), "每个 WhatsApp 按钮都带房源讯息");

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

test("translatePage: WhatsApp 预填讯息按对照表翻译（可含换行），缺翻译时保留英文并列出", () => {
  const wa = (text) => `https://wa.me/60123?text=${encodeURIComponent(text)}`;
  const html = `<a href="${wa("Hi\nArea:")}">x</a><a href="${wa("Untranslated")}">y</a><a href="https://wa.me/60123">z</a>`;
  const missing = new Set();
  const out = translatePage(html, { dict: { "Hi\nArea:": "你好\n地区：" }, lang: "zh", relPath: "index.html", missing });
  assert.ok(out.includes(`href="${wa("你好\n地区：")}"`));
  assert.ok(out.includes(`href="${wa("Untranslated")}"`));
  assert.ok(out.includes('href="https://wa.me/60123"'));
  assert.deepEqual([...missing].filter((k) => k !== "x" && k !== "y" && k !== "z"), ["Untranslated"]);
});

test("固定网页：都有分享预览图，WhatsApp 讯息都有中文 / 马来文翻译", () => {
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
  for (const rel of findSourcePages(root)) {
    const html = read(root, rel);
    assert.ok(html.includes(`<meta property="og:image" content="${SITE_URL}share.jpg">`), `${rel} 缺 og:image`);
    for (const lang of ["zh", "ms"]) {
      const missing = new Set();
      translatePage(html, { dict: JSON.parse(read(root, "i18n", `${lang}.json`)), lang, relPath: rel, missing });
      const waMissing = [...missing].filter((k) => k.startsWith("Hi Miss Loo"));
      assert.deepEqual(waMissing, [], `${rel} 的 WhatsApp 讯息缺 ${lang} 翻译`);
    }
  }
  assert.ok(fs.existsSync(path.join(root, "share.jpg")));
});

test("流量统计：所有网页（三种语言、房源页）都加载 GA4，CSP 统一并放行 Google Analytics", () => {
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
  assert.match(GA_MEASUREMENT_ID, /^G-[A-Z0-9]+$/);
  assert.ok(CSP.includes("script-src 'self' https://*.googletagmanager.com"));
  assert.ok(!CSP.includes("unsafe-inline"), "不能放行内联脚本");
  const pages = findSourcePages(root).flatMap((rel) => [rel, `zh/${rel}`, `ms/${rel}`]);
  for (const slug of fs.readdirSync(path.join(root, "properties"))) {
    if (fs.existsSync(path.join(root, "properties", slug, "listing.json"))) pages.push(`properties/${slug}/index.html`, `zh/properties/${slug}/index.html`, `ms/properties/${slug}/index.html`);
  }
  for (const rel of pages) {
    const html = read(root, rel);
    assert.ok(html.includes(`<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>`), `${rel} 缺 gtag.js`);
    assert.match(html, /<script type="module" src="(\.\.\/)*js\/analytics\.js"><\/script>/, `${rel} 缺 analytics.js`);
    assert.ok(html.includes(`content="${CSP}"`), `${rel} 的 CSP 不是统一版本`);
    assert.ok(!/<script>[^<]/.test(html), `${rel} 有内联脚本，会被 CSP 拦截`);
  }
});

test("Search Console 验证文件和首页验证标签都还在", () => {
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
  assert.equal(read(root, "google4ef97c57744e95ce.html"), "google-site-verification: google4ef97c57744e95ce.html");
  assert.ok(read(root, "index.html").includes('<meta name="google-site-verification" content="3kCczUhbU_rNEZhTKpt11mSz3-XxEYbLwh5sTLIzfLE" />'));
});

const ldJson = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));

test("结构化数据：房源页是 RealEstateListing + 房屋 + 面包屑，出租标月租，房屋类型对应 schema.org", () => {
  const root = makeSite([
    ["taman-gembira", listing],
    ["sky-condo", { ...listing, title: "Sky Condo", listingType: "rent", propertyType: "condo", price: 1800 }],
    ["kulai-land", { ...listing, title: "Kulai Land", propertyType: "land" }],
  ]);
  build(root, quiet);
  const graph = (slug, lang = "") => ldJson(read(root, lang, "properties", slug, "index.html"))[0]["@graph"];
  const byType = (g, t) => g.find((n) => n["@type"] === t);

  const sale = graph("taman-gembira");
  const ld = byType(sale, "RealEstateListing");
  assert.equal(ld.url, `${SITE_URL}properties/taman-gembira/`);
  assert.equal(ld.datePosted, "2026-10-01");
  assert.deepEqual(ld.image, [`${SITE_URL}properties/taman-gembira/front.webp`]);
  assert.equal(ld.offers.price, "558000");
  assert.equal(ld.offers.businessFunction["@id"], "http://purl.org/goodrelations/v1#Sell");
  assert.equal(ld.offers.offeredBy["@id"], `${SITE_URL}#agent`);
  assert.equal(byType(sale, "House").numberOfBedrooms, 3, "排屋是 House，有房间数");
  assert.equal(ld.about["@id"], byType(sale, "House")["@id"]);
  const crumbs = byType(sale, "BreadcrumbList").itemListElement;
  assert.deepEqual(crumbs.map((c) => c.item), [SITE_URL, `${SITE_URL}properties/`, `${SITE_URL}properties/taman-gembira/`]);

  const rent = byType(graph("sky-condo"), "RealEstateListing").offers;
  assert.equal(rent.businessFunction["@id"], "http://purl.org/goodrelations/v1#LeaseOut");
  assert.equal(rent.priceSpecification.unitCode, "MON");
  assert.ok(byType(graph("sky-condo"), "Apartment"), "公寓是 Apartment");
  const land = byType(graph("kulai-land"), "Place");
  assert.ok(land && land.numberOfBedrooms === undefined, "土地是 Place，不写房间数");

  const zhCrumbs = byType(graph("taman-gembira", "zh"), "BreadcrumbList").itemListElement;
  assert.deepEqual(zhCrumbs.map((c) => c.name).slice(0, 2), ["首页", "房源"]);
  assert.equal(zhCrumbs[0].item, `${SITE_URL}zh/`);
});

test("SEO：每一页刚好一个 canonical，指向自己；首页经纪人资料齐全", () => {
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
  const pages = findSourcePages(root).flatMap((rel) => [rel, `zh/${rel}`, `ms/${rel}`]);
  for (const slug of fs.readdirSync(path.join(root, "properties"))) {
    if (fs.existsSync(path.join(root, "properties", slug, "listing.json"))) pages.push(...["", "zh/", "ms/"].map((l) => `${l}properties/${slug}/index.html`));
  }
  for (const rel of pages) {
    const html = read(root, rel);
    const canon = [...html.matchAll(/<link rel="canonical" href="([^"]*)">/g)].map((m) => m[1]);
    assert.deepEqual(canon, [SITE_URL + rel.replace(/index\.html$/, "")], `${rel} 的 canonical`);
    assert.equal((html.match(/property="og:url"/g) || []).length, 1, `${rel} 的 og:url`);
    for (const data of ldJson(html)) assert.ok(data["@context"], `${rel} 的结构化数据`);
  }
  const agent = ldJson(read(root, "index.html"))[0];
  assert.equal(agent["@type"], "RealEstateAgent");
  assert.equal(agent["@id"], `${SITE_URL}#agent`);
  assert.equal(agent.url, SITE_URL);
  assert.equal(agent.telephone, "+60167889571");
  assert.ok(agent.sameAs.some((u) => u.includes("facebook.com")));
});

