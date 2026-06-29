/**
 * FMD Shopping - Product Showcase Page JavaScript Logic
 * Orchestrates product lookups, spec selectors, quantity widgets, and cross-sale recommendations
 */

// FILE CONNECTION NOTES:
// This script interacts with:
// - index.html: fallback redirects on invalid products, and related product links
// - cart.html: links and counts update on successful additions
// - wishlist.html: updates wishlist state dynamically

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get("id"));

  if (!productId || isNaN(productId)) {
    showToast("Luxury item reference is missing. Redirecting...", "error");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
    return;
  }

  const product = FMD_DB.getProductById(productId);

  if (!product) {
    showToast("This exclusive piece is currently unavailable. Redirecting...", "error");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
    return;
  }

  // Set selected size state (default value)
  let selectedSize = "Standard";
  
  // 1. POPULATE MAIN PRODUCT VIEW INFO
  bindProductDetails(product);

  // 2. RENDER DYNAMIC SIZE SELECTORS BASED ON CATEGORY
  renderSizeSelectors(product, (size) => {
    selectedSize = size;
  });

  // 3. QUANTITY INCREMENT DECREMENT WIDGET
  const qtyInput = document.getElementById("qty-count-input");
  const incBtn = document.getElementById("qty-inc");
  const decBtn = document.getElementById("qty-dec");

  if (qtyInput && incBtn && decBtn) {
    incBtn.addEventListener("click", () => {
      let val = parseInt(qtyInput.value) || 1;
      if (val < product.stock) {
        qtyInput.value = val + 1;
      } else {
        showToast(`Apologies, only ${product.stock} units are currently reserved in stock.`, "info");
      }
    });

    decBtn.addEventListener("click", () => {
      let val = parseInt(qtyInput.value) || 1;
      if (val > 1) {
        qtyInput.value = val - 1;
      }
    });
  }

  // 4. ADD TO BAG BUTTON ACTIONS
  const addToCartBtn = document.getElementById("details-add-to-cart-btn");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      const quantity = parseInt(qtyInput.value) || 1;
      FMD_DB.addToCart(product.id, quantity, selectedSize);
    });
  }

  // 5. WISHLIST TOGGLE BUTTON ACTIONS
  const wishlistBtn = document.getElementById("details-add-to-wishlist-btn");
  if (wishlistBtn) {
    // Set initial wishlist heart state
    const wishlist = FMD_DB.getWishlist();
    if (wishlist.includes(product.id)) {
      wishlistBtn.classList.add("btn-gold");
      wishlistBtn.classList.remove("btn-outline");
    }

    wishlistBtn.addEventListener("click", () => {
      const isAdded = FMD_DB.addToWishlist(product.id);
      if (isAdded) {
        wishlistBtn.classList.add("btn-gold");
        wishlistBtn.classList.remove("btn-outline");
      } else {
        wishlistBtn.classList.add("btn-outline");
        wishlistBtn.classList.remove("btn-gold");
      }
    });
  }

  // 6. RENDER COMPLEMENTARY PAIRINGS (RELATED PRODUCTS)
  renderRelatedProducts(product);
});

// BINDER UTIL
function bindProductDetails(p) {
  // Breadcrumbs
  const bCategory = document.getElementById("breadcrumb-category");
  const bItem = document.getElementById("breadcrumb-item-name");
  if (bCategory) {
    bCategory.textContent = p.category;
    bCategory.href = `index.html?category=${encodeURIComponent(p.category)}`;
  }
  if (bItem) bItem.textContent = p.name;

  // Title & Metadata
  const dCategory = document.getElementById("details-category");
  const dName = document.getElementById("details-name");
  const dReviews = document.getElementById("details-reviews-count");
  const dDesc = document.getElementById("details-desc");
  const dPrice = document.getElementById("details-price");
  const dImg = document.getElementById("main-product-image");

  if (dCategory) dCategory.textContent = p.category;
  if (dName) dName.textContent = p.name;
  if (dReviews) dReviews.textContent = `(${p.reviews} Client Commissions)`;
  if (dDesc) dDesc.textContent = p.description;
  if (dPrice) dPrice.textContent = `$${p.price.toLocaleString()}`;
  if (dImg) {
    dImg.src = p.image;
    dImg.alt = p.name;
  }

  // Rating Stars
  const dStars = document.getElementById("details-stars");
  if (dStars) {
    dStars.innerHTML = "";
    const ratingFloor = Math.floor(p.rating);
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement("i");
      if (i <= ratingFloor) {
        star.setAttribute("data-lucide", "star");
      } else if (i - 0.5 === p.rating) {
        star.setAttribute("data-lucide", "star-half");
      } else {
        star.setAttribute("data-lucide", "star");
        star.style.opacity = "0.2"; // hollow star style
      }
      star.style.width = "16px";
      star.style.height = "16px";
      dStars.appendChild(star);
    }
  }

  // Specifications
  const dSpecs = document.getElementById("details-specs-list");
  if (dSpecs) {
    dSpecs.innerHTML = "";
    
    // Default system specs + product specs combined
    const listSpecs = p.specs || ["Premium Selection", "Original Certificate Included"];
    listSpecs.forEach(spec => {
      const item = document.createElement("div");
      item.className = "spec-item";
      
      const parts = spec.split(":");
      if (parts.length > 1) {
        item.innerHTML = `<span>${parts[0].trim()}</span><span>${parts[1].trim()}</span>`;
      } else {
        item.innerHTML = `<span>Detail</span><span>${spec}</span>`;
      }
      dSpecs.appendChild(item);
    });
  }

  // Gallery Thumbnails (mock strip)
  const dThumbStrip = document.getElementById("product-thumbnail-strip");
  if (dThumbStrip) {
    dThumbStrip.innerHTML = "";
    
    // Create 3 thumbnails (1 main and 2 custom mock close-ups using different visual options)
    const images = [
      p.image,
      "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=300&auto=format&fit=crop", // detail texture / box packing
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=300&auto=format&fit=crop"  // luxury seal card
    ];

    images.forEach((imgSrc, index) => {
      const thumb = document.createElement("div");
      thumb.className = `thumbnail-box ${index === 0 ? 'active' : ''}`;
      thumb.innerHTML = `<img src="${imgSrc}" class="thumbnail-img" alt="Close-up detail">`;
      
      thumb.addEventListener("click", () => {
        // Highlight active thumbnail and update main display image
        document.querySelectorAll(".thumbnail-box").forEach(t => t.classList.remove("active"));
        thumb.classList.add("active");
        if (dImg) dImg.src = imgSrc;
      });

      dThumbStrip.appendChild(thumb);
    });
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// OPTIONS CONFIG UTIL
function renderSizeSelectors(p, onSizeSelect) {
  const container = document.getElementById("details-size-selectors");
  if (!container) return;

  container.innerHTML = "";

  let options = [];
  if (p.category === "Accessories" && p.name.includes("Chronograph")) {
    options = ["40mm Case", "42mm Case", "44mm Bespoke"];
  } else if (p.category === "Fragrances") {
    options = ["50 ml", "100 ml (Gold Edition)"];
  } else if (p.category === "Footwear") {
    options = ["EU 38", "EU 39", "EU 40", "EU 41", "EU 42"];
  } else if (p.category === "Apparel") {
    options = ["S", "M", "L", "Custom Tailored"];
  } else {
    options = ["Standard", "Signature Bespoke"];
  }

  options.forEach((opt, index) => {
    const btn = document.createElement("button");
    btn.className = `size-btn ${index === 0 ? 'active' : ''}`;
    btn.textContent = opt;
    
    if (index === 0) {
      onSizeSelect(opt); // default selection trigger
    }

    btn.addEventListener("click", () => {
      document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      onSizeSelect(opt);
      showToast(`Selected luxury spec: ${opt}`, "info");
    });

    container.appendChild(btn);
  });
}

// RELATED PRODUCTS COMPONENT
function renderRelatedProducts(currP) {
  const container = document.getElementById("related-products-grid");
  if (!container) return;

  const allProducts = FMD_DB.getProducts();
  
  // Filter out current product, then select up to 4 items inside the same category
  let related = allProducts.filter(p => p.id !== currP.id && p.category === currP.category);
  
  // If not enough inside category, back-fill with general products
  if (related.length < 4) {
    const fallback = allProducts.filter(p => p.id !== currP.id && p.category !== currP.category);
    related = [...related, ...fallback].slice(0, 4);
  } else {
    related = related.slice(0, 4);
  }

  container.innerHTML = "";

  related.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    
    card.innerHTML = `
      <div class="product-img-wrapper" onclick="window.location.href='product.html?id=${p.id}'">
        <img src="${p.image}" class="product-img" alt="${p.name}">
      </div>
      <div class="product-info-wrapper">
        <span class="product-cat">${p.category}</span>
        <a href="product.html?id=${p.id}" class="product-name-link">${p.name}</a>
        <div class="product-footer">
          <span class="product-price">$${p.price.toLocaleString()}</span>
          <button class="quick-add-bag" style="padding: 6px 12px; font-size: 0.7rem;" onclick="FMD_DB.addToCart(${p.id}, 1); event.stopPropagation();">
            <i data-lucide="shopping-bag" style="width: 12px; height: 12px;"></i> Add
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}
