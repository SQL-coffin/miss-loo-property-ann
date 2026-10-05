/* ==================== UI: Properties 搜索页 ====================
   负责 properties/index.html 的画面：读取筛选器 → 调用 API → 显示卡片。

   页面用 data-* 属性和这里对应（见 ARCHITECTURE.md 的 HTML 范例）：
     data-filter="keyword" / "listingType" / "area" / "propertyType"
                 / "minPrice" / "maxPrice" / "sort"
     data-property-results   卡片放这里
     data-property-count     结果数量
     data-property-reset     Reset 按钮
     data-property-empty     （可选）没有结果时显示的提示框

   筛选条件会同步到网址，例如 properties/?area=Tampoi&listingType=sale
   所以 Area 页面可以直接连到"该地区的房源"。

   【以后新增筛选条件时需要修改】FILTERS 加一行
   ============================================================ */

import { getProperties, getFilterOptions } from "../api/propertyApi.js";
import { PROPERTY_TYPES } from "../domain/property.js";
import { renderPropertyCard } from "./propertyCard.js";

// 筛选器名称 → 怎么把输入框的值转成查询条件
const FILTERS = {
  keyword: (v) => v.trim(),
  listingType: (v) => v,
  area: (v) => v,
  propertyType: (v) => v,
  minPrice: toPrice,
  maxPrice: toPrice,
  sort: (v) => v || "newest",
};

const root = document;
const resultsEl = root.querySelector("[data-property-results]");
const countEl = root.querySelector("[data-property-count]");
const resetEl = root.querySelector("[data-property-reset]");
const emptyEl = root.querySelector("[data-property-empty]");
const inputs = Object.fromEntries(
  Object.keys(FILTERS)
    .map((name) => [name, root.querySelector(`[data-filter="${name}"]`)])
    .filter(([, el]) => el)
);

if (resultsEl) init();

async function init() {
  try {
    await fillDropdowns();
    readQueryFromUrl();
    bindEvents();
    await refresh();
  } catch (err) {
    console.error(err);
    resultsEl.innerHTML = "";
    if (countEl) countEl.textContent = "Property listings are temporarily unavailable.";
    showEmpty("Property listings unavailable", "Please refresh the page or contact Miss Loo on WhatsApp.");
  }
}

/* Area / Property Type 选项从资料自动产生，不用再手动维护 HTML */
async function fillDropdowns() {
  const { areas, propertyTypes } = await getFilterOptions();
  fillSelect(inputs.area, areas.map((a) => [a, a]));
  fillSelect(inputs.propertyType, propertyTypes.map((t) => [t, PROPERTY_TYPES[t]]));
}

function fillSelect(select, options) {
  if (!select) return;
  // 保留 HTML 里的第一个选项（例如 "All Areas"），其余由资料产生
  const first = select.options[0];
  select.innerHTML = "";
  if (first) select.appendChild(first);
  for (const [value, label] of options) {
    select.appendChild(new Option(label, value));
  }
}

function bindEvents() {
  for (const el of Object.values(inputs)) {
    const event = el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(event, debounce(refresh, 150));
  }
  resetEl?.addEventListener("click", (e) => {
    e.preventDefault();
    for (const el of Object.values(inputs)) el.value = el.tagName === "SELECT" ? el.options[0]?.value ?? "" : "";
    refresh();
  });
}

async function refresh() {
  const query = currentQuery();
  const { items, total, totalAll } = await getProperties(query);

  resultsEl.innerHTML = items.map(renderPropertyCard).join("");
  if (total) hideEmpty();
  else showEmpty("No properties found", "Try a wider price range or a different area.");

  if (countEl) {
    countEl.textContent = total === totalAll
      ? `${totalAll} ${plural(totalAll)} found`
      : `${total} of ${totalAll} ${plural(totalAll)} found`;
  }
  writeQueryToUrl(query);
}

function currentQuery() {
  const q = {};
  for (const [name, el] of Object.entries(inputs)) {
    const value = FILTERS[name](el.value);
    if (value !== "" && value != null) q[name] = value;
  }
  return q;
}

/* ---------- 网址同步 ---------- */

function readQueryFromUrl() {
  const params = new URLSearchParams(location.search);
  for (const [name, el] of Object.entries(inputs)) {
    if (params.has(name)) el.value = params.get(name);
  }
}

function writeQueryToUrl(query) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (k === "sort" && v === "newest") continue;
    params.set(k, v);
  }
  const qs = params.toString();
  // 保留 #hash，首页的 #about / #contact 等锚点不受影响
  if (location.search === (qs ? `?${qs}` : "")) return;
  history.replaceState(null, "", (qs ? `?${qs}` : location.pathname) + location.hash);
}

/* ---------- 没有结果 / 读取失败的提示 ---------- */

function showEmpty(title, text) {
  if (!emptyEl) {
    resultsEl.innerHTML = `<p class="no-results">${title}. ${text}</p>`;
    return;
  }
  const h = emptyEl.querySelector("h2");
  const p = emptyEl.querySelector("p");
  if (h) h.textContent = title;
  if (p) p.textContent = text;
  emptyEl.hidden = false;
}

function hideEmpty() {
  if (emptyEl) emptyEl.hidden = true;
}

/* ---------- 小工具 ---------- */

function toPrice(v) {
  const n = Number(String(v).replace(/[^\d.]/g, ""));
  return v !== "" && Number.isFinite(n) && n > 0 ? n : null;
}

function plural(n) {
  return n === 1 ? "property" : "properties";
}

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
