/**
 * FMD Shopping - Admin Master Portal JavaScript Logic
 * Computes consolidated sales, lists inventories, adds bespoke catalog designs, and manages order fulfillment
 */

// FILE CONNECTION NOTES:
// This script interacts with:
// - index.html: displays added products instantly inside the main landing page
// - profile.html: mirrors updated status changes ("Delivered") directly to the customer dashboard

document.addEventListener("DOMContentLoaded", () => {
  renderAdminPage();

  // FORM ADD NEW DESIGN
  const addForm = document.getElementById("admin-add-product-form");
  if (addForm) {
    addForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const title = document.getElementById("adm-title").value.trim();
      const category = document.getElementById("adm-category").value;
      const price = parseFloat(document.getElementById("adm-price").value) || 0;
      const stock = parseInt(document.getElementById("adm-stock").value) || 0;
      const image = document.getElementById("adm-image").value.trim();
      const desc = document.getElementById("adm-desc").value.trim();

      if (!title || !price || !stock || !image || !desc) {
        showToast("Please supply all design specifications", "error");
        return;
      }

      // Construct Product Model
      const newProduct = {
        id: Math.floor(Date.now() / 1000), // unique timestamp-based ID
        name: title,
        category: category,
        price: price,
        rating: 4.8, // standard high default rating
        reviews: 1,  // initial mock review
        image: image,
        description: desc,
        stock: stock,
        specs: ["Material: Golden Standard Detailing", "Certificate: Curator Hand-Signed Card"],
        isFeatured: true
      };

      // Add to Database
      const allProducts = FMD_DB.getProducts();
      allProducts.push(newProduct);
      localStorage.setItem("fmd_products", JSON.stringify(allProducts));

      // Reset form fields
      addForm.reset();

      // Refresh layouts and counters
      renderAdminPage();
      showToast(`Commission Sealed: "${title}" is now added to the FMD catalog!`, "success");
    });
  }
});

function renderAdminPage() {
  const inventoryList = document.getElementById("admin-inventory-list");
  const ordersList = document.getElementById("admin-orders-list");

  const turnoverEl = document.getElementById("metric-turnover");
  const ordersCountEl = document.getElementById("metric-orders-count");
  const productsCountEl = document.getElementById("metric-products-count");
  const patronsCountEl = document.getElementById("metric-patrons-count");

  const allProducts = FMD_DB.getProducts();
  const allOrders = JSON.parse(localStorage.getItem("fmd_orders") || "[]");
  const registeredUsers = JSON.parse(localStorage.getItem("fmd_registered_users") || "[]");

  // 1. CALCULATE METRICS
  let consolidatedSales = 0;
  allOrders.forEach(o => {
    consolidatedSales += o.total;
  });

  if (turnoverEl) turnoverEl.textContent = `$${consolidatedSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (ordersCountEl) ordersCountEl.textContent = allOrders.length;
  if (productsCountEl) productsCountEl.textContent = allProducts.length;
  if (patronsCountEl) patronsCountEl.textContent = registeredUsers.length + 2; // Including 2 pre-defined accounts

  // 2. RENDER DESIGN INVENTORY TABLE
  if (inventoryList) {
    inventoryList.innerHTML = "";
    
    if (allProducts.length === 0) {
      inventoryList.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 40px 0;">No catalog designs found.</td></tr>`;
    } else {
      allProducts.forEach(p => {
        const tr = document.createElement("tr");
        
        tr.innerHTML = `
          <td><img src="${p.image}" class="admin-prod-thumb" alt="${p.name}"></td>
          <td style="font-weight: 600;">${p.name}</td>
          <td><span class="cart-item-spec-badge">${p.category}</span></td>
          <td style="font-family: var(--font-display); font-weight: 700;">$${p.price.toLocaleString()}</td>
          <td style="font-weight: 600;">${p.stock} units</td>
          <td style="text-align: right;">
            <button class="admin-action-btn-danger" onclick="deleteProduct(${p.id})" title="Delete Product">
              <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
            </button>
          </td>
        `;
        
        inventoryList.appendChild(tr);
      });
    }
  }

  // 3. RENDER COMMISSIONS AUDIT TABLE
  if (ordersList) {
    ordersList.innerHTML = "";

    if (allOrders.length === 0) {
      ordersList.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 40px 0;">No client orders logged.</td></tr>`;
    } else {
      allOrders.forEach(o => {
        const tr = document.createElement("tr");
        
        const displayId = o.id.startsWith("FMD-") ? o.id : `FMD-${o.id}`;
        const statusLower = o.status.toLowerCase();
        const statusClass = statusLower === "delivered" ? "delivered" : "processing";

        tr.innerHTML = `
          <td style="font-family: var(--font-display); font-weight: 700; color: var(--gold-primary);">${displayId}</td>
          <td>${o.userEmail}</td>
          <td>${o.date}</td>
          <td><span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary);">${o.speed || 'Express'}</span></td>
          <td style="font-family: var(--font-display); font-weight: 700;">$${o.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          <td><span class="order-status-pill ${statusClass}">${o.status}</span></td>
          <td style="text-align: right;">
            <button class="admin-status-update-btn" onclick="toggleOrderStatus('${o.id}')">
              Mark ${o.status === "Processing" ? 'Delivered' : 'Processing'}
            </button>
          </td>
        `;

        ordersList.appendChild(tr);
      });
    }
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// INVENTORY DELETE HANDLER
window.deleteProduct = function(productId) {
  const confirmWipe = confirm("Are you sure you want to permanently withdraw this design commission from the catalog?");
  if (confirmWipe) {
    let allProducts = FMD_DB.getProducts();
    allProducts = allProducts.filter(p => p.id !== productId);
    localStorage.setItem("fmd_products", JSON.stringify(allProducts));
    
    renderAdminPage();
    showToast("Design withdrawn from boutique collections successfully.", "info");
  }
};

// ORDER STATUS TOGGLER
window.toggleOrderStatus = function(orderId) {
  const allOrders = JSON.parse(localStorage.getItem("fmd_orders") || "[]");
  const order = allOrders.find(o => o.id === orderId);
  
  if (order) {
    order.status = order.status === "Processing" ? "Delivered" : "Processing";
    localStorage.setItem("fmd_orders", JSON.stringify(allOrders));
    
    renderAdminPage();
    showToast(`Order Status modified to: ${order.status}`, "success");
  }
};
