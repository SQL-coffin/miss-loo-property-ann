/* ==================== UI: 首页 Featured Properties ====================
   首页的精选房源改成自动从 data/properties.json 读取，
   不用再手动复制卡片。

   想让某间房出现在首页：在 JSON 里给它加 "featured": true
   一间都没标记时，自动显示 JSON 里的前 3 间。

   首页 HTML 只需要放：
     <div data-featured-properties data-limit="3"></div>

   容器里标了 data-featured-fallback 的内容会在读取成功后移除；
   其他内容（例如 "Thinking of selling?" 卡片）会保留在房源后面。
   ============================================================ */

import { getFeaturedProperties } from "../api/propertyApi.js";
import { renderPropertyCard } from "./propertyCard.js";

const container = document.querySelector("[data-featured-properties]");

if (container) {
  const limit = Number(container.dataset.limit) || 3;
  getFeaturedProperties(limit)
    .then((items) => {
      container.querySelectorAll("[data-featured-fallback]").forEach((el) => el.remove());
      container.insertAdjacentHTML("afterbegin", items.map(renderPropertyCard).join(""));
    })
    .catch((err) => {
      console.error(err);
      // 读取失败时保留 HTML 里原本的内容（可以放一个 "View all properties" 链接当后备）
    });
}
