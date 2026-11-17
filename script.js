// FarmFresh: simple front-end marketplace using JavaScript and LocalStorage.

// Sample listings make the marketplace useful when it first opens.
const starterProducts = [
  {id:1,name:"Fresh Tomatoes",category:"Vegetables",quantity:250,price:28,farmer:"Harpreet Singh",location:"Nakodar, Punjab",date:futureDate(1),description:"Freshly picked, farm-grown tomatoes.",image:"https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=800&q=80"},
  {id:2,name:"Golden Wheat",category:"Grains",quantity:900,price:26,farmer:"Gurmeet Farms",location:"Jalandhar, Punjab",date:futureDate(2),description:"Clean and naturally dried wheat grains.",image:"https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80"},
  {id:3,name:"Fresh Potatoes",category:"Vegetables",quantity:500,price:20,farmer:"Baldev Kumar",location:"Phagwara, Punjab",date:futureDate(0),description:"Good-quality potatoes, ready for sale.",image:"https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80"},
  {id:4,name:"Sweet Oranges",category:"Fruits",quantity:180,price:65,farmer:"Green Valley Farm",location:"Hoshiarpur, Punjab",date:futureDate(3),description:"Juicy seasonal oranges.",image:"https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=800&q=80"},
  {id:5,name:"Red Onions",category:"Vegetables",quantity:350,price:32,farmer:"Manpreet Kaur",location:"Kapurthala, Punjab",date:futureDate(0),description:"Firm red onions from a local farm.",image:"https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80"},
  {id:6,name:"Yellow Lentils",category:"Pulses",quantity:220,price:88,farmer:"Punjab Harvest Co.",location:"Ludhiana, Punjab",date:futureDate(4),description:"Sorted lentils, packed after harvest.",image:"https://images.unsplash.com/photo-1515543904379-3d757unge?auto=format&fit=crop&w=800&q=80"}
];

function futureDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

let products = loadData("farmfreshProducts", starterProducts);
let requests = loadData("farmfreshRequests", []);
let selectedCategory = "All";
let currentProduct = null;

function loadData(key, defaultValue) {
  const savedData = localStorage.getItem(key);
  return savedData ? JSON.parse(savedData) : defaultValue;
}

function saveData() {
  localStorage.setItem("farmfreshProducts", JSON.stringify(products));
  localStorage.setItem("farmfreshRequests", JSON.stringify(requests));
}

function formatDate(dateString) {
  return new Date(dateString + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  const searchText = document.getElementById("searchInput").value.toLowerCase().trim();
  const category = document.getElementById("categoryFilter").value;
  const sortValue = document.getElementById("sortFilter").value;

  let visibleProducts = products.filter(function(product) {
    const matchesSearch =
      product.name.toLowerCase().includes(searchText) ||
      product.farmer.toLowerCase().includes(searchText) ||
      product.location.toLowerCase().includes(searchText);
    const matchesCategory = category === "All" || product.category === category;
    const hasStock = Number(product.quantity) > 0;
    return matchesSearch && matchesCategory && hasStock;
  });

  if (sortValue === "priceLow") {
    visibleProducts.sort((a, b) => a.price - b.price);
  } else if (sortValue === "priceHigh") {
    visibleProducts.sort((a, b) => b.price - a.price);
  } else {
    visibleProducts.sort((a, b) => b.id - a.id);
  }

  grid.innerHTML = "";
  visibleProducts.forEach(function(product) {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-photo">
        <img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/800x500/eaf2e8/245b3d?text=FarmFresh+Produce'">
        <span class="product-category">${product.category}</span>
      </div>
      <div class="product-body">
        <div class="product-title-row">
          <h3>${escapeHTML(product.name)}</h3>
          <div class="price">₹${Number(product.price).toFixed(0)}<small> / kg</small></div>
        </div>
        <div class="product-meta">
          <span>▦ ${Number(product.quantity)} kg available</span>
          <span>◷ ${formatDate(product.date)}</span>
        </div>
        <div class="farmer-line">
          <div class="farmer-info"><strong>${escapeHTML(product.farmer)}</strong>${escapeHTML(product.location)}</div>
          <button class="request-button" data-request-id="${product.id}">Request produce ↗</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  document.getElementById("emptyState").classList.toggle("hidden", visibleProducts.length !== 0);
  document.getElementById("statProducts").textContent = products.length;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, function(character) {
    const replacements = {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"};
    return replacements[character];
  });
}

function showRequestForm(productId) {
  currentProduct = products.find(product => product.id === Number(productId));
  if (!currentProduct) return;
  document.getElementById("requestProductId").value = currentProduct.id;
  document.getElementById("modalProductName").textContent =
    currentProduct.name + " · ₹" + currentProduct.price + "/kg · " + currentProduct.farmer;
  document.getElementById("requestQuantity").max = currentProduct.quantity;
  document.getElementById("requestQuantity").value = "";
  document.getElementById("requestMessage").textContent = "";
  document.getElementById("requestModal").classList.remove("hidden");
}

function closeRequestForm() {
  document.getElementById("requestModal").classList.add("hidden");
}

function renderRequests() {
  const list = document.getElementById("ordersList");
  list.innerHTML = "";
  requests.forEach(function(request) {
    const row = document.createElement("div");
    row.className = "order-row";
    const statusClass = "status-" + request.status.toLowerCase();
    row.innerHTML = `
      <div class="order-main"><strong>${escapeHTML(request.productName)}</strong><small>Buyer: ${escapeHTML(request.buyerName)}</small></div>
      <div class="order-detail">${Number(request.quantity)} kg · ${escapeHTML(request.farmerName)}<br>${escapeHTML(request.buyerContact)}</div>
      <div><span class="order-status ${statusClass}">${request.status}</span></div>
      <div class="order-actions">
        ${request.status === "Pending" ? `<button class="small-action accept" data-status-id="${request.id}" data-new-status="Accepted">Accept</button><button class="small-action reject" data-status-id="${request.id}" data-new-status="Rejected">Reject</button>` : `<button class="small-action" data-status-id="${request.id}" data-new-status="Pending">Reset</button>`}
      </div>`;
    list.appendChild(row);
  });
  document.getElementById("emptyOrders").classList.toggle("hidden", requests.length !== 0);
  document.getElementById("requestCount").textContent = requests.length;
  document.getElementById("navOrderCount").textContent = requests.length;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}

// Search and filter controls update the product cards.
document.getElementById("searchInput").addEventListener("input", renderProducts);
document.getElementById("categoryFilter").addEventListener("change", function() {
  selectedCategory = this.value;
  updateCategoryPills();
  renderProducts();
});
document.getElementById("sortFilter").addEventListener("change", renderProducts);

document.getElementById("categoryPills").addEventListener("click", function(event) {
  const button = event.target.closest("button[data-category]");
  if (!button) return;
  selectedCategory = button.dataset.category;
  document.getElementById("categoryFilter").value = selectedCategory;
  updateCategoryPills();
  renderProducts();
});

function updateCategoryPills() {
  document.querySelectorAll(".category-pill").forEach(function(button) {
    button.classList.toggle("selected", button.dataset.category === selectedCategory);
  });
}

// Event delegation lets product cards created later respond to clicks.
document.getElementById("productGrid").addEventListener("click", function(event) {
  const button = event.target.closest("[data-request-id]");
  if (button) showRequestForm(button.dataset.requestId);
});

document.getElementById("listingForm").addEventListener("submit", function(event) {
  event.preventDefault();
  const newProduct = {
    id: Date.now(),
    name: document.getElementById("produceName").value.trim(),
    category: document.getElementById("produceCategory").value,
    quantity: Number(document.getElementById("produceQuantity").value),
    price: Number(document.getElementById("producePrice").value),
    farmer: document.getElementById("farmerName").value.trim(),
    location: document.getElementById("farmerLocation").value.trim(),
    date: document.getElementById("availableDate").value,
    description: document.getElementById("produceDescription").value.trim(),
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
  };

  if (newProduct.date < futureDate(0)) {
    document.getElementById("listingMessage").textContent = "Please choose today or a future availability date.";
    return;
  }
  products.unshift(newProduct);
  saveData();
  renderProducts();
  this.reset();
  document.getElementById("listingMessage").textContent = "Your produce listing has been published.";
  showToast("New produce listing added!");
  document.getElementById("marketplace").scrollIntoView({behavior:"smooth"});
});

document.getElementById("requestForm").addEventListener("submit", function(event) {
  event.preventDefault();
  const productId = Number(document.getElementById("requestProductId").value);
  const product = products.find(item => item.id === productId);
  const requestedQuantity = Number(document.getElementById("requestQuantity").value);

  if (!product || requestedQuantity < 1 || requestedQuantity > product.quantity) {
    document.getElementById("requestMessage").textContent = "Please enter a quantity within the available stock.";
    return;
  }

  requests.unshift({
    id: Date.now(),
    productName: product.name,
    farmerName: product.farmer,
    buyerName: document.getElementById("buyerName").value.trim(),
    buyerContact: document.getElementById("buyerContact").value.trim(),
    quantity: requestedQuantity,
    status: "Pending"
  });
  saveData();
  renderRequests();
  closeRequestForm();
  this.reset();
  showToast("Your request has been sent!");
});

document.getElementById("ordersList").addEventListener("click", function(event) {
  const button = event.target.closest("[data-status-id]");
  if (!button) return;
  const request = requests.find(item => item.id === Number(button.dataset.statusId));
  if (!request) return;
  request.status = button.dataset.newStatus;
  saveData();
  renderRequests();
  showToast("Request status updated.");
});

document.getElementById("closeModal").addEventListener("click", closeRequestForm);
document.getElementById("requestModal").addEventListener("click", function(event) {
  if (event.target === this) closeRequestForm();
});
document.addEventListener("keydown", function(event) {
  if (event.key === "Escape") closeRequestForm();
});

document.getElementById("menuToggle").addEventListener("click", function() {
  document.getElementById("mainNav").classList.toggle("open");
});
document.querySelectorAll(".main-nav a").forEach(function(link) {
  link.addEventListener("click", function() {
    document.getElementById("mainNav").classList.remove("open");
  });
});

// Show the saved marketplace and request data when the page loads.
renderProducts();
renderRequests();
