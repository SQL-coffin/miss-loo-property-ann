/* ==================== UI: Property Card ====================
   Properties 页和首页共用的房源卡片 HTML。

   【想改卡片显示内容 / 配合 style.css 的 class 名称时，改这里】
   ============================================================ */

import { formatPrice, listingLabel } from "../domain/property.js";

export function renderPropertyCard(p) {
  // 沿用 style.css 原有的卡片 class：property-image / property-body / tag / listing-price
  const details = [
    p.location || p.area,
    p.bedrooms != null ? `${p.bedrooms} Bed` : "",
    p.bathrooms != null ? `${p.bathrooms} Bath` : "",
    p.landSize,
  ].filter(Boolean).map(escapeHtml);

  return `
    <article class="property-card">
      <div class="property-image">
        ${p.image ? `<img src="${escapeAttr(p.image)}" alt="${escapeAttr(p.imageAlt)}" loading="lazy">` : "PROPERTY PHOTO"}
      </div>
      <div class="property-body">
        <span class="tag">${escapeHtml(listingLabel(p).toUpperCase())} · ${escapeHtml(p.area.toUpperCase())}</span>
        <h3>${escapeHtml(p.title)}</h3>
        <p>${details.join(" · ")}</p>
        <strong class="listing-price">${formatPrice(p)}</strong>
        <a href="${escapeAttr(p.url)}">View property →</a>
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
