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

## Quick Reference

以后如果只是：

**换价格**
→ Property `index.html`

**换照片**
→ 上传图片 + Property `index.html`

**换 Facebook post**
→ Property `index.html`

**新增房屋**
→ 新 folder + `index.html` + Properties page + Sitemap

**改变整个网站外观**
→ `style.css`

**改变网站维护方法**
→ `README.md`

**新增重要网页**
→ 页面 + `sitemap.xml`

**改变搜索引擎爬取规则**
→ `robots.txt`

---

这份 README 应该作为网站的长期维护手册使用。
