/* ==================== SERVICE: Property Search ====================
   业务逻辑层：搜索、筛选、排序、精选房源。
   全部是纯函数：输入房源列表 + 条件，输出结果。不碰网页、不读文件。

   【以后新增筛选条件时需要修改】
   1. 在 DEFAULT_QUERY 加一个默认值
   2. 在 matchesQuery() 加一条判断
   3. 到 js/ui/propertyListPage.js 的 FILTERS 加一个输入框对应
   ============================================================ */

import { LISTING_TYPES, PROPERTY_TYPES } from "../domain/property.js";

export const DEFAULT_QUERY = Object.freeze({
  keyword: "",
  listingType: "",   // "" = 全部
  area: "",
  propertyType: "",
  minPrice: null,
  maxPrice: null,
  sort: "default",   // default | price-asc | price-desc
});

export function searchProperties(properties, query = {}) {
  const q = { ...DEFAULT_QUERY, ...query };
  const results = properties.filter((p) => matchesQuery(p, q));
  return sortProperties(results, q.sort);
}

export function matchesQuery(p, q) {
  if (q.listingType && p.listingType !== q.listingType) return false;
  if (q.area && p.area !== q.area) return false;
  if (q.propertyType && p.propertyType !== q.propertyType) return false;
  if (q.minPrice != null && p.price < q.minPrice) return false;
  if (q.maxPrice != null && p.price > q.maxPrice) return false;
  if (q.keyword && !matchesKeyword(p, q.keyword)) return false;
  return true;
}

// 关键词会搜索这些字段。【想让关键词搜索更多字段时，加在这里】
function matchesKeyword(p, keyword) {
  const haystack = [
    p.title,
    p.location,
    p.area,
    p.propertyType,
    PROPERTY_TYPES[p.propertyType],
    LISTING_TYPES[p.listingType],
  ].join(" ").toLowerCase();

  // 每个词都要出现，例如 "tampoi terrace"
  return keyword.toLowerCase().split(/\s+/).filter(Boolean)
    .every((word) => haystack.includes(word));
}

export function sortProperties(list, sort) {
  const copy = [...list];
  if (sort === "price-asc") copy.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") copy.sort((a, b) => b.price - a.price);
  return copy; // default：保持 JSON 里的顺序
}

/** 从现有房源自动算出有哪些 Area，筛选下拉菜单不用再手写 */
export function listAreas(properties) {
  return uniqueSorted(properties.map((p) => p.area));
}

/** 只列出真的有房源的房屋类型 */
export function listPropertyTypes(properties) {
  return uniqueSorted(properties.map((p) => p.propertyType));
}

/** 首页精选：JSON 里 "featured": true 的房源；都没标记就取前几间 */
export function getFeatured(properties, limit = 3) {
  const marked = properties.filter((p) => p.featured);
  return (marked.length > 0 ? marked : properties).slice(0, limit);
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}
