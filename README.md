# Miss Loo JB Property — Website Maintenance Guide

这份 README 是给网站维护者使用的操作说明书。


主要参考这份文件来维护、更新和新增网页。

---

## 1. 网站文件结构

主要文件：

```
index.html
style.css
README.md
robots.txt
sitemap.xml
logo.jpg

properties/
  index.html
  每一间房屋/
    index.html
    房屋照片...

buy-property/
  index.html

sell-property/
  index.html

rent-property/
  index.html

areas/
  index.html
  johor-bahru/
    index.html
  mount-austin/
    index.html
  tebrau/
    index.html
  kulai/
    index.html
```

### 文件用途

| 文件 | 用途 |
|---|---|
| `index.html` | 网站首页的内容和结构 |
| 每个页面的 `index.html` | 对应网页的内容和结构 |
| `style.css` | 整个网站共用的视觉设计 |
| `README.md` | 网站维护和更新说明 |
| `sitemap.xml` | 告诉搜索引擎网站有哪些页面 |
| `robots.txt` | 告诉搜索引擎爬虫如何访问网站 |
| `logo.jpg` | 网站共用 Logo |

---

# 2. 新增一间房屋的完整流程

以后有新的 property，建议按照以下顺序操作。

## Step 1 — 建立新的 Property Folder

进入：

```
properties/
```

建立一个新的文件夹。

建议使用：

```
小写英文 + hyphen
```

例如：

```
properties/taman-impian-emas-double-storey/
```

不要使用：

```
Taman Impian Emas.jpg
New House 123/
IMG123/
```

### Folder 命名原则

尽量包含：

- 地区
- 小区 / 项目
- 房屋类型（如果有帮助）

例如：

```
taman-gembira-tampoi-jalan-riang-2
jalan-putra-5-taman-tan-sri-yaacob
mount-austin-double-storey-terrace
```

---

# 3. 建立新的 index.html

最简单的方法：

**复制一间现有、结构相近的房屋页面。**

例如：

```
properties/taman-gembira-tampoi-jalan-riang-2/index.html
```

复制到新的 property folder：

```
properties/taman-impian-emas-double-storey/index.html
```

然后按照 HTML 里面的：

```
【每个新屋子都需要修改】
```

逐个检查。

---

# 4. Property 页面中需要修改的地方

新屋子最重要的是检查以下区域。

## 4.1 SEO / PAGE INFORMATION

寻找：

```
<!-- ==================== SEO / PAGE INFORMATION ====================
     【每个新屋子都需要修改】
```

需要检查：

- `<title>`
- `meta description`
- Structured Data / JSON-LD

### Title 示例

```
<title>2-Storey Terrace House for Sale in Mount Austin | RM680,000</title>
```

建议包含：

**房屋类型 + 地区 + For Sale / Rent + 价格（如适合）**

### Meta description

用 1–2 句话描述：

- 房屋类型
- 地区
- 房间
- 面积
- 主要特色
- 价格

不要把没有确认的资料写进去。

---

# 5. Property Hero

寻找：

```
<!-- ==================== PROPERTY HERO ====================
     【每个新屋子都需要修改】
```

这里通常修改：

- FOR SALE / FOR RENT
- 地区
- 房屋名称
- 完整地点
- Asking price
- Freehold / Leasehold
- Bumi / Non-Bumi
- Intermediate / Corner / End Lot
- Facing
- 其他主要卖点

---

# 6. 上传房屋照片

照片放在：

```
properties/你的房屋文件夹/
```

例如：

```
properties/taman-impian-emas-double-storey/

  index.html
  front.jpg
  car-porch.jpg
  living.jpg
  kitchen.jpg
  master-bedroom.jpg
  bedroom-2.jpg
  bathroom-1.jpg
```

## 推荐照片命名

使用简单、有意义的英文：

```
front.jpg
car-porch.jpg
living.jpg
kitchen.jpg
master-bedroom.jpg
bedroom-2.jpg
bathroom-1.jpg
bathroom-2.jpg
balcony.jpg
side.jpg
entrance.jpg
```

避免：

```
IMG_1234.jpg
IMG_9283.jpg
WhatsApp Image 2026....
1.jpg
2.jpg
abc.jpg
```

### 为什么？

HTML 必须准确知道图片文件名。

例如：

```
<img src="kitchen.jpg">
```

那么 GitHub 文件夹里面必须真的存在：

```
kitchen.jpg
```

大小写也尽量保持一致。

---

# 7. Photo Gallery

寻找：

```
<!-- ==================== PHOTO GALLERY ====================
     【每个新屋子都需要修改】
```

如果增加照片：

1. 把照片上传到当前 property folder。
2. 使用简单的英文文件名。
3. 复制一个现有的 `<figure>`。
4. 修改 `src`。
5. 修改 `alt`。
6. 修改照片说明。

例如：

```
<figure>
  <img src="kitchen.jpg"
       alt="Kitchen inside renovated house in Mount Austin">
  <figcaption>Kitchen</figcaption>
</figure>
```

---

# 8. Property Details

寻找：

```
<!-- ==================== PROPERTY DETAILS ====================
     【每个新屋子都需要修改】
```

检查：

- Property type
- Land size
- Built-up（如果有可靠资料）
- Bedrooms
- Bathrooms
- Tenure
- Bumi status
- Lot type
- Facing
- Price

例如：

```
<div>
  <span>Bedrooms</span>
  <strong>4</strong>
</div>
```

---

# 9. Renovation / Features

寻找：

```
<!-- ==================== RENOVATION / FEATURES ====================
     【每个新屋子都需要修改】
```

这里填写该房屋实际拥有的：

- Renovation
- Extension
- Kitchen
- Flooring
- Ceiling
- Car porch
- Bathroom
- Security door
- Built-in cabinet
- 其他实际特色

没有的东西不要为了 SEO 而添加。

---

# 10. Location

寻找：

```
<!-- ==================== LOCATION ====================
     【每个新屋子都需要修改】
```

可以写：

- 地区
- 附近主要道路
- Highway
- CIQ
- Shopping mall
- School
- Industrial area
- JB city
- 其他实际存在的地点

只写可以确认的资讯。

---

# 11. Facebook Listing

寻找：

```
<!-- ==================== FACEBOOK LISTING ====================
     【每个新屋子都需要修改】
```

把 Facebook URL 换成这间房屋对应的 Facebook post。

注意：

**同一个 Facebook URL 可能在页面出现不止一次。**

建议检查：

- Hero 的 Facebook button
- 页面底部的 Facebook listing button

不要留下上一间屋子的 Facebook 链接。

---

# 12. WhatsApp 联系方式

目前 Miss Loo 的联系方式属于网站的固定资料。

通常：

**不需要每新增一间房屋就修改。**

但是 WhatsApp message 里面如果有：

```
I'm interested in the Taman Gembira property at RM558,000.
```

这种房屋专属文字，就必须换成新屋子的资料。

例如：

```
I'm interested in the Mount Austin property at RM680,000.
```

固定的：

- WhatsApp number
- Email
- REN
- Agency

除非资料真的改变，否则不要修改。

---

# 13. Footer

Footer 通常不需要修改。

但是如果房屋页面 Footer 有：

```
Taman Gembira · Tampoi
```

这种房屋专属地区资料，则新页面需要换成对应地区。

---

# 14. 新增房屋后更新 properties/index.html

新增 property page 后，要记得让访客可以从：

```
Properties
```

页面找到它。

进入：

```
properties/index.html
```

复制一个现有 property card，然后修改：

- 图片
- 房屋名称
- 地区
- 房屋类型
- 价格
- 链接

链接必须指向新的 folder。

例如：

```
<a href="taman-impian-emas-double-storey/">
```

---

# 15. 新增房屋后更新首页

如果首页展示 Featured Properties / Latest Properties：

进入：

```
index.html
```

把新的房屋加入对应区域。

检查：

- 图片
- 标题
- 地区
- 价格
- 链接

不要留下旧房屋的资料。

---

# 16. 更新 sitemap.xml

每增加一个新的网页，都检查：

```
sitemap.xml
```

加入新的 URL。

例如新增：

```
https://sql-coffin.github.io/miss-loo-property-ann/properties/taman-impian-emas-double-storey/
```

### 什么时候需要更新 Sitemap？

需要：

- 新增房屋页面
- 新增 Area 页面
- 新增 Buy / Sell / Rent 页面
- 新增其他长期存在的重要网页

通常不需要因为：

- 修改价格
- 修改照片
- 修改一小段文字

就新增一个 sitemap URL。

---

# 17. robots.txt

一般情况下：

**不要频繁修改 robots.txt。**

目前网站应该保持允许搜索引擎正常爬取，并指向 sitemap。

如果没有特殊 SEO 需求，不要随便增加：

```
Disallow
```

因为错误的 robots 设置可能阻止搜索引擎访问网页。

---

# 18. style.css

`style.css` 是整个网站共用的设计文件。

它控制：

- 字体
- 颜色
- 间距
- 按钮
- Header
- Footer
- Property gallery
- Cards
- Mobile layout
- Desktop layout
- Responsive design

### 重要

**不要为了修改一间房屋的内容而随便修改 style.css。**

如果只是：

- 改价格
- 换照片
- 改房屋名称
- 改房屋资料

应该修改该房屋自己的：

```
index.html
```

只有需要改变整个网站设计时，才修改：

```
style.css
```

---

# 19. 如何检查新房屋页面有没有漏东西

新增完成后，按照这个 Checklist：

### Property Information

- [ ] 房屋名称正确
- [ ] 地点正确
- [ ] 价格正确
- [ ] Bedrooms 正确
- [ ] Bathrooms 正确
- [ ] Land size 正确
- [ ] Tenure 正确
- [ ] Bumi status 正确
- [ ] Lot type 正确
- [ ] Facing 正确

### Photos

- [ ] 所有照片已经上传
- [ ] 文件名正确
- [ ] HTML `src` 和文件名完全一致
- [ ] 图片可以正常显示
- [ ] alt text 已更新

### Links

- [ ] Facebook link 正确
- [ ] WhatsApp link 正确
- [ ] WhatsApp pre-filled message 已更新
- [ ] Back to Properties link 正确

### SEO

- [ ] Page title 已更新
- [ ] Meta description 已更新
- [ ] Structured Data 已更新
- [ ] 新页面加入 sitemap.xml

### Website Navigation

- [ ] Properties 页面已经加入新屋
- [ ] 首页需要的话加入新屋
- [ ] 页面之间的 link 可以正常打开

---

# 20. 最容易犯的错误

### 错误 1：图片名称不一致

HTML：

```
<img src="front.jpg">
```

GitHub：

```
Front.jpg
```

可能导致图片无法显示。

统一使用小写文件名。

---

### 错误 2：复制上一间屋子后忘记改价格

复制 property page 后，搜索：

```
RM
```

检查所有价格。

---

### 错误 3：Facebook link 还是上一间屋子的

搜索：

```
facebook.com
```

确认所有 Facebook URL 都属于当前房屋。

---

### 错误 4：WhatsApp message 还是上一间屋子

搜索：

```
wa.me
```

检查预填文字里面的：

- 地区
- 房屋名称
- 价格

---

### 错误 5：Sitemap 忘记新增页面

新增长期网页后检查：

```
sitemap.xml
```

---

# 21. 修改网站设计时

如果只是修改某一间房屋：

```
修改该 property/index.html
```

如果是所有页面一起改变：

```
修改 style.css
```

例如：

「所有按钮都想变圆一点」

→ 修改 `style.css`

「只有 Taman Gembira 的房价写错」

→ 修改 Taman Gembira 的 `index.html`

---

# 22. GitHub 更新原则

每次修改后，建议使用清楚的 Commit Message。

例如：

```
Add new Mount Austin property listing
```

```
Update Taman Gembira property price
```

```
Add kitchen photos to property listing
```

```
Update sitemap with new property page
```

这样以后回头查看 GitHub 的修改记录时，会比较容易知道做过什么。

---

# 23. 最简单的日常工作流程

以后有一间新屋子，可以直接按照：

```
① 建立 property folder
        ↓
② 复制现有 property index.html
        ↓
③ 修改所有「【每个新屋子都需要修改】」区域
        ↓
④ 上传照片
        ↓
⑤ 检查照片路径
        ↓
⑥ 更新 Properties 页面
        ↓
⑦ 需要的话更新首页
        ↓
⑧ 更新 sitemap.xml
        ↓
⑨ 检查 Facebook / WhatsApp
        ↓
⑩ 最后检查网页
```

---

# 24. 一个重要原则

**不要为了 SEO 填写不真实的资料。**

网站应该优先保证：

1. 房屋资料准确
2. 联系方式准确
3. 图片和文字对应
4. 页面可以正常打开
5. 搜索引擎可以正常抓取
6. SEO 在真实资料的基础上优化

SEO 是帮助正确的房屋资料被找到，而不是增加不存在的房屋特色。




---

# 25. 房源搜索系统（JSON + JavaScript）

目前网站的 Properties 页面已经加入房源搜索 / 筛选功能。

整体结构是：

```
data/properties.json
        ↓
js/properties.js
        ↓
Properties 搜索 / 筛选
        ↓
自动生成 Property Cards
        ↓
各自的 Property 页面
```

这样以后房源数量增加时，不需要每次都手动复制整张 Property Card。

## 25.1 data/properties.json

房源的搜索资料主要放在：

```
data/properties.json
```

这个文件是 **JSON**，所以不要在里面加入 HTML comment 或 JavaScript comment。

目前每一间房屋大概使用以下资料：

```json
{
  "title": "Fully Renovated Single Storey Terrace",
  "location": "Taman Gembira, Tampoi",
  "area": "Tampoi",
  "listingType": "sale",
  "propertyType": "terrace",
  "price": 558000,
  "bedrooms": 3,
  "bathrooms": 3,
  "landSize": "22' × 70'",
  "image": "taman-gembira-tampoi-jalan-riang-2/front.jpg",
  "imageAlt": "Front exterior of renovated single storey terrace house in Taman Gembira, Tampoi",
  "url": "taman-gembira-tampoi-jalan-riang-2/"
}
```

### 各字段用途

| 字段 | 用途 |
|---|---|
| `title` | 搜索结果显示的房屋名称 |
| `location` | 房屋地点 |
| `area` | Area 筛选使用 |
| `listingType` | Sale / Rent 筛选使用 |
| `propertyType` | Terrace / Semi-D / Bungalow 等筛选使用 |
| `price` | 最低 / 最高价格筛选使用，必须是数字 |
| `bedrooms` | 搜索结果显示 Bedrooms |
| `bathrooms` | 搜索结果显示 Bathrooms |
| `landSize` | 搜索结果显示 Land Size |
| `image` | 搜索结果 Card 的图片路径 |
| `imageAlt` | 图片的 alt text |
| `url` | 点击房源后进入该 Property 页面 |

### 新增房源时

在 JSON 最后一个房源后面增加一个新的对象。

注意 JSON 格式：

```
[
  {
    "title": "Property A"
  },
  {
    "title": "Property B"
  }
]
```

最后一个对象后面**不要多加逗号**。

---

# 26. 新增房源时，搜索系统需要检查什么

以后新增一间房屋，除了建立：

```
properties/新房屋/index.html
```

还要更新：

```
data/properties.json
```

然后确认：

- [ ] `title` 正确
- [ ] `location` 正确
- [ ] `area` 正确
- [ ] `listingType` 正确
- [ ] `propertyType` 正确
- [ ] `price` 是数字
- [ ] `bedrooms` 正确
- [ ] `bathrooms` 正确
- [ ] `landSize` 正确
- [ ] `image` 路径正确
- [ ] `imageAlt` 与实际照片对应
- [ ] `url` 指向正确 Property folder

特别注意：

```
price
```

应该写：

```
558000
```

而不是：

```
"RM558,000"
```

因为 JavaScript 需要使用这个数字进行价格筛选。

---

# 27. Properties 搜索页面

搜索页面：

```
properties/index.html
```

这里负责显示：

- Search keyword
- Listing Type
- Area
- Property Type
- Minimum Price
- Maximum Price
- Reset
- Result count
- Property Cards

页面中的筛选器有维护注解：

```
【以后新增筛选条件时需要修改】
```

如果以后增加新的筛选条件，需要检查：

1. `properties/index.html`
2. `js/properties.js`
3. `data/properties.json` 是否需要增加对应字段

例如以后想增加：

```
Tenure
Facing
Bumi Status
Bedrooms
Bathrooms
```

不能只修改 HTML。

必须同时让 JavaScript 有对应的筛选逻辑。

---

# 28. js/properties.js

JavaScript 文件：

```
js/properties.js
```

这个文件主要负责：

1. 读取 `data/properties.json`
2. 建立房源 Card
3. Keyword Search
4. Listing Type Filter
5. Area Filter
6. Property Type Filter
7. Price Filter
8. Reset
9. Result Count
10. 没有搜索结果时显示提示

文件顶部已经有维护说明：

```
/* ==================== PROPERTY SEARCH ====================
   【以后新增房源时需要修改】
   房源资料主要放在 data/properties.json。
   这里负责读取资料、建立房源卡片和执行搜索筛选。
   ============================================================ */
```

因此：

**一般新增房源时，不需要修改 `js/properties.js`。**

只要新的房源使用现有字段，就加入：

```
data/properties.json
```

即可。

---

# 29. 什么时候需要修改 js/properties.js

只有以下情况才通常需要修改：

### 情况 A — 新增筛选类别

例如增加：

```
Bedrooms
Facing
Tenure
Bumi Status
```

需要修改 JavaScript 的筛选逻辑。

### 情况 B — 修改 Property Card 的显示内容

例如想在 Card 上增加：

```
Freehold
South Facing
Non-Bumi
```

需要修改 JavaScript 生成 Card 的 HTML。

同时需要确认 JSON 有对应资料。

### 情况 C — 修改搜索规则

例如现在 Keyword Search 会搜索：

```
title
location
area
propertyType
listingType
```

以后如果想让 Keyword Search 也搜索：

```
facing
tenure
renovation
```

需要修改 `js/properties.js`。

---

# 30. 新增 Area 时要注意

目前 Area Filter 的选项是写在：

```
properties/index.html
```

例如：

```
Tampoi
Taman Tan Sri Yaacob
```

如果以后新增：

```
Mount Austin
Tebrau
Kulai
```

需要把新的 Area 加进 HTML 的 select。

同时，新房源的 JSON：

```
"area": "Mount Austin"
```

必须与筛选器的文字保持一致。

例如：

```
<select>
  <option value="Mount Austin">Mount Austin</option>
</select>
```

JSON：

```
"area": "Mount Austin"
```

两边不同写法可能导致筛选无法匹配。

---

# 31. JSON 与 Property HTML 的关系

需要理解：

**JSON 不是取代 Property HTML 页面。**

两者用途不同。

```
data/properties.json
```

主要负责：

- Search
- Filter
- Property Card
- Listing overview

而：

```
properties/房屋名称/index.html
```

负责：

- 完整房屋介绍
- SEO
- 完整照片
- Renovation details
- Location
- Facebook listing
- WhatsApp contact
- Structured Data

所以每新增房屋，**两个地方都要存在资料**：

```
data/properties.json
+
properties/新房屋/index.html
```

---

# 32. 首页 Featured Properties 与 JSON

目前首页：

```
index.html
```

的 Featured Properties 仍然是手动维护的。

也就是说：

**新增房源到 JSON 后，不代表它会自动出现在首页。**

如果希望首页展示该房源，需要另外检查：

```
index.html
```

并按照首页的：

```
【每个新屋子都需要修改】
```

注解更新 Featured Property。

以后如果房源数量很多，可以再把首页 Featured Properties 也改成由 JSON 自动读取。

---

# 33. 搜索系统的维护原则

以后新增功能时，尽量遵守这个原则：

```
资料
↓
data/properties.json

显示与筛选逻辑
↓
js/properties.js

页面结构 / 筛选器
↓
properties/index.html

视觉设计
↓
style.css
```

不要把同一份资料到处重复写。

例如价格：

如果是搜索系统的数据：

```
"price": 558000
```

应该以 JSON 为主要来源。

Property HTML 页面仍然要保持正确，因为它是独立的 SEO 页面。

---

# 34. 新增程序时的注解规则

以后如果新增 JavaScript、JSON、搜索功能、筛选功能或其他程序：

**也要尽量加入维护注解。**

但不要为了注解而把每一行代码都写满 comment。

只在以下地方写：

- 以后可能需要修改的地方
- 新增房源时需要修改的地方
- 新增筛选条件时需要修改的地方
- 需要同时修改其他文件的地方
- 容易忘记的维护步骤

例如：

```js
/* ==================== PROPERTY SEARCH ====================
   【以后新增房源时需要修改】
   房源资料主要放在 data/properties.json。
   这里负责读取资料、建立房源卡片和执行搜索筛选。
   ============================================================ */
```

固定、不需要维护的代码，不需要添加大量注释。

---

# 35. 新房源完整更新流程（包括搜索系统）

以后新增一间房屋，可以使用这个版本：

```
① 建立 properties/新房屋/ folder
        ↓
② 复制现有 Property index.html
        ↓
③ 修改所有「【每个新屋子都需要修改】」区域
        ↓
④ 上传房屋照片
        ↓
⑤ 检查图片 src / alt
        ↓
⑥ 加入 data/properties.json
        ↓
⑦ 检查 JSON 的 price / area / propertyType 等字段
        ↓
⑧ 检查 Properties 搜索页面
        ↓
⑨ 如果新增 Area / Filter，修改 properties/index.html
        ↓
⑩ 如果新增筛选逻辑，修改 js/properties.js
        ↓
⑪ 需要的话更新首页 Featured Properties
        ↓
⑫ 更新 sitemap.xml
        ↓
⑬ 检查 Facebook / WhatsApp
        ↓
⑭ 最后测试 Search / Filter / Property Page
        ↓
⑮ Commit 到 GitHub
```

---

# 36. 搜索功能测试 Checklist

每次修改搜索系统后，可以简单测试：

### Keyword

- [ ] 输入房屋名称可以找到
- [ ] 输入地区可以找到
- [ ] 输入 Area 可以找到

### Listing Type

- [ ] All 可以显示全部
- [ ] For Sale 可以只显示 Sale
- [ ] For Rent 可以只显示 Rent

### Area

- [ ] Area 筛选可以正常工作
- [ ] 新 Area 已加入 dropdown
- [ ] JSON 的 `area` 与 dropdown value 一致

### Property Type

- [ ] Terrace 可以筛选
- [ ] 其他新增 Property Type 可以筛选

### Price

- [ ] Minimum Price 正常
- [ ] Maximum Price 正常
- [ ] Minimum + Maximum 一起使用正常

### Reset

- [ ] Reset 后恢复全部房源
- [ ] Result count 正确
- [ ] 没有结果时显示 No Results

### Links

- [ ] Property Card 可以打开正确房屋页面
- [ ] 图片正常显示
- [ ] Property page 本身正常打开

---

# 37. 搜索系统常见错误

### 错误 1：JSON 写错格式

例如：

```
{
  "title": "House",
  "price": 558000,
}
```

最后的逗号可能导致 JSON 无法正常读取。

---

### 错误 2：price 写成文字

错误：

```
"price": "RM558,000"
```

正确：

```
"price": 558000
```

---

### 错误 3：Area 名称不一致

JSON：

```
"area": "Tampoi"
```

HTML：

```
<option value="Tampoi">Tampoi</option>
```

这样才可以正确匹配。

---

### 错误 4：图片路径错误

JSON：

```
"image": "taman-gembira-tampoi-jalan-riang-2/front.jpg"
```

必须确认实际文件存在于：

```
properties/taman-gembira-tampoi-jalan-riang-2/front.jpg
```

---

### 错误 5：url 指错

例如 JSON：

```
"url": "taman-gembira-tampoi-jalan-riang-2/"
```

必须确认：

```
properties/taman-gembira-tampoi-jalan-riang-2/index.html
```

真的存在。

---

# 38. 网站目前的维护结构总结

目前网站可以理解成四层：

```
第一层：网页
index.html
properties/index.html
properties/各个房屋/index.html

第二层：房源资料
data/properties.json

第三层：程序
js/properties.js

第四层：共用设计
style.css
```

以后网站继续扩大时，尽量保持这个结构。

这样新增房源、搜索、筛选和 SEO 页面之间会比较容易维护。

