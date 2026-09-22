/* ==================== PROPERTY SEARCH ====================
   【以后新增房源或筛选功能时需要修改】
   房源资料放在 data/properties.json。
   Homepage 与 Properties 页面共用这套搜索逻辑。
   两个页面各自在 HTML 的 .property-search 写明 JSON、图片和详情页路径，
   因此这里不需要猜测当前网址结构。
   ============================================================ */

const searchBox = document.querySelector(".property-search");
const searchInput = document.getElementById("propertySearch");
const listingType = document.getElementById("listingType");
const locationFilter = document.getElementById("locationFilter");
const propertyType = document.getElementById("propertyType");
const minPrice = document.getElementById("minPrice");
const maxPrice = document.getElementById("maxPrice");
const propertyGrid = document.getElementById("propertyGrid");
const resultCount = document.getElementById("resultCount");
const noResults = document.getElementById("noResults");
const resetButton = document.getElementById("resetFilters");
const sortBy = document.getElementById("sortBy");

let properties = [];
let currentFilteredProperties = [];

const dataPath = searchBox?.dataset.propertiesPath || "";
const imagePrefix = searchBox?.dataset.imagePrefix || "";
const urlPrefix = searchBox?.dataset.urlPrefix || "";

function formatPrice(price) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 0
  }).format(price).replace("MYR", "RM");
}

function formatListingType(type) {
  return type === "rent" ? "FOR RENT" : "FOR SALE";
}

function buildAssetPath(prefix, value) {
  return `${prefix}${value}`;
}

function buildPropertyUrl(value) {
  return `${urlPrefix}${value}`;
}

function renderProperties(items) {
  propertyGrid.innerHTML = items.map(property => `
    <article class="property-card">
      <div class="property-image">
        <img src="${buildAssetPath(imagePrefix, property.image)}" alt="${property.imageAlt}">
      </div>
      <div class="property-body">
        <span class="tag">${formatListingType(property.listingType)} · ${property.area.toUpperCase()}</span>
        <h3>${property.title}</h3>
        <p>${property.location} · ${property.bedrooms} Bed · ${property.bathrooms} Bath · ${property.landSize}</p>
        <strong class="listing-price">${formatPrice(property.price)}</strong>
        <a href="${buildPropertyUrl(property.url)}">View property →</a>
      </div>
    </article>
  `).join("");

  resultCount.textContent = `${items.length} ${items.length === 1 ? "property" : "properties"} found`;
  noResults.hidden = items.length > 0;
}

function filterProperties() {
  const keyword = searchInput.value.trim().toLowerCase();
  const type = listingType.value;
  const area = locationFilter.value;
  const houseType = propertyType.value;
  const minimum = Number(minPrice.value) || 0;
  const maximum = maxPrice.value === "" ? Infinity : Number(maxPrice.value);

  currentFilteredProperties = properties.filter(property => {
    const searchableText = [
      property.title,
      property.location,
      property.area,
      property.propertyType,
      property.listingType
    ].join(" ").toLowerCase();

    return (
      (!keyword || searchableText.includes(keyword)) &&
      (!type || property.listingType === type) &&
      (!area || property.area === area) &&
      (!houseType || property.propertyType === houseType) &&
      property.price >= minimum &&
      property.price <= maximum
    );
  });

  sortProperties();
}

function sortProperties() {
  const sorted = [...currentFilteredProperties];

  /* ==================== SORT OPTIONS ====================
     【以后新增排序方式时需要修改】
     在这里增加新的 sort value 和排序规则。
     同时在 Homepage / Properties 的 Sort by select 增加相同选项。
     ====================================================== */
  if (sortBy.value === "price-low") {
    sorted.sort((a, b) => a.price - b.price);
  } else if (sortBy.value === "price-high") {
    sorted.sort((a, b) => b.price - a.price);
  } else if (sortBy.value === "bedrooms") {
    sorted.sort((a, b) => b.bedrooms - a.bedrooms);
  } else if (sortBy.value === "bedrooms-low") {
    sorted.sort((a, b) => a.bedrooms - b.bedrooms);
  } else {
    sorted.sort((a, b) => (b.dateAdded || "").localeCompare(a.dateAdded || ""));
  }

  renderProperties(sorted);
}

function resetFilters() {
  searchInput.value = "";
  listingType.value = "";
  locationFilter.value = "";
  propertyType.value = "";
  minPrice.value = "";
  maxPrice.value = "";
  sortBy.value = "newest";
  filterProperties();
}

async function loadProperties() {
  try {
    const response = await fetch(dataPath);

    if (!response.ok) {
      throw new Error(`Unable to load property data: HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Property data must be a JSON array.");
    }

    properties = data;

    // 【正常状态】资料成功载入后立即显示全部房源。
    // “No properties found” 只会在实际筛选结果为 0 时出现。
    noResults.hidden = true;
    filterProperties();
  } catch (error) {
    propertyGrid.innerHTML = "";
    resultCount.textContent = "Property listings are temporarily unavailable.";
    noResults.querySelector("h2").textContent = "Property listings unavailable";
    noResults.querySelector("p").textContent = "Please try again later.";
    noResults.hidden = false;
    console.error(error);
  }
}

if (searchBox && searchInput && listingType && locationFilter && propertyType && minPrice && maxPrice && propertyGrid && resultCount && noResults && resetButton && sortBy) {
  searchInput.addEventListener("input", filterProperties);
  listingType.addEventListener("change", filterProperties);
  locationFilter.addEventListener("change", filterProperties);
  propertyType.addEventListener("change", filterProperties);
  minPrice.addEventListener("input", filterProperties);
  maxPrice.addEventListener("input", filterProperties);
  resetButton.addEventListener("click", resetFilters);
  sortBy.addEventListener("change", sortProperties);
  loadProperties();
}
