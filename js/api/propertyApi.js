/* ==================== API: Property ====================
   网页唯一需要调用的入口。ui 层只 import 这个文件，
   不直接碰 db 或 service。

   以后如果换成真正的后端，这里的函数名称和回传格式保持不变，
   网页就不用改。
   ============================================================ */

import { findAll } from "../db/propertyRepository.js";
import {
  searchProperties,
  listAreas,
  listPropertyTypes,
  getFeatured,
} from "../service/propertyService.js";

/** 搜索房源 → { items, total, totalAll } */
export async function getProperties(query = {}) {
  const all = await findAll();
  const items = searchProperties(all, query);
  return { items, total: items.length, totalAll: all.length };
}

/** 筛选器的选项（从资料自动产生）→ { areas, propertyTypes } */
export async function getFilterOptions() {
  const all = await findAll();
  return { areas: listAreas(all), propertyTypes: listPropertyTypes(all) };
}

/** 首页精选房源 → Property[] */
export async function getFeaturedProperties(limit = 3) {
  return getFeatured(await findAll(), limit);
}
