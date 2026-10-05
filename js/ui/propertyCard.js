/* ==================== UI: Property Card ====================
   Properties 页和首页共用的房源卡片 HTML。

   【想改卡片显示内容 / 配合 style.css 的 class 名称时，改这里】
   ============================================================ */

import { formatPrice, listingLabel, propertyTypeLabel } from "../domain/property.js";

export function renderPropertyCard(p) {
  const facts = [
    p.bedrooms != null ? `${p.bedrooms} Bed` : "",
    p.bathrooms != null ? `${p.bathrooms} Bath` : "",
    p.landSize ? escapeHtml(p.landSize) : "",
  ].filter(Boolean);

  return `
    <article class="property-card">
      <a class="property-card-link" href="${escapeAttr(p.url)}">
        ${p.image ? `<img class="property-card-image" src="${escapeAttr(p.image)}" alt="${escapeAttr(p.imageAlt)}" loading="lazy">` : ""}
        <div class="property-card-body">
          <span class="property-card-badge">${listingLabel(p)} · ${propertyTypeLabel(p)}</span>
          <h3 class="property-card-title">${escapeHtml(p.title)}</h3>
          <p class="property-card-location">${escapeHtml(p.location || p.area)}</p>
          ${facts.length ? `<p class="property-card-facts">${facts.join(" · ")}</p>` : ""}
          <p class="property-card-price">${formatPrice(p)}</p>
        </div>
      </a>
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
