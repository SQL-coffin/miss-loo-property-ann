/* ==================== 房源生成脚本 ====================
   读取 properties/<房源>/listing.json，自动生成：
     1. properties/<房源>/index.html   房源详情页（模板在 property-page-template.mjs）
     2. data/properties.json           搜索页、首页卡片用的资料
     3. sitemap.xml                    房源网址

   GitHub Action（.github/workflows/build-properties.yml）会在每次推送后自动运行。
   在自己电脑上运行：node scripts/build-properties.mjs

   listing.json 有问题时，该房源会被跳过并打印原因，其他房源照常生成。
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateProperty } from "../js/domain/property.js";
import { renderPropertyPage, GENERATED_MARKER } from "./property-page-template.mjs";

export const SITE_URL = "https://sql-coffin.github.io/miss-loo-property-ann/";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function build(root = ROOT, { log = console.log, warn = console.warn } = {}) {
  const propertiesDir = path.join(root, "properties");
  const listings = [];
  const problems = [];

  for (const slug of fs.readdirSync(propertiesDir).sort()) {
    const dir = path.join(propertiesDir, slug);
    const file = path.join(dir, "listing.json");
    if (!fs.statSync(dir).isDirectory()) continue;

    if (!fs.existsSync(file)) {
      removeOrphanPage(dir, slug, log);
      continue;
    }

    let data;
    try {
      data = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (err) {
      problems.push(`${slug}: listing.json 格式错误（${err.message}）`);
      continue;
    }

    const errors = validateListing(data, slug, dir);
    if (errors.length) {
      problems.push(...errors.map((e) => `${slug}: ${e}`));
      continue;
    }
    listings.push({ slug, data });
  }

  // 1. 详情页
  for (const { slug, data } of listings) {
    writeIfChanged(path.join(propertiesDir, slug, "index.html"), renderPropertyPage(data, { slug, siteUrl: SITE_URL }), log);
  }

  // 2. 搜索 / 首页资料（旧到新排列，和以前的 data/properties.json 一样）
  const cards = listings
    .map(({ slug, data }) => toCard(slug, data))
    .sort((a, b) => (a.dateAdded || "").localeCompare(b.dateAdded || "") || a.url.localeCompare(b.url));
  writeIfChanged(path.join(root, "data", "properties.json"), JSON.stringify(cards, null, 2) + "\n", log);

  // 3. sitemap：保留非房源网址，房源网址按 listing.json 重新产生
  const sitemapFile = path.join(root, "sitemap.xml");
  writeIfChanged(sitemapFile, buildSitemap(fs.readFileSync(sitemapFile, "utf8"), listings.map((l) => l.slug)), log);

  problems.forEach((p) => warn(`⚠️  已跳过 ${p}`));
  log(`完成：${listings.length} 间房源，${problems.length} 个问题`);
  return { listings: listings.length, problems };
}

export function validateListing(data, slug, dir) {
  if (!data || typeof data !== "object") return ["listing.json 不是一个对象"];
  const errors = [];
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    errors.push(`文件夹名称只能用小写英文、数字和 -（现在是 "${slug}"）`);
  }
  // 和网页用同一套规则（js/domain/property.js）
  errors.push(...validateProperty({ ...data, url: `${slug}/` }));
  if (!isText(data.location)) errors.push("缺少 location（卡片上显示的地点）");
  if (!isText(data.address)) errors.push("缺少 address（完整地址）");
  if (!Array.isArray(data.photos) || data.photos.length === 0) {
    errors.push("至少需要一张照片");
  } else {
    for (const ph of data.photos) {
      if (!ph || !isText(ph.image) || ph.image.includes("/") || ph.image.includes("\\")) {
        errors.push(`照片 "${ph?.image}" 必须是这个文件夹里的文件名`);
      } else if (dir && !fs.existsSync(path.join(dir, ph.image))) {
        errors.push(`找不到照片 ${ph.image}`);
      }
    }
  }
  if (data.facebookUrl && !/^https:\/\//.test(data.facebookUrl)) {
    errors.push("facebookUrl 必须以 https:// 开头");
  }
  return errors;
}

export function toCard(slug, d) {
  const cover = d.photos[0];
  return {
    title: d.title,
    location: d.location,
    area: d.area,
    listingType: d.listingType,
    propertyType: d.propertyType,
    price: d.price,
    bedrooms: d.bedrooms,
    bathrooms: d.bathrooms,
    landSize: d.landSize,
    image: `${slug}/${cover.image}`,
    imageAlt: cover.alt || d.title,
    url: `${slug}/`,
    dateAdded: d.dateAdded,
    ...(d.featured === true && { featured: true }),
  };
}

export function buildSitemap(existing, slugs) {
  const propertyUrl = new RegExp(`^${escapeRegExp(SITE_URL)}properties/[^/]+/$`);
  const keep = [...existing.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => !propertyUrl.test(u));
  const urls = [...keep, ...slugs.map((s) => `${SITE_URL}properties/${s}/`)];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>
`;
}

// listing.json 被删除（后台删除房源）时，一并删除自动生成的详情页。手写的页面不会被动到。
function removeOrphanPage(dir, slug, log) {
  const page = path.join(dir, "index.html");
  if (fs.existsSync(page) && fs.readFileSync(page, "utf8").includes(GENERATED_MARKER)) {
    fs.rmSync(page);
    log(`删除 properties/${slug}/index.html（listing.json 已不存在）`);
  }
}

function writeIfChanged(file, content, log) {
  if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === content) return;
  fs.writeFileSync(file, content);
  log(`更新 ${path.relative(ROOT, file) || file}`);
}

function isText(v) {
  return typeof v === "string" && v.trim() !== "";
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build();
}
