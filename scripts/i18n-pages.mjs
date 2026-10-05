/* ==================== 多语言网页生成 ====================
   英文网页是"原稿"（根目录的 index.html、buy-property/ 等）。
   这个脚本用 i18n/zh.json、i18n/ms.json 的对照表，自动生成：
     zh/...  中文版
     ms/...  马来文版
   并在所有语言的网页加上：语言切换按钮、hreflang（告诉 Google 各语言版本）、语言选择脚本。

   【修改英文网页后】运行 node scripts/build-properties.mjs（GitHub Action 会自动运行），
   中文 / 马来文版会跟着更新。新加的英文句子如果对照表里没有，会保留英文并在输出中提示，
   把它加进 i18n/zh.json、i18n/ms.json 即可。

   不要直接修改 zh/、ms/ 里的文件，下次生成时会被覆盖。
   ============================================================ */

import fs from "node:fs";
import path from "node:path";

export const LANGS = ["en", "zh", "ms"];
export const DEFAULT_LANG = "en";
export const HTML_LANG = { en: "en", zh: "zh-Hans", ms: "ms" };
const SWITCH_LABEL = { en: "EN", zh: "中文", ms: "BM" };
const SWITCH_TITLE = { en: "English", zh: "中文", ms: "Bahasa Melayu" };

// 这些文件夹不是英文原稿：生成的语言版本、后台、程序
const SKIP_DIRS = new Set(["zh", "ms", "admin", "scripts", "tests", "i18n", "js", "data", "node_modules", ".git", ".github"]);

// 只翻译这些 meta（其他 meta 例如 CSP、robots 不能动）
const TRANSLATABLE_META = /<meta\s+(?:name="description"|property="og:(?:title|description)")/i;
const TRANSLATABLE_ATTRS = ["alt", "placeholder", "title", "aria-label"];

export function loadDictionaries(root) {
  const dicts = {};
  for (const lang of LANGS) {
    if (lang === DEFAULT_LANG) continue;
    dicts[lang] = JSON.parse(fs.readFileSync(path.join(root, "i18n", `${lang}.json`), "utf8"));
  }
  return dicts;
}

/** 找出所有英文原稿网页（不含房源详情页，房源页由模板生成） */
export function findSourcePages(root) {
  const pages = [];
  (function walk(rel) {
    for (const entry of fs.readdirSync(path.join(root, rel), { withFileTypes: true })) {
      const relPath = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (!rel && SKIP_DIRS.has(entry.name)) continue;
        if (rel === "properties") continue; // properties/<房源>/ 由模板生成
        walk(relPath);
      } else if (entry.name === "index.html") {
        pages.push(relPath);
      }
    }
  })("");
  return pages.sort();
}

/** "areas/kulai/index.html" → "areas/kulai/"；"index.html" → "" */
export function pageDir(relPath) {
  return relPath.replace(/index\.html$/, "");
}

function langPrefix(lang) {
  return lang === DEFAULT_LANG ? "" : `${lang}/`;
}

/** 从某语言的某页，到网站根目录的相对路径，例如 zh/areas/kulai/ → "../../../" */
export function rootPrefix(dir, lang) {
  const depth = (langPrefix(lang) + dir).split("/").filter(Boolean).length;
  return "../".repeat(depth);
}

/** <head> 里的 hreflang + 语言脚本，以及顶部的语言切换按钮 */
export function languageBlocks({ dir, lang, siteUrl }) {
  const toRoot = rootPrefix(dir, lang);
  const links = LANGS.map((l) => `<link rel="alternate" hreflang="${HTML_LANG[l]}" href="${siteUrl}${langPrefix(l)}${dir}">`);
  links.push(`<link rel="alternate" hreflang="x-default" href="${siteUrl}${dir}">`);
  const head = `<!-- i18n:head -->
${links.join("\n")}
<script type="module" src="${toRoot}js/ui/languagePicker.js"></script>
<!-- /i18n:head -->`;
  const switcher = `<!-- i18n:switch --><div class="lang-switch">${LANGS.map((l) =>
    `<a href="${toRoot}${langPrefix(l)}${dir}" hreflang="${HTML_LANG[l]}" lang="${HTML_LANG[l]}" title="${SWITCH_TITLE[l]}" data-lang-link="${l}"${l === lang ? ' aria-current="true"' : ""}>${SWITCH_LABEL[l]}</a>`
  ).join("")}</div><!-- /i18n:switch -->`;
  return { head, switcher };
}

const HEAD_RE = /<!-- i18n:head -->[\s\S]*?<!-- \/i18n:head -->/;
const SWITCH_RE = /<!-- i18n:switch -->[\s\S]*?<!-- \/i18n:switch -->/;

export function stripLanguageBlocks(html) {
  return html.replace(new RegExp(`\\n?${HEAD_RE.source}`), "").replace(new RegExp(`\\n?${SWITCH_RE.source}`), "");
}

/** 把语言区块放进网页（已经有就替换），可以重复运行 */
export function injectLanguageBlocks(html, blocks) {
  const headRe = HEAD_RE;
  const switchRe = SWITCH_RE;
  html = headRe.test(html) ? html.replace(headRe, blocks.head) : html.replace(/<\/head>/i, `${blocks.head}\n</head>`);
  if (switchRe.test(html)) return html.replace(switchRe, blocks.switcher);
  // 放在顶部导航 </nav> 后面
  return html.replace(/(<header class="site-header">[\s\S]*?<\/nav>)/, `$1\n${blocks.switcher}`);
}

/** 翻译一个英文网页的文字，并修正图片 / CSS / JS 的路径 */
export function translatePage(html, { dict, lang, relPath, missing }) {
  const dir = pageDir(relPath);
  const parts = html.split(/(<!--[\s\S]*?-->|<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>)/i);
  const out = parts.map((part, i) => {
    if (i % 2 === 0) return translateText(part, dict, missing);
    if (part.startsWith("<!--") || /^<(script|style)/i.test(part)) {
      // <script src> 也要修正路径
      return part.replace(/^<script[^>]*>/i, (tag) => fixAssetPaths(tag, dir));
    }
    return fixAssetPaths(translateTag(part, dict, missing), dir);
  });
  return out.join("").replace(/<html lang="[^"]*"/i, `<html lang="${HTML_LANG[lang]}"`);
}

function translateText(text, dict, missing) {
  const trimmed = text.trim();
  if (!trimmed || !/[A-Za-z]/.test(trimmed)) return text;
  const key = decode(trimmed).replace(/\s+/g, " ");
  if (!(key in dict)) {
    missing?.add(key);
    return text;
  }
  const lead = text.match(/^\s*/)[0];
  const trail = text.match(/\s*$/)[0];
  return lead + encodeText(dict[key]) + trail;
}

function translateTag(tag, dict, missing) {
  const attrs = [...TRANSLATABLE_ATTRS];
  if (/^<meta/i.test(tag)) {
    if (!TRANSLATABLE_META.test(tag)) return tag;
    attrs.push("content");
  }
  return tag.replace(new RegExp(`\\s(${attrs.join("|")})="([^"]*)"`, "g"), (all, name, value) => {
    const key = decode(value).trim().replace(/\s+/g, " ");
    if (!key || !/[A-Za-z]/.test(key)) return all;
    if (!(key in dict)) {
      missing?.add(key);
      return all;
    }
    return ` ${name}="${encodeAttr(dict[key])}"`;
  });
}

/** 语言版本多了一层文件夹：指向图片 / CSS / JS 等文件的相对路径要多加 "../"。网页链接不变（留在同一语言里）。 */
function fixAssetPaths(tag, dir) {
  return tag.replace(/\s(href|src)="([^"]*)"/g, (all, name, url) => {
    if (!url || /^([a-z]+:|#|\/|\?)/i.test(url)) return all;
    const file = url.split(/[?#]/)[0];
    const last = file.split("/").pop();
    const isPage = file === "" || file.endsWith("/") || last === "" || /\.html$/i.test(last) || !last.includes(".");
    if (isPage) return all;
    return ` ${name}="../${url}"`;
  });
}

/** 生成所有语言版本；英文原稿只更新语言区块 */
export function buildLanguagePages(root, { siteUrl, log = console.log, warn = console.warn } = {}) {
  const dicts = loadDictionaries(root);
  const pages = findSourcePages(root);
  const missing = Object.fromEntries(Object.keys(dicts).map((l) => [l, new Set()]));

  for (const relPath of pages) {
    const dir = pageDir(relPath);
    const sourceFile = path.join(root, relPath);
    const source = injectLanguageBlocks(fs.readFileSync(sourceFile, "utf8"), languageBlocks({ dir, lang: DEFAULT_LANG, siteUrl }));
    writeIfChanged(sourceFile, source, root, log);

    for (const [lang, dict] of Object.entries(dicts)) {
      let html = translatePage(stripLanguageBlocks(source), { dict, lang, relPath, missing: missing[lang] });
      html = injectLanguageBlocks(html, languageBlocks({ dir, lang, siteUrl }));
      const target = path.join(root, lang, relPath);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      writeIfChanged(target, html, root, log);
    }
  }

  for (const [lang, set] of Object.entries(missing)) {
    if (set.size) warn(`⚠️  i18n/${lang}.json 缺少 ${set.size} 句翻译（暂时显示英文）：\n   - ${[...set].join("\n   - ")}`);
  }
  return { pages, missing };
}

export function writeIfChanged(file, content, root, log) {
  if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === content) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  log(`更新 ${path.relative(root, file)}`);
}

function decode(s) {
  return s.replace(/&nbsp;/g, " ").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

function encodeText(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function encodeAttr(s) {
  return encodeText(s).replace(/"/g, "&quot;");
}
