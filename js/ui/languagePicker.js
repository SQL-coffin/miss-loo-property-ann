/* ==================== UI: 语言选择 ====================
   1. 第一次来的访客：弹出窗口问要用哪种语言，选完记住（存在浏览器里）
   2. 以前选过的访客：直接带到他选的语言版本，不再询问
   3. 页面顶部的 EN / 中文 / BM 切换：点了也会更新记住的选择

   搜索引擎没有"记住的选择"，所以不会被自动跳转，三种语言都能被收录。
   每个页面都由 scripts/i18n-pages.mjs 自动加上这个脚本和切换按钮。
   ============================================================ */

import { LANGUAGES, DEFAULT_LANG, currentLang, SITE_ROOT, t } from "../i18n.js";

const STORAGE_KEY = "missloo-lang";
const lang = currentLang();

/** 同一页在另一种语言的网址，例如 /properties/ → /zh/properties/ */
export function urlFor(target, href = location.href, root = SITE_ROOT) {
  const url = new URL(href);
  if (!url.pathname.startsWith(root.pathname)) return null;
  let rest = url.pathname.slice(root.pathname.length);
  const first = rest.split("/")[0];
  if (first !== DEFAULT_LANG && first in LANGUAGES) rest = rest.slice(first.length + 1);
  url.pathname = root.pathname + (target === DEFAULT_LANG ? "" : `${target}/`) + rest;
  return url.href;
}

function readPreference() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value in LANGUAGES ? value : null;
  } catch {
    return null;
  }
}

function savePreference(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // 无痕模式等情况存不了，下次会再问一次，不影响浏览
  }
}

function go(target) {
  savePreference(target);
  const next = target === lang ? null : urlFor(target);
  if (next) location.href = next;
}

/** 按浏览器语言猜一个默认选项 */
function suggestedLanguage() {
  for (const code of navigator.languages || [navigator.language]) {
    const base = String(code).toLowerCase().split("-")[0];
    if (base === "zh") return "zh";
    if (base === "ms" || base === "id") return "ms";
    if (base === "en") return "en";
  }
  return lang;
}

function showPicker() {
  const suggested = suggestedLanguage();
  const titleId = "lang-picker-title";
  const overlay = document.createElement("div");
  overlay.className = "lang-picker";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", titleId);

  const box = document.createElement("div");
  box.className = "lang-picker-box";

  const logo = document.createElement("img");
  logo.src = new URL("logo.jpg", SITE_ROOT).href;
  logo.alt = "";
  logo.className = "lang-picker-logo";

  const title = document.createElement("h2");
  title.id = titleId;
  // 三种语言都显示，访客一定看得懂
  for (const [code, info] of Object.entries(LANGUAGES)) {
    const line = document.createElement("span");
    line.lang = info.htmlLang;
    line.textContent = t("picker.title", {}, code);
    title.appendChild(line);
  }

  const buttons = document.createElement("div");
  buttons.className = "lang-picker-options";
  for (const [code, info] of Object.entries(LANGUAGES)) {
    const button = document.createElement("button");
    button.type = "button";
    button.lang = info.htmlLang;
    button.className = "button " + (code === suggested ? "primary" : "secondary");
    button.textContent = info.label;
    button.addEventListener("click", () => {
      go(code);
      overlay.remove();
    });
    buttons.appendChild(button);
  }

  const note = document.createElement("p");
  note.className = "lang-picker-note";
  note.textContent = t("picker.remember", {}, suggested);

  box.append(logo, title, buttons, note);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  buttons.querySelector(".primary")?.focus();
}

// 页面顶部的语言切换按钮
for (const link of document.querySelectorAll("[data-lang-link]")) {
  link.addEventListener("click", () => savePreference(link.dataset.langLink));
}

const preference = readPreference();
if (preference && preference !== lang) {
  const next = urlFor(preference);
  if (next) location.replace(next);
} else if (!preference) {
  showPicker();
}
