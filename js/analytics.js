/* ==================== 流量统计（Google Analytics 4） ====================
   每一页的 <head> 都会加载 Google 的 gtag.js 和这个文件（由 scripts/i18n-pages.mjs 自动加上）。
   衡量 ID 只写在一个地方：scripts/i18n-pages.mjs 的 GA_MEASUREMENT_ID，这里从 gtag.js 的网址读取。

   除了 GA4 自动统计的访问量，这里另外记录两种点击（在 GA4 后台看）：
     whatsapp_click  点了 WhatsApp 按钮（最重要的转化）
     facebook_click  点了 Facebook 帖子 / 专页
   每次点击附带：
     link_location   按钮位置：nav（顶部导航）、hero（页面顶部大按钮）、enquiry_card（房源页右侧卡片）、
                     contact（页底联系区）、page（其他）
     page_language   网页语言：en / zh-Hans / ms
     listing_id      房源网址名称（只在房源详情页）
     listing_title   房源标题（只在房源详情页）

   【通常不需要修改】要换 GA4 账号时，改 scripts/i18n-pages.mjs 的 GA_MEASUREMENT_ID。
   ======================================================================== */

const loader = document.querySelector('script[src^="https://www.googletagmanager.com/gtag/js"]');
const measurementId = loader && new URL(loader.src).searchParams.get("id");
// 在自己电脑预览网站时不统计，免得测试数据混进报表
const isLocalPreview = /^(localhost|127\.0\.0\.1|\[::1\]|)$/.test(location.hostname);

if (measurementId && !isLocalPreview) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId);
  document.addEventListener("click", trackOutboundClick, true);
}

function trackOutboundClick(event) {
  const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
  if (!link) return;
  const name = eventName(link.href);
  if (!name) return;
  window.gtag("event", name, {
    link_location: linkLocation(link),
    page_language: document.documentElement.lang,
    ...currentListing(),
  });
}

function eventName(href) {
  let host;
  try {
    host = new URL(href).hostname;
  } catch {
    return null;
  }
  if (host === "wa.me" || host === "api.whatsapp.com") return "whatsapp_click";
  if (host === "facebook.com" || host.endsWith(".facebook.com") || host === "fb.com") return "facebook_click";
  return null;
}

function linkLocation(link) {
  if (link.closest("header")) return "nav";
  if (link.closest(".enquiry-card")) return "enquiry_card";
  if (link.closest(".hero, .listing-hero")) return "hero";
  if (link.closest(".dark, .contact, .contact-box")) return "contact";
  return "page";
}

/** 房源详情页：/properties/<网址名称>/（中文、马来文版前面多 zh/、ms/） */
function currentListing() {
  const match = location.pathname.match(/\/properties\/([a-z0-9-]+)\/?$/);
  if (!match) return {};
  return { listing_id: match[1], listing_title: document.querySelector("h1")?.textContent.trim() || "" };
}
