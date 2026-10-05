/* ==================== DB: Property Repository ====================
   资料来源层。现在的"数据库"就是 data/properties.json。
   上面的 service / api 层只调用 findAll()，不知道资料从哪里来。

   以后如果换成真正的数据库或后台（例如 Supabase、Google Sheet、
   自己的 API），只需要重写这个文件，其他层不用改。
   ============================================================ */

import { createProperty } from "../domain/property.js";

// 用 import.meta.url 算出路径，所以首页、properties 页、任何子页面都能正确读取
const DATA_URL = new URL("../../data/properties.json", import.meta.url);

// JSON 里的 image / url 是相对于 properties/ 文件夹写的（沿用旧格式）
const PROPERTIES_BASE = new URL("../../properties/", import.meta.url);

let cache = null;

export async function findAll() {
  if (!cache) {
    cache = load().catch((err) => {
      cache = null; // 失败时允许下次重试
      throw err;
    });
  }
  return cache;
}

async function load() {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`无法读取 ${DATA_URL.pathname}（HTTP ${response.status}）`);
  }

  let rows;
  try {
    rows = await response.json();
  } catch {
    throw new Error("data/properties.json 格式错误：请检查有没有多余的逗号或漏掉的引号");
  }
  if (!Array.isArray(rows)) {
    throw new Error("data/properties.json 最外层必须是 [ ... ] 数组");
  }

  const properties = [];
  for (const raw of rows) {
    const { property, errors } = createProperty(withAbsolutePaths(raw));
    if (property) properties.push(property);
    // 有问题的房源会被跳过，并在浏览器 Console 里提示，方便维护者检查
    errors.forEach((e) => console.warn("[properties.json]", e));
  }
  return properties;
}

function withAbsolutePaths(raw) {
  if (!raw || typeof raw !== "object") return raw;
  return {
    ...raw,
    image: raw.image ? new URL(raw.image, PROPERTIES_BASE).href : "",
    url: raw.url ? new URL(raw.url, PROPERTIES_BASE).href : raw.url,
  };
}
