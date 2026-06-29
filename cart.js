/**
 * FMD Shopping - Shopping Bag JavaScript Logic
 * Governs quantities, promo code verification, luxury calculations, and checkout triggers
 */

// FILE CONNECTION NOTES:
// This script interacts with:
// - product.html: back-link on individual item selections
// - checkout.html: redirects when checking out, storing active discount percentages
// - index.html: fallback redirects when shopping cart is emptied

document.addEventListener("DOMContentLoaded", () => {
  // Clear any stale single-session promo values if reloading fresh
  localStorage.setItem("fmd_active_discount", "0");
  
  renderCart();

  // PROMO CODE VERIFIER LOGIC
  const applyBtn = document.getElementById("promo-code-apply-btn");
  const codeInput = document.getElementById("promo-code-input");

  if (applyBtn && codeInput) {
    applyBtn.addEventListener("click", () => {
      const code = codeInput.value.trim().toUpperCase();

      if (code === "GOLDEN15" || code === "VIPACCESS") {
        localStorage.setItem("fmd_active_discount", "15");
        showToast("VIP Golden Privilege coupon authenticated! 15% off applied.", "success");
        updateInvoiceSummary();
      } else if (code === "") {
        showToast("Please enter an elite promo coupon code", "error");
      } else {
        showToast("Invalid code or membership privilege. Try GOLDEN15", "error");
      }
    });
  }

  // CHECKOUT FORWARDER BUTTON
  const checkoutBtn = document.getElementById("cart-checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      const cart = JSON.parse(localStorage.getItem("fmd_cart") || "[]");
      if (cart.length === 0) {
        showToast("Your luxury shopping bag is currently empty.", "error");
        return;
      }
      
      // File Connection Note: forwards directly to secure checkout window
      window.location.href = "checkout.html";
    });
  }
});

function renderCart() {
  const container = document.getElementById("cart-items-list");
  const summaryCard = document.getElementById("cart-summary-card");
  if (!container) return;

  const cart = JSON.parse(localStorage.getItem("fmd_cart") || "[]");
  const allProducts = FMD_DB.getProducts();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart-box">
        <div class="empty-cart-icon">
          <i data-lucide="shopping-bag" style="width: 32px; height: 32px;"></i>
        </div>
        <h2 style="font-family: var(--font-display); color: var(--text-primary); margin-bottom: 15px;">Your Shopping Bag is Empty</h2>
        <p style="color: var(--text-secondary); font-size: 0.9rem; max-width: 400px; margin: 0 auto 30px auto; line-height: 1.8;">
          Fill your bag with exquisite selections from our premier catalog. Free express shipping is included on all boutique commissions.
        </p>
        <a href="index.html" class="btn-gold">Explore Collection</a>
      </div>
    `;
    if (summaryCard) summaryCard.style.display = "none";
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  // If items exist, render them and show summary card
  if (summaryCard) summaryCard.style.display = "block";
  container.innerHTML = "";

  cart.forEach(item => {
    const p = allProducts.find(product => product.id === item.productId);
    if (!p) return;

    const row = document.createElement("div");
    cardTransitionReset(row, item.productId, item.selectedSize);

    const lineTotal = p.price * item.quantity;

    row.innerHTML = `
      <div class="cart-item-img-box">
        <img src="${p.image}" class="cart-item-img" alt="${p.name}">
      </div>
      <div class="cart-item-details">
        <h3 class="cart-item-name">
          <a href="product.html?id=${p.id}">${p.name}</a>
        </h3>
        <span class="cart-item-spec-badge">${item.selectedSize}</span>
      </div>
      <div class="cart-item-price-unit">$${p.price.toLocaleString()}</div>
      
      <!-- Quantity Adjuster -->
      <div class="cart-item-qty">
        <div class="cart-qty-counter">
          <button class="cart-qty-btn" onclick="updateQty(${p.id}, '${item.selectedSize}', -1)" title="Decrease Quantity">
            <i data-lucide="minus" style="width: 10px; height: 10px;"></i>
          </button>
          <input type="text" class="cart-qty-input" value="${item.quantity}" readonly>
          <button class="cart-qty-btn" onclick="updateQty(${p.id}, '${item.selectedSize}', 1)" title="Increase Quantity">
            <i data-lucide="plus" style="width: 10px; height: 10px;"></i>
          </button>
        </div>
      </div>

      <div class="cart-item-total">$${lineTotal.toLocaleString()}</div>

      <!-- Delete Button -->
      <button class="cart-item-delete" onclick="deleteRow(${p.id}, '${item.selectedSize}')" title="Delete Item">
        <i data-lucide="trash-2"></i>
      </button>
    `;

    container.appendChild(row);
  });

  updateInvoiceSummary();

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// SETUP HELPER FOR TRANSITIONS
function cardTransitionReset(el, id, size) {
  el.className = "cart-item-row";
  el.id = `cart-row-${id}-${size.replace(/\s+/g, '-')}`;
}

// UPDATE QUANTITIES DIRECTLY
window.updateQty = function(productId, size, offset) {
  const cart = JSON.parse(localStorage.getItem("fmd_cart") || "[]");
  const item = cart.find(i => i.productId === productId && i.selectedSize === size);
  if (!item) return;

  const product = FMD_DB.getProductById(productId);
  if (!product) return;

  const newQty = item.quantity + offset;

  if (newQty <= 0) {
    window.deleteRow(productId, size);
    return;
  }

  if (newQty > product.stock) {
    showToast(`Apologies, only ${product.stock} units are currently reserved in stock.`, "info");
    return;
  }

  item.quantity = newQty;
  localStorage.setItem("fmd_cart", JSON.stringify(cart));
  
  // Refresh layout and headers
  renderCart();
  updateGlobalCounters();
};

// ROW DELETE TRANSITION ACTION
window.deleteRow = function(productId, size) {
  const rowId = `cart-row-${productId}-${size.replace(/\s+/g, '-')}`;
  const row = document.getElementById(rowId);

  if (row) {
    row.classList.add("removing");

    // Remove from localStorage database
    let cart = JSON.parse(localStorage.getItem("fmd_cart") || "[]");
    cart = cart.filter(i => !(i.productId === productId && i.selectedSize === size));
    localStorage.setItem("fmd_cart", JSON.stringify(cart));

    // Delay component removal to let CSS animation run
    setTimeout(() => {
      row.remove();
      renderCart();
      updateGlobalCounters();
    }, 400);
  }
};

// INVOICE SUMMARY MATH
function updateInvoiceSummary() {
  const subtotalEl = document.getElementById("summary-subtotal");
  const discountRow = document.getElementById("promo-discount-row");
  const discountEl = document.getElementById("summary-discount");
  const totalEl = document.getElementById("summary-total");

  if (!subtotalEl || !totalEl) return;

  const cart = JSON.parse(localStorage.getItem("fmd_cart") || "[]");
  const allProducts = FMD_DB.getProducts();

  let subtotal = 0;
  cart.forEach(item => {
    const p = allProducts.find(product => product.id === item.productId);
    if (p) subtotal += p.price * item.quantity;
  });

  const discountPercent = parseInt(localStorage.getItem("fmd_active_discount") || "0");
  const discountVal = (subtotal * discountPercent) / 100;
  const grandTotal = subtotal - discountVal;

  subtotalEl.textContent = `$${subtotal.toLocaleString()}`;

  if (discountPercent > 0 && discountRow && discountEl) {
    discountRow.style.display = "flex";
    discountEl.textContent = `-$${discountVal.toLocaleString()}`;
  } else if (discountRow) {
    discountRow.style.display = "none";
  }

  totalEl.textContent = `$${grandTotal.toLocaleString()}`;
}
