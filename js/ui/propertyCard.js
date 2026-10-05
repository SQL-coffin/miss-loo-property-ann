/* ==================== UI: Property Card ====================
   Properties 页和首页共用的房源卡片 HTML。

   【想改卡片显示内容 / 配合 style.css 的 class 名称时，改这里】
   ============================================================ */

import { t, langRoot, localized } from "../i18n.js";

export function renderPropertyCard(p) {
  // 沿用 style.css 原有的卡片 class：property-image / property-body / tag / listing-price
  const details = [
    localized(p, "location") || p.area,
    p.bedrooms != null ? t("card.bed", { n: p.bedrooms }) : "",
    p.bathrooms != null ? t("card.bath", { n: p.bathrooms }) : "",
    p.landSize,
  ].filter(Boolean).map(escapeHtml);
  const price = "RM" + p.price.toLocaleString("en-MY") + (p.listingType === "rent" ? t("price.perMonth") : "");
  // 链接到同一个语言的房源页，例如 /zh/properties/xxx/
  const href = new URL(`properties/${p.id}/`, langRoot()).href;

  return `
    <article class="property-card">
      <div class="property-image">
        ${p.image ? `<img src="${escapeAttr(p.image)}" alt="${escapeAttr(localized(p, "imageAlt"))}" loading="lazy">` : escapeHtml(t("card.photo"))}
      </div>
      <div class="property-body">
        <span class="tag">${escapeHtml(t(`listing.${p.listingType}`).toUpperCase())} · ${escapeHtml(p.area.toUpperCase())}</span>
        <h3>${escapeHtml(localized(p, "title"))}</h3>
        <p>${details.join(" · ")}</p>
        <strong class="listing-price">${escapeHtml(price)}</strong>
        <a href="${escapeAttr(href)}">${escapeHtml(t("card.view"))}</a>
      </div>
    </article>`;
}

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, "&quot;");
}
