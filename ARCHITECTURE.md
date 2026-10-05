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
data/properties.json            房源卡片资料（由 scripts/build-properties.mjs 自动生成）
properties/<房源>/listing.json  每间房源的完整资料（在 /admin/ 后台编辑）
scripts/build-properties.mjs    生成详情页、data/properties.json、sitemap.xml
scripts/property-page-template.mjs  详情页模板
admin/                          房源后台（Sveltia CMS），设定在 admin/config.yml
.github/workflows/build-properties.yml  推送后自动运行生成脚本
tests/                          自动测试
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
| 新增一间房源 | 在 `/admin/` 后台新建（会写入 `properties/xxx/listing.json`，详情页自动生成） |
| 让房源出现在首页 | 默认显示最新的几间；要指定就在后台勾选「固定显示在首页」 |
| 改所有详情页的版面 | `scripts/property-page-template.mjs` |
| 后台加栏位 | `admin/config.yml` + 模板 |
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
- **排序**：Newest（默认，按 `dateAdded`）、Price、Bedrooms。

`data/properties.json` 的格式**完全不变**，旧资料可以直接用。新增的字段只有可选的 `"featured": true`。

---

## 3. 迁移状态

迁移已经完成：

- `properties/index.html` 和首页 `index.html` 的搜索区，改用 `js/ui/propertyListPage.js`（筛选器用 `data-filter` 属性对应）
- 首页 Latest properties 改用 `js/ui/featuredProperties.js`（`data-featured-properties data-limit="4"`），没有标记 `featured` 时显示最新的 4 间
- 卡片沿用 `style.css` 原有的 class（`property-image` / `property-body` / `tag` / `listing-price`）
- 保留了原有的排序：Newest（按 `dateAdded`，默认）、Price、Bedrooms
- 旧的 `js/properties.js` 已删除

---

## 3.1 房源后台的资料流

```
/admin/ 后台（运营人员）
   ↓ 保存：GitHub API 提交到 main
properties/<房源>/listing.json + 照片
   ↓ GitHub Action：scripts/build-properties.mjs
properties/<房源>/index.html、data/properties.json、sitemap.xml
   ↓ GitHub Pages
网站更新
```

权限完全由 GitHub 控制：后台只是编辑器，保存必须用对仓库有写入权限的令牌。

## 4. 本地测试（可选，需要电脑装 Node.js 18+）

```
node --test tests/property.test.mjs tests/build.test.mjs
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
