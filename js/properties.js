/* ==================== PROPERTY SEARCH ====================
   【以后新增房源时需要修改】
   房源资料主要放在 data/properties.json。
   这里负责读取资料、建立房源卡片和执行搜索筛选。
   ============================================================ */

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

function renderProperties(items) {
  propertyGrid.innerHTML = items.map(property => `
    <article class="property-card">
      <div class="property-image">
        <img src="${property.image}" alt="${property.imageAlt}">
      </div>
      <div class="property-body">
        <span class="tag">${formatListingType(property.listingType)} · ${property.area.toUpperCase()}</span>
        <h3>${property.title}</h3>
        <p>${property.location} · ${property.bedrooms} Bed · ${property.bathrooms} Bath · ${property.landSize}</p>
        <strong class="listing-price">${formatPrice(property.price)}</strong>
        <a href="${property.url}">View property →</a>
      </div>
    </article>
  `).join("");

  resultCount.textContent = `${items.length} ${items.length === 1 ? "property" : "properties"} found`;
  noResults.hidden = items.length !== 0;
}

function filterProperties() {
  const keyword = searchInput.value.trim().toLowerCase();
  const type = listingType.value;
  const area = locationFilter.value;
  const houseType = propertyType.value;
  const minimum = Number(minPrice.value) || 0;
  const maximum = Number(maxPrice.value) || Infinity;

  const filtered = properties.filter(property => {
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

  currentFilteredProperties = filtered;
  sortProperties();
}

function sortProperties() {
  const sorted = [...currentFilteredProperties];

  /* ==================== SORT OPTIONS ====================
     【以后新增排序方式时需要修改】
     在这里增加新的 sort value 和对应排序规则。
     同时要在 properties/index.html 的 Sort by select 增加选项。
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
  filterProperties();
}

async function loadProperties() {
  try {
    const response = await fetch("../data/properties.json");

    if (!response.ok) {
      throw new Error("Unable to load property data.");
    }

    properties = await response.json();
    currentFilteredProperties = properties;
    sortProperties();
  } catch (error) {
    propertyGrid.innerHTML = "";
    resultCount.textContent = "Property listings are temporarily unavailable.";
    noResults.hidden = false;
    console.error(error);
  }
}

searchInput.addEventListener("input", filterProperties);
listingType.addEventListener("change", filterProperties);
locationFilter.addEventListener("change", filterProperties);
propertyType.addEventListener("change", filterProperties);
minPrice.addEventListener("input", filterProperties);
maxPrice.addEventListener("input", filterProperties);
resetButton.addEventListener("click", resetFilters);
sortBy.addEventListener("change", sortProperties);

loadProperties();
