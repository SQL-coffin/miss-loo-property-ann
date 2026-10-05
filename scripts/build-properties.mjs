/* ==================== 房源生成脚本 ====================
   读取 properties/<房源>/listing.json，自动生成：
     1. 房源详情页（三种语言，模板在 property-page-template.mjs）
          properties/<房源>/index.html、zh/properties/<房源>/、ms/properties/<房源>/
     2. data/properties.json           搜索页、首页卡片用的资料
     3. zh/、ms/ 的固定页面            由英文网页 + i18n/*.json 翻译（i18n-pages.mjs）
     4. sitemap.xml                    全部网址

   listing.json 格式（后台的多语言格式）：
     { "en": { 全部栏位 }, "zh": { 翻译的栏位 }, "ms": { 翻译的栏位 } }
   中文 / 马来文没填的栏位会自动用英文。

   GitHub Action（.github/workflows/build-properties.yml）会在每次推送后自动运行。
   在自己电脑上运行：node scripts/build-properties.mjs

   listing.json 有问题时，该房源会被跳过并打印原因，其他房源照常生成。
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateProperty } from "../js/domain/property.js";
import { renderPropertyPage, GENERATED_MARKER } from "./property-page-template.mjs";
import { LANGS, DEFAULT_LANG, buildLanguagePages, pageDir } from "./i18n-pages.mjs";

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

    const translations = splitLocales(data);
    const errors = validateListing(translations.en, slug, dir);
    if (errors.length) {
      problems.push(...errors.map((e) => `${slug}: ${e}`));
      continue;
    }
    listings.push({ slug, data: translations.en, translations });
  }

  // 1. 详情页（每种语言一页）
  for (const { slug, translations } of listings) {
    for (const lang of LANGS) {
      const file = lang === DEFAULT_LANG
        ? path.join(propertiesDir, slug, "index.html")
        : path.join(root, lang, "properties", slug, "index.html");
      writeIfChanged(file, renderPropertyPage(localize(translations, lang), { slug, siteUrl: SITE_URL, lang }), log);
    }
  }
  for (const lang of LANGS) {
    if (lang !== DEFAULT_LANG) removeOrphanTranslations(root, lang, listings.map((l) => l.slug), log);
  }

  // 2. 搜索 / 首页资料（旧到新排列，和以前的 data/properties.json 一样）
  const cards = listings
    .map(({ slug, translations }) => toCard(slug, translations.en, translations))
    .sort((a, b) => (a.dateAdded || "").localeCompare(b.dateAdded || "") || a.url.localeCompare(b.url));
  writeIfChanged(path.join(root, "data", "properties.json"), JSON.stringify(cards, null, 2) + "\n", log);

  // 3. 固定页面的中文 / 马来文版
  const { pages } = buildLanguagePages(root, { siteUrl: SITE_URL, log, warn });

  // 4. sitemap：所有固定页面 + 房源页，三种语言
  writeIfChanged(path.join(root, "sitemap.xml"), buildSitemap(pages.map(pageDir), listings.map((l) => l.slug)), log);

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

export function toCard(slug, d, translations = {}) {
  const cover = d.photos[0];
  const i18n = {};
  for (const lang of LANGS) {
    if (lang === DEFAULT_LANG || !translations[lang]) continue;
    const tr = localize(translations, lang);
    const fields = { title: tr.title, imageAlt: tr.photos?.[0]?.alt };
    for (const [k, v] of Object.entries(fields)) {
      if (typeof v === "string" && v.trim() && v !== (k === "imageAlt" ? cover.alt : d[k])) (i18n[lang] ||= {})[k] = v;
    }
  }
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
    ...(Object.keys(i18n).length && { i18n }),
  };
}

/** listing.json → { en, zh, ms }。旧的单语言格式当作英文。 */
export function splitLocales(data) {
  if (data && typeof data === "object" && data.en && typeof data.en === "object") {
    return Object.fromEntries(LANGS.map((l) => [l, data[l] && typeof data[l] === "object" ? data[l] : undefined]).filter(([, v]) => v));
  }
  return { en: data };
}

/** 某语言的完整资料：英文为底，有翻译的栏位覆盖上去 */
export function localize(translations, lang) {
  if (lang === DEFAULT_LANG) return translations.en;
  // SEO 文字和 WhatsApp 讯息不沿用英文：没翻译时由模板自动产生该语言的版本
  const { seo, whatsappMessage, ...base } = translations.en;
  return translations[lang] ? merge(base, translations[lang]) : base;
}

function merge(base, over) {
  if (Array.isArray(over)) {
    if (over.length === 0) return base;
    return over.map((item, i) => merge(Array.isArray(base) ? base[i] : undefined, item));
  }
  if (over && typeof over === "object") {
    const out = { ...(base && typeof base === "object" ? base : {}) };
    for (const [k, v] of Object.entries(over)) out[k] = merge(out[k], v);
    return out;
  }
  return over === undefined || over === null || over === "" ? base : over;
}

export function buildSitemap(pageDirs, slugs) {
  const dirs = [...pageDirs, ...slugs.map((s) => `properties/${s}/`)];
  const urls = LANGS.flatMap((lang) => dirs.map((d) => `${SITE_URL}${lang === DEFAULT_LANG ? "" : `${lang}/`}${d}`));
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
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  log(`更新 ${path.relative(ROOT, file) || file}`);
}

function isText(v) {
  return typeof v === "string" && v.trim() !== "";
}

// 房源被删除时，一并删除中文 / 马来文的详情页
function removeOrphanTranslations(root, lang, slugs, log) {
  const dir = path.join(root, lang, "properties");
  if (!fs.existsSync(dir)) return;
  for (const slug of fs.readdirSync(dir)) {
    const page = path.join(dir, slug, "index.html");
    if (slugs.includes(slug) || !fs.existsSync(page)) continue;
    if (fs.readFileSync(page, "utf8").includes(GENERATED_MARKER)) {
      fs.rmSync(path.join(dir, slug), { recursive: true });
      log(`删除 ${lang}/properties/${slug}/（房源已不存在）`);
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build();
}
