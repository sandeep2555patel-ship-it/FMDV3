/**
 * FMD Shopping - Secured Checkout Page JavaScript Logic
 * pre-fills profiles, mirrors live bankcard numbers, handles shipping calculations, and archives invoice databases on submission
 */

// FILE CONNECTION NOTES:
// This script interacts with:
// - cart.html: checks cart item listings and reads discount multipliers
// - profile.html: logs finalized orders into the user dashboard account

document.addEventListener("DOMContentLoaded", () => {
  const cart = JSON.parse(localStorage.getItem("fmd_cart") || "[]");
  
  if (cart.length === 0) {
    showToast("Your shopping bag is empty. Redirecting to collections...", "error");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
    return;
  }

  const activeUser = JSON.parse(localStorage.getItem("fmd_active_user"));
  const allProducts = FMD_DB.getProducts();

  let shippingCost = 0; // standard default is free
  let discountPercent = parseInt(localStorage.getItem("fmd_active_discount") || "0");

  // 1. PRE-FILL SHIPPING COORDINATES FOR AUTHENTICATED PATRONS
  if (activeUser) {
    document.getElementById("chk-name").value = activeUser.name || "";
    document.getElementById("chk-email").value = activeUser.email || "";
    document.getElementById("chk-phone").value = activeUser.phone || "";
    
    // Fill Card Holder default preview
    document.getElementById("pay-cardholder").value = activeUser.name || "";
    document.getElementById("card-name-preview").textContent = activeUser.name || "Alexander Mercer";

    if (activeUser.address) {
      document.getElementById("chk-street").value = activeUser.address.street || "";
      document.getElementById("chk-city").value = activeUser.address.city || "";
      document.getElementById("chk-zip").value = activeUser.address.zip || "";
      document.getElementById("chk-country").value = activeUser.address.country || "";
    }
  }

  // 2. RENDER ACTIVE CHECKOUT ITEMS PREVIEW DRAWER
  renderCheckoutDrawer(cart, allProducts);

  // 3. RECALCULATE LOGISTICS ON RADIO CHANGING
  const stdRadio = document.getElementById("radio-delivery-std");
  const overnightRadio = document.getElementById("radio-delivery-overnight");
  const stdLabel = document.getElementById("label-delivery-std");
  const overnightLabel = document.getElementById("label-delivery-overnight");

  if (stdRadio && overnightRadio) {
    stdRadio.addEventListener("change", () => {
      if (stdRadio.checked) {
        shippingCost = 0;
        stdLabel.classList.add("active");
        overnightLabel.classList.remove("active");
        recalculateTotals(cart, allProducts, shippingCost, discountPercent);
      }
    });

    overnightRadio.addEventListener("change", () => {
      if (overnightRadio.checked) {
        shippingCost = 50;
        overnightLabel.classList.add("active");
        stdLabel.classList.remove("active");
        recalculateTotals(cart, allProducts, shippingCost, discountPercent);
      }
    });
  }

  // Initialize prices
  recalculateTotals(cart, allProducts, shippingCost, discountPercent);

  // 4. LIVE CREDIT CARD INPUT MIRROR SYNC
  setupCardMirror();

  // 5. MASTER FORM SUBMIT ORDER CLOSING
  const masterForm = document.getElementById("checkout-master-form");
  if (masterForm) {
    masterForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("chk-name").value.trim();
      const emailInput = document.getElementById("chk-email").value.trim().toLowerCase();
      const phoneInput = document.getElementById("chk-phone").value.trim();
      
      const speedText = shippingCost === 50 ? "Platinum VIP Overnight Courier" : "Express Gilded Air";

      // Form validation check
      if (!nameInput || !emailInput || !phoneInput) {
        showToast("Please declare your secure shipping parameters", "error");
        return;
      }

      // Calculate totals one final time
      let subtotal = 0;
      let itemsCount = 0;
      cart.forEach(item => {
        const p = allProducts.find(product => product.id === item.productId);
        if (p) {
          subtotal += p.price * item.quantity;
          itemsCount += item.quantity;
        }
      });

      const discountValue = (subtotal * discountPercent) / 100;
      const finalAmount = subtotal - discountValue + shippingCost;

      // Construct Invoice Order Object
      const orderId = `FMD-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const newOrder = {
        id: orderId,
        userEmail: emailInput,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        status: "Processing",
        total: finalAmount,
        itemsCount: itemsCount,
        speed: speedText
      };

      // Push order to local fmd_orders database
      const allOrders = JSON.parse(localStorage.getItem("fmd_orders") || "[]");
      allOrders.unshift(newOrder);
      localStorage.setItem("fmd_orders", JSON.stringify(allOrders));

      // Wipe current Cart from DB
      localStorage.setItem("fmd_cart", "[]");
      updateGlobalCounters();

      // Show Successful Purchase overlay
      const overlay = document.getElementById("success-overlay-container");
      if (overlay) {
        document.getElementById("success-tx-hash").textContent = orderId;
        document.getElementById("success-receipt-delivery").textContent = speedText;
        document.getElementById("success-receipt-client").textContent = nameInput;
        document.getElementById("success-receipt-amount").textContent = `$${finalAmount.toLocaleString()}`;

        overlay.style.display = "flex";
      }

      showToast("Order transaction sealed and authenticated!", "success");
    });
  }
});

// DRAWER RENDERER
function renderCheckoutDrawer(cart, allProducts) {
  const listContainer = document.getElementById("checkout-items-list");
  if (!listContainer) return;

  listContainer.innerHTML = "";

  cart.forEach(item => {
    const p = allProducts.find(product => product.id === item.productId);
    if (!p) return;

    const line = document.createElement("div");
    line.className = "checkout-item-line";
    
    line.innerHTML = `
      <img src="${p.image}" class="checkout-item-thumb" alt="${p.name}">
      <div class="checkout-item-info">
        <h4 class="checkout-item-title">${p.name}</h4>
        <span class="checkout-item-meta">${item.selectedSize} | Qty: ${item.quantity}</span>
      </div>
      <div class="checkout-item-price">$${(p.price * item.quantity).toLocaleString()}</div>
    `;

    listContainer.appendChild(line);
  });
}

// INVOICE MATH CALCULATOR
function recalculateTotals(cart, allProducts, shipping, discount) {
  const subtotalEl = document.getElementById("chk-subtotal");
  const shippingValEl = document.getElementById("chk-shipping-val");
  const discountRow = document.getElementById("chk-discount-row");
  const discountValEl = document.getElementById("chk-discount-val");
  const grandtotalEl = document.getElementById("chk-grandtotal");

  if (!subtotalEl || !grandtotalEl) return;

  let subtotal = 0;
  cart.forEach(item => {
    const p = allProducts.find(product => product.id === item.productId);
    if (p) subtotal += p.price * item.quantity;
  });

  const discountValue = (subtotal * discount) / 100;
  const grandTotal = subtotal - discountValue + shipping;

  subtotalEl.textContent = `$${subtotal.toLocaleString()}`;
  shippingValEl.textContent = shipping === 50 ? "+$50" : "COMPLEMENTARY EXPRESS";

  if (discount > 0 && discountRow && discountValEl) {
    discountRow.style.display = "flex";
    discountValEl.textContent = `-$${discountValue.toLocaleString()}`;
  } else if (discountRow) {
    discountRow.style.display = "none";
  }

  grandtotalEl.textContent = `$${grandTotal.toLocaleString()}`;
}

// LIVE SYNC CARD MIRROR INTERACTIVE HANDLERS
function setupCardMirror() {
  const nameInput = document.getElementById("pay-cardholder");
  const numInput = document.getElementById("pay-cardnumber");
  const expInput = document.getElementById("pay-expiry");

  const namePreview = document.getElementById("card-name-preview");
  const numPreview = document.getElementById("card-num-preview");
  const expPreview = document.getElementById("card-expiry-preview");

  if (nameInput && namePreview) {
    nameInput.addEventListener("input", () => {
      namePreview.textContent = nameInput.value.trim() === "" ? "James Sterling" : nameInput.value;
    });
  }

  if (numInput && numPreview) {
    numInput.addEventListener("input", (e) => {
      // Clean letters and format XXXX XXXX XXXX XXXX
      let val = numInput.value.replace(/\D/g, "");
      let formatted = "";
      for (let i = 0; i < val.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formatted += " ";
        }
        formatted += val[i];
      }
      numInput.value = formatted;
      numPreview.textContent = formatted === "" ? "•••• •••• •••• ••••" : formatted;
    });
  }

  if (expInput && expPreview) {
    expInput.addEventListener("input", () => {
      let val = expInput.value.replace(/\D/g, "");
      if (val.length >= 2) {
        expInput.value = val.slice(0, 2) + "/" + val.slice(2, 4);
      } else {
        expInput.value = val;
      }
      expPreview.textContent = expInput.value === "" ? "12/29" : expInput.value;
    });
  }
}
