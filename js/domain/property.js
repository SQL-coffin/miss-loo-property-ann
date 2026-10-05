/* ==================== DOMAIN: Property ====================
   房源的"规则层"：定义一间房屋长什么样、哪些值合法。
   这里不读文件、不碰网页，只管资料本身。

   【以后新增房屋类型 / 字段时需要修改】
   - 新的 propertyType → 加进 PROPERTY_TYPES
   - 新的字段（例如 tenure）→ 在 createProperty() 里加一行
   ============================================================ */

export const LISTING_TYPES = {
  sale: "For Sale",
  rent: "For Rent",
};

export const PROPERTY_TYPES = {
  terrace: "Terrace",
  "semi-d": "Semi-D",
  bungalow: "Bungalow",
  cluster: "Cluster",
  townhouse: "Townhouse",
  condo: "Condominium",
  apartment: "Apartment",
  shophouse: "Shophouse",
  land: "Land",
};

/** 把 JSON 里的一笔原始资料，整理成干净的 Property 对象。
 *  资料有问题时返回 { property: null, errors: [...] }，不会让整个页面坏掉。 */
export function createProperty(raw) {
  const errors = validateProperty(raw);
  if (errors.length > 0) return { property: null, errors };

  const property = Object.freeze({
    id: raw.id || slugFromUrl(raw.url),
    title: raw.title.trim(),
    location: (raw.location || "").trim(),
    area: raw.area.trim(),
    listingType: raw.listingType,
    propertyType: raw.propertyType,
    price: raw.price,
    bedrooms: toNumberOrNull(raw.bedrooms),
    bathrooms: toNumberOrNull(raw.bathrooms),
    landSize: raw.landSize || "",
    image: raw.image || "",
    imageAlt: raw.imageAlt || raw.title,
    url: raw.url,
    dateAdded: raw.dateAdded || "",
    featured: raw.featured === true,
  });
  return { property, errors: [] };
}

export function validateProperty(raw) {
  if (!raw || typeof raw !== "object") return ["资料不是一个对象"];

  const errors = [];
  const label = raw.title ? `"${raw.title}"` : "(没有 title 的房源)";

  if (!isNonEmptyString(raw.title)) errors.push(`${label}: 缺少 title`);
  if (!isNonEmptyString(raw.area)) errors.push(`${label}: 缺少 area`);
  if (!isNonEmptyString(raw.url)) errors.push(`${label}: 缺少 url`);
  if (!(raw.listingType in LISTING_TYPES)) {
    errors.push(`${label}: listingType 必须是 ${Object.keys(LISTING_TYPES).join(" / ")}，现在是 "${raw.listingType}"`);
  }
  if (!(raw.propertyType in PROPERTY_TYPES)) {
    errors.push(`${label}: propertyType "${raw.propertyType}" 不在 PROPERTY_TYPES 里（请到 js/domain/property.js 新增）`);
  }
  if (typeof raw.price !== "number" || !Number.isFinite(raw.price) || raw.price <= 0) {
    errors.push(`${label}: price 必须是数字，例如 558000，而不是 "${raw.price}"`);
  }
  return errors;
}

/* ---------- 显示用的小工具（纯函数） ---------- */

export function formatPrice(property) {
  const amount = "RM" + property.price.toLocaleString("en-MY");
  return property.listingType === "rent" ? amount + " / month" : amount;
}

export function listingLabel(property) {
  return LISTING_TYPES[property.listingType];
}

export function propertyTypeLabel(property) {
  return PROPERTY_TYPES[property.propertyType];
}

/* ---------- 内部 ---------- */

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim() !== "";
}

function toNumberOrNull(v) {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function slugFromUrl(url) {
  return String(url).replace(/\/+$/, "").split("/").pop();
}
