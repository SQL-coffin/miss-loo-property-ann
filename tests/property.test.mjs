// 运行：node --test tests/property.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { createProperty, formatPrice } from "../js/domain/property.js";
import { searchProperties, listAreas, getFeatured } from "../js/service/propertyService.js";

const base = {
  title: "Renovated Terrace", location: "Taman Gembira, Tampoi", area: "Tampoi",
  listingType: "sale", propertyType: "terrace", price: 558000, bedrooms: 3,
  bathrooms: 3, url: "taman-gembira/",
};
const make = (o) => createProperty({ ...base, ...o }).property;

test("domain: 合法资料", () => {
  const { property, errors } = createProperty(base);
  assert.equal(errors.length, 0);
  assert.equal(property.id, "taman-gembira");
});

test("domain: price 写成文字会被拒绝", () => {
  const { property, errors } = createProperty({ ...base, price: "RM558,000" });
  assert.equal(property, null);
  assert.match(errors[0], /price 必须是数字/);
});

test("domain: 未知 propertyType 会被拒绝", () => {
  assert.equal(createProperty({ ...base, propertyType: "castle" }).property, null);
});

test("domain: 价格格式", () => {
  assert.equal(formatPrice(make({})), "RM558,000");
  assert.equal(formatPrice(make({ listingType: "rent", price: 1800 })), "RM1,800 / month");
});

const list = [
  make({ title: "A", price: 558000 }),
  make({ title: "B", area: "Mount Austin", location: "Mount Austin", price: 680000, propertyType: "semi-d", featured: true }),
  make({ title: "C", area: "Kulai", location: "Kulai", listingType: "rent", price: 1500 }),
];

test("service: 各种筛选", () => {
  assert.deepEqual(searchProperties(list, { area: "Tampoi" }).map((p) => p.title), ["A"]);
  assert.deepEqual(searchProperties(list, { listingType: "rent" }).map((p) => p.title), ["C"]);
  assert.deepEqual(searchProperties(list, { minPrice: 600000 }).map((p) => p.title), ["B"]);
  assert.deepEqual(searchProperties(list, { maxPrice: 600000 }).map((p) => p.title), ["A", "C"]);
  assert.deepEqual(searchProperties(list, { keyword: "mount semi-d" }).map((p) => p.title), ["B"]);
  assert.deepEqual(searchProperties(list, { keyword: "for rent" }).map((p) => p.title), ["C"]);
});

test("service: 排序", () => {
  assert.deepEqual(searchProperties(list, { sort: "price-desc" }).map((p) => p.title), ["B", "A", "C"]);
});

test("service: Area 自动列出、精选", () => {
  assert.deepEqual(listAreas(list), ["Kulai", "Mount Austin", "Tampoi"]);
  assert.deepEqual(getFeatured(list).map((p) => p.title), ["B"]);
});

test("db + api: 读取 JSON、跳过坏资料、路径转换", async () => {
  const rows = [base, { ...base, title: "Bad", price: "RM1" }];
  globalThis.fetch = async () => ({ ok: true, json: async () => rows });
  const warn = console.warn; const warnings = []; console.warn = (...a) => warnings.push(a.join(" "));
  const { getProperties } = await import("../js/api/propertyApi.js");
  const { items, totalAll } = await getProperties();
  console.warn = warn;
  assert.equal(totalAll, 1);
  assert.equal(warnings.length, 1);
  assert.match(items[0].url, /\/properties\/taman-gembira\/$/);
});

test("service: newest（默认）与房间数排序", () => {
  const dated = [
    make({ title: "Old", dateAdded: "2026-09-01", bedrooms: 4 }),
    make({ title: "New", dateAdded: "2026-09-23", bedrooms: 2 }),
    make({ title: "Mid", dateAdded: "2026-09-10", bedrooms: 3 }),
  ];
  assert.deepEqual(searchProperties(dated).map((p) => p.title), ["New", "Mid", "Old"]);
  assert.deepEqual(searchProperties(dated, { sort: "bedrooms-desc" }).map((p) => p.title), ["Old", "Mid", "New"]);
  assert.deepEqual(searchProperties(dated, { sort: "bedrooms-asc" }).map((p) => p.title), ["New", "Mid", "Old"]);
  assert.deepEqual(getFeatured(dated, 2).map((p) => p.title), ["New", "Mid"]);
});
