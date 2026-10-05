// 运行：node --test tests/build.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { build, buildSitemap, SITE_URL } from "../scripts/build-properties.mjs";
import { GENERATED_MARKER } from "../scripts/property-page-template.mjs";

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
  fs.writeFileSync(path.join(root, "sitemap.xml"), `<urlset><url><loc>${SITE_URL}</loc></url><url><loc>${SITE_URL}properties/old-house/</loc></url></urlset>`);
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
  assert.ok(sitemap.includes(`<loc>${SITE_URL}</loc>`), "非房源网址要保留");
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
  fs.mkdirSync(path.join(tmp, "data"));
  fs.copyFileSync(path.join(repoRoot, "sitemap.xml"), path.join(tmp, "sitemap.xml"));
  const { problems } = build(tmp, quiet);
  assert.deepEqual(problems, []);
});

test("sitemap: 房源网址按 slug 产生", () => {
  const xml = buildSitemap(`<loc>${SITE_URL}areas/</loc>`, ["a", "b"]);
  assert.match(xml, /areas\/<\/loc>[\s\S]*properties\/a\/[\s\S]*properties\/b\//);
});
