const apiBase = "https://openapi.programming-hero.com/api";

const categoriesContainer = document.getElementById("categories");
const plantsContainer = document.getElementById("plants");
const cartListEl = document.getElementById("cart-list");
const cartTotalEl = document.getElementById("cart-total");
const spinner = document.getElementById("plant-spinner");
const modal = document.getElementById("plant-modal");
const modalTitle = document.getElementById("modal-title");
const modalImage = document.getElementById("modal-image");
const modalDescription = document.getElementById("modal-description");
const modalCategory = document.getElementById("modal-category");
const modalPrice = document.getElementById("modal-price");

let cart = [];
let activeCategoryIndex = -1; // -1 for "All Plants"

const toggleSpinner = (show) => {
  spinner.classList.toggle("hidden", !show);
  plantsContainer.classList.toggle("hidden", show);
};

const createPlantCard = (plant) => `
  <div class="bg-white rounded-lg shadow-lg flex flex-col w-full h-[350px]">
    <div class="rounded-xl p-3 mb-2 flex items-center justify-center overflow-hidden">
      <img src="${plant.image}" alt="${plant.name}" class="object-cover w-full h-full rounded-xl" />
    </div>
    <div class="p-4 pt-2 flex flex-col flex-1">
      <h2 class="text-base font-bold mb-2 cursor-pointer truncate card-title">${plant.name}</h2>
      <p class="font-light text-gray-600 text-sm mb-2 truncate">${plant.short_description || plant.description || ''}</p>
      <div class="flex items-center justify-between mb-2">
        <span class="bg-green-100 text-green-700 rounded-full px-4 py-[6px] w-fit text-[15px] font-medium">${plant.category}</span>
        <span class="font-medium">৳${plant.price}</span>
      </div>
      <button class="mt-auto bg-green-700 w-full py-2 rounded-full text-white add-to-cart">Add to Cart</button>
    </div>
  </div>
`;

function loadCategories() {
  fetch(`${apiBase}/categories`)
    .then(res => res.json())
    .then(json => {
      let categories = Array.isArray(json.data) ? json.data :
                       Array.isArray(json.categories) ? json.categories :
                       Array.isArray(json.data?.categories) ? json.data.categories : [];

      if (!categories.length) return;

      categoriesContainer.innerHTML = "";

      // Add "All Plants" button
      const allPlantsBtn = document.createElement("button");
      allPlantsBtn.textContent = "All Plants";
      allPlantsBtn.className = "bg-green-700 text-white rounded px-3 py-1 mb-1 w-full cursor-pointer";
      allPlantsBtn.onclick = () => setActiveCategory(-1, null);
      categoriesContainer.appendChild(allPlantsBtn);

      categories.forEach((category, i) => {
        const btn = document.createElement("button");
        btn.textContent = category.name || category.category_name || category.title || "Unknown";
        btn.className = "hover:bg-green-100 rounded px-3 py-1 mb-1 w-full cursor-pointer transition";
        btn.onclick = () => setActiveCategory(i, category.id || category.category_id);
        categoriesContainer.appendChild(btn);
      });

      // Select "All Plants" on load
      allPlantsBtn.click();
    })
    .catch(err => console.error("Failed to fetch categories:", err));
}

function setActiveCategory(idx, id) {
  activeCategoryIndex = idx;
  const buttons = categoriesContainer.querySelectorAll("button");
  buttons.forEach((btn, i) => {
    if (i === 0) {
      btn.classList.toggle("bg-green-700", idx === -1);
      btn.classList.toggle("text-white", idx === -1);
      btn.classList.toggle("hover:bg-green-100", idx !== -1);
    } else {
      btn.classList.toggle("bg-green-700", i === idx + 1);
      btn.classList.toggle("text-white", i === idx + 1);
      btn.classList.toggle("hover:bg-green-100", i !== idx + 1);
    }
  });

  if (idx === -1) {
    loadAllPlants();
  } else {
    loadPlantsByCategory(id);
  }
}

const renderSkeletons = (count = 6) => {
  plantsContainer.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "bg-white rounded-lg shadow animate-pulse h-[350px]";
    skeleton.innerHTML = `
      <div class="bg-gray-200 rounded-xl w-full h-40 mb-2"></div>
      <div class="p-4 pt-2 flex flex-col flex-1 space-y-2">
        <div class="bg-gray-300 h-5 w-1/2 rounded"></div>
        <div class="bg-gray-300 h-4 w-full rounded"></div>
        <div class="bg-green-100 h-6 w-20 rounded-full"></div>
        <div class="bg-green-600 h-8 w-full rounded-full mt-auto"></div>
      </div>
    `;
    plantsContainer.appendChild(skeleton);
  }
}

function loadAllPlants() {
  toggleSpinner(true);
  renderSkeletons();
  fetch(`${apiBase}/plants`)
    .then(res => res.json())
    .then(json => {
      const plants = Array.isArray(json.plants) ? json.plants : [];
      if (!plants.length) {
        toggleSpinner(false);
        plantsContainer.innerHTML = "<p class='text-center'>No plants found.</p>";
        return;
      }
      setTimeout(() => {
        toggleSpinner(false);
        renderPlants(plants);
      }, 600);
    })
    .catch(err => {
      console.error("Failed to load all plants:", err);
      toggleSpinner(false);
    });
}

function loadPlantsByCategory(catId) {
  toggleSpinner(true);
  renderSkeletons();
  fetch(`${apiBase}/category/${catId}`)
    .then(res => res.json())
    .then(json => {
      let plants = Array.isArray(json.data) ? json.data :
                   Array.isArray(json.plants) ? json.plants :
                   Array.isArray(json.data?.plants) ? json.data.plants : [];
      if (!plants.length) {
        toggleSpinner(false);
        plantsContainer.innerHTML = "<p class='text-center'>No plants found for this category.</p>";
        return;
      }
      setTimeout(() => {
        toggleSpinner(false);
        renderPlants(plants);
      }, 600);
    })
    .catch(err => {
      console.error("Failed to load plants:", err);
      toggleSpinner(false);
    });
}

function renderPlants(plants) {
  plantsContainer.innerHTML = "";
  const maxCards = window.innerWidth < 768 ? 3 : 6;
  const showing = plants.slice(0, maxCards);

  showing.forEach(plant => {
    const div = document.createElement("div");
    div.innerHTML = createPlantCard(plant);
    const card = div.firstElementChild;
    card.querySelector(".card-title").onclick = () => showPlantModal(plant.id);
    card.querySelector(".add-to-cart").onclick = () => addToCart(plant);
    plantsContainer.appendChild(card);
  });
}

function showPlantModal(id) {
  fetch(`${apiBase}/plant/${id}`)
    .then(res => res.json())
    .then(json => {
      const data = json.data;
      if (!data) {
        alert("Failed to load plant details");
        return;
      }
      modalTitle.textContent = data.name;
      modalImage.src = data.image;
      modalImage.alt = data.name;
      modalDescription.textContent = data.description;
      modalCategory.textContent = data.category;
      modalPrice.textContent = `৳ ${data.price}`;
      modal.showModal();
    })
    .catch(() => alert("Failed to load plant details"));
}

function addToCart(plant) {
  cart.push(plant);
  updateCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCart();
}

function updateCart() {
  cartListEl.innerHTML = "";
  cart.forEach(item => {
    const li = document.createElement("li");
    li.className = "flex justify-between items-center bg-green-50 px-3 py-2 rounded mb-1";
    li.innerHTML = `
      <div class="flex flex-col gap-2"><span class="text-xs font-medium">${item.name}</span>
      <span class="text-xs text-gray-400">৳${item.price}</span>
       </div>
      <button class="btn btn-xs btn-outline btn-error ml-2 font-bold remove-btn text-gray-400">✖</button>
     
    `;
    li.querySelector(".remove-btn").onclick = () => removeFromCart(item.id);
    cartListEl.appendChild(li);
  });
  const total = cart.reduce((sum, i) => sum + i.price, 0);
  cartTotalEl.textContent = `৳ ${total}`;
}

modal.addEventListener("click", e => { if (e.target === modal) modal.close(); });

document.addEventListener("DOMContentLoaded", loadCategories);
