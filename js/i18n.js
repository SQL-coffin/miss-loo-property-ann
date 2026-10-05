/* ==================== 多语言（网页上的程序文字） ====================
   网站有三种语言：英文在根目录，中文在 /zh/，马来文在 /ms/。
   页面语言由 <html lang="..."> 决定。

   这里只放 JavaScript 动态产生的文字（房源卡片、搜索结果、语言选择窗口）。
   固定页面的文字翻译在 i18n/zh.json、i18n/ms.json。

   【想改程序产生的文字 / 新增语言时，改这里】
   ============================================================ */

export const LANGUAGES = {
  en: { label: "English", short: "EN", htmlLang: "en" },
  zh: { label: "中文", short: "中文", htmlLang: "zh-Hans" },
  ms: { label: "Bahasa Melayu", short: "BM", htmlLang: "ms" },
};
export const DEFAULT_LANG = "en";

const MESSAGES = {
  en: {
    "listing.sale": "For Sale",
    "listing.rent": "For Rent",
    "card.bed": "{n} Bed",
    "card.bath": "{n} Bath",
    "card.view": "View property →",
    "card.photo": "PROPERTY PHOTO",
    "price.perMonth": " / month",
    "count.all": "{n} {properties} found",
    "count.some": "{n} of {total} {properties} found",
    "count.one": "property",
    "count.many": "properties",
    "count.unavailable": "Property listings are temporarily unavailable.",
    "empty.title": "No properties found",
    "empty.text": "Try a wider price range or a different area.",
    "error.title": "Property listings unavailable",
    "error.text": "Please refresh the page or contact Miss Loo on WhatsApp.",
    "type.terrace": "Terrace",
    "type.semi-d": "Semi-D",
    "type.bungalow": "Bungalow",
    "type.cluster": "Cluster",
    "type.townhouse": "Townhouse",
    "type.condo": "Condominium",
    "type.apartment": "Apartment",
    "type.shophouse": "Shophouse",
    "type.land": "Land",
    "picker.title": "Choose your language",
    "picker.remember": "You can change this anytime at the top of the page.",
  },
  zh: {
    "listing.sale": "出售",
    "listing.rent": "出租",
    "card.bed": "{n} 房",
    "card.bath": "{n} 厕",
    "card.view": "查看房源 →",
    "card.photo": "房屋照片",
    "price.perMonth": " / 月",
    "count.all": "共 {n} 间房源",
    "count.some": "{total} 间中找到 {n} 间",
    "count.one": "",
    "count.many": "",
    "count.unavailable": "房源暂时无法显示。",
    "empty.title": "找不到房源",
    "empty.text": "请尝试放宽价格范围或选择其他地区。",
    "error.title": "房源暂时无法显示",
    "error.text": "请刷新页面，或通过 WhatsApp 联系 Miss Loo。",
    "type.terrace": "排屋",
    "type.semi-d": "半独立式",
    "type.bungalow": "独立式洋房",
    "type.cluster": "Cluster 排屋",
    "type.townhouse": "联排别墅",
    "type.condo": "公寓（Condo）",
    "type.apartment": "组屋 / 公寓",
    "type.shophouse": "店屋",
    "type.land": "土地",
    "picker.title": "请选择语言",
    "picker.remember": "之后可以随时在页面顶部切换。",
  },
  ms: {
    "listing.sale": "Dijual",
    "listing.rent": "Disewa",
    "card.bed": "{n} Bilik",
    "card.bath": "{n} Bilik Air",
    "card.view": "Lihat hartanah →",
    "card.photo": "FOTO HARTANAH",
    "price.perMonth": " / bulan",
    "count.all": "{n} hartanah dijumpai",
    "count.some": "{n} daripada {total} hartanah dijumpai",
    "count.one": "",
    "count.many": "",
    "count.unavailable": "Senarai hartanah tidak tersedia buat sementara waktu.",
    "empty.title": "Tiada hartanah dijumpai",
    "empty.text": "Cuba julat harga yang lebih luas atau kawasan lain.",
    "error.title": "Senarai hartanah tidak tersedia",
    "error.text": "Sila muat semula halaman atau hubungi Miss Loo melalui WhatsApp.",
    "type.terrace": "Teres",
    "type.semi-d": "Berkembar",
    "type.bungalow": "Banglo",
    "type.cluster": "Kluster",
    "type.townhouse": "Rumah Bandar",
    "type.condo": "Kondominium",
    "type.apartment": "Apartmen",
    "type.shophouse": "Rumah Kedai",
    "type.land": "Tanah",
    "picker.title": "Pilih bahasa anda",
    "picker.remember": "Anda boleh menukarnya bila-bila masa di bahagian atas halaman.",
  },
};

/** 把 <html lang> 转成 en / zh / ms */
export function normalizeLang(value) {
  const code = String(value || "").toLowerCase().split(/[-_]/)[0];
  return code in LANGUAGES ? code : DEFAULT_LANG;
}

export function currentLang() {
  return typeof document === "undefined" ? DEFAULT_LANG : normalizeLang(document.documentElement.lang);
}

/** 翻译：t("card.bed", { n: 3 }, "zh") → "3 房"。找不到时用英文。 */
export function t(key, vars = {}, lang = currentLang()) {
  const text = MESSAGES[lang]?.[key] ?? MESSAGES[DEFAULT_LANG][key] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : ""));
}

/** 网站根目录（这个文件在 /js/，所以是上一层） */
export const SITE_ROOT = new URL("../", import.meta.url);

/** 某个语言的根目录：英文是网站根目录，其他是 /zh/、/ms/ */
export function langRoot(lang = currentLang()) {
  return lang === DEFAULT_LANG ? SITE_ROOT : new URL(`${lang}/`, SITE_ROOT);
}

/** 房源的显示文字：优先用该语言的翻译，没有就用英文 */
export function localized(property, field, lang = currentLang()) {
  const value = property.i18n?.[lang]?.[field];
  return typeof value === "string" && value.trim() !== "" ? value : property[field];
}
