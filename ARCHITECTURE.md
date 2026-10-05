# Miss Loo JB Property — 分层架构说明

网站仍然是放在 GitHub Pages 上的静态网站，不需要服务器、不需要安装任何东西。
只是把原本集中在 `js/properties.js` 的程序，拆成 5 层，各自只负责一件事。

```
js/
  domain/property.js            规则层：房源长什么样、哪些值合法、价格怎么显示
  db/propertyRepository.js      资料层：读取 data/properties.json（现在的"数据库"）
  service/propertyService.js    业务层：搜索、筛选、排序、精选
  api/propertyApi.js            接口层：网页唯一需要调用的入口
  ui/propertyCard.js            画面：房源卡片 HTML（首页和 Properties 页共用）
  ui/propertyListPage.js        画面：Properties 搜索页
  ui/featuredProperties.js      画面：首页精选房源
data/properties.json            房源资料（格式和以前一样）
tests/property.test.mjs         自动测试
```

调用方向只有一个，下层不知道上层的存在：

```
网页 (ui)  →  api  →  service  →  domain
                 ↘  db  →  data/properties.json
```

---

## 1. 每一层什么时候要改

| 想做的事 | 改哪里 |
| --- | --- |
| 新增一间房源 | 只改 `data/properties.json`（加上房屋自己的 `properties/xxx/index.html`） |
| 让房源出现在首页 | JSON 里加 `"featured": true` |
| 新增 Area | **不用改程序**，JSON 写新的 `area`，下拉菜单会自动出现 |
| 新增房屋类型（例如 `condo` 以外的） | `js/domain/property.js` 的 `PROPERTY_TYPES` |
| 新增筛选条件（例如 Bedrooms） | `service` 的 `DEFAULT_QUERY` + `matchesQuery()`，`ui/propertyListPage.js` 的 `FILTERS`，再在 HTML 加输入框 |
| 改卡片显示内容 | `js/ui/propertyCard.js` |
| 以后换成真正的数据库 / 后台 | 只重写 `js/db/propertyRepository.js` |
| 改视觉设计 | `style.css`（和以前一样） |

## 2. 和旧版相比解决了什么

- **首页精选不用手动复制卡片**：改成从 JSON 自动读取。
- **Area 下拉菜单不用手写**：从房源资料自动产生，不会再出现 HTML 和 JSON 写法不一致导致筛选失败。
- **JSON 写错不会让整页坏掉**：price 写成 `"RM558,000"`、listingType 拼错等，该房源会被跳过，并在浏览器 Console（F12）显示中文错误说明，其他房源照常显示。
- **筛选结果可以分享**：网址会带上条件，例如
  `properties/?area=Tampoi&listingType=sale`。Area 页面（如 `areas/kulai/`）可以直接连到该地区的房源。
- **多了价格排序**（Price low → high / high → low）。

`data/properties.json` 的格式**完全不变**，旧资料可以直接用。新增的字段只有可选的 `"featured": true`。

---

## 3. 迁移步骤

### Step 1 — 上传新文件

把这个包里的 `js/domain/`、`js/db/`、`js/service/`、`js/api/`、`js/ui/`、`tests/`、`ARCHITECTURE.md` 上传到仓库。
`data/properties.example.json` 只是格式范例，可以不上传。**不要覆盖你现有的 `data/properties.json`。**

### Step 2 — 修改 `properties/index.html`

把原本的筛选器和结果区换成下面这段（保留你原来的外层 section / class，让 `style.css` 继续生效）。
重点是 `data-filter`、`data-property-*` 这些属性，程序靠它们找到元素。

```html
<!-- ==================== PROPERTY SEARCH ====================
     【以后新增筛选条件时需要修改】
     Area 和 Property Type 的选项由 data/properties.json 自动产生，
     这里只需要保留第一个 "All" 选项。
     ============================================================ -->
<div class="property-filters">
  <input type="search" data-filter="keyword" placeholder="Search area, taman or property type">

  <select data-filter="listingType">
    <option value="">For Sale &amp; Rent</option>
    <option value="sale">For Sale</option>
    <option value="rent">For Rent</option>
  </select>

  <select data-filter="area">
    <option value="">All Areas</option>
  </select>

  <select data-filter="propertyType">
    <option value="">All Types</option>
  </select>

  <input type="number" data-filter="minPrice" placeholder="Min price (RM)" min="0" step="10000">
  <input type="number" data-filter="maxPrice" placeholder="Max price (RM)" min="0" step="10000">

  <select data-filter="sort">
    <option value="default">Latest</option>
    <option value="price-asc">Price: low to high</option>
    <option value="price-desc">Price: high to low</option>
  </select>

  <button type="button" data-property-reset>Reset</button>
</div>

<p data-property-count></p>
<div class="property-grid" data-property-results></div>
```

把页面底部原本的：

```html
<script src="../js/properties.js"></script>
```

换成：

```html
<script type="module" src="../js/ui/propertyListPage.js"></script>
```

> 注意要有 `type="module"`，否则会报错。

### Step 3 — 修改首页 `index.html`

把 Featured Properties 区域里手动写的卡片换成：

```html
<div class="property-grid" data-featured-properties data-limit="3">
  <!-- 读取失败时的后备内容 -->
  <a href="properties/">View all properties</a>
</div>
```

页面底部加：

```html
<script type="module" src="js/ui/featuredProperties.js"></script>
```

然后在 JSON 里给想上首页的房源加 `"featured": true`。

### Step 4 — 对齐卡片样式

新卡片使用这些 class：

```
property-card, property-card-link, property-card-image, property-card-body,
property-card-badge, property-card-title, property-card-location,
property-card-facts, property-card-price, property-empty
```

如果你 `style.css` 里旧卡片用的是别的 class 名称，有两个选择：
1. 打开 `js/ui/propertyCard.js`，把 class 名称改成旧的（推荐，最省事）；
2. 或在 `style.css` 加上对应新 class 的样式。

### Step 5 — 测试后删除旧文件

在网页上按照 README 第 36 节的 Checklist 测试一次。确认没问题后，删除旧的 `js/properties.js`。

---

## 4. 本地测试（可选，需要电脑装 Node.js 18+）

```
node --test tests/property.test.mjs
```

测试会检查：资料校验、各种筛选、排序、精选、JSON 坏资料被跳过、路径转换。

在电脑上预览网站时，因为用了 ES module，不能直接双击打开 HTML，需要用本地服务器，例如：

```
npx serve .
```

推到 GitHub 后，GitHub Pages 本身就能正常运行，不需要任何设置。

---

## 5. 以后升级到真正后端时

只要新的 `js/db/propertyRepository.js` 依然提供 `findAll()` 并回传 Property 列表，
例如改成：

```js
const response = await fetch("https://你的后端/api/properties");
```

`domain`、`service`、`api`、`ui` 和所有网页都不用改。
