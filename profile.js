/**
 * FMD Shopping - Profile Page JavaScript Logic
 * Governs luxury client accounts, shipping forms, order history, and security logs
 */

// FILE CONNECTION NOTES:
// This script interacts with:
// - login.html: redirects signed-out clients to register or sign-in
// - index.html: redirects to home catalog on user session logout

document.addEventListener("DOMContentLoaded", () => {
  const activeUser = JSON.parse(localStorage.getItem("fmd_active_user"));

  const lockedScreen = document.getElementById("access-locked-screen");
  const authScreen = document.getElementById("authorized-profile-screen");

  // 1. GUEST vs PATRON SECURITY GATE
  if (!activeUser) {
    if (lockedScreen && authScreen) {
      lockedScreen.style.display = "flex";
      authScreen.style.display = "none";
    }
    return;
  } else {
    if (lockedScreen && authScreen) {
      lockedScreen.style.display = "none";
      authScreen.style.display = "block";
    }
  }

  // 2. FILL PERSONAL PROFILE FIELDS
  populateProfile(activeUser);

  // 3. TAB TOGGLING ENGINE
  setupTabs();

  // 4. RENDERING ORDER HISTORY
  renderOrders(activeUser);

  // 5. EDIT AVATAR SYSTEM
  const editAvatarBtn = document.getElementById("edit-avatar-btn");
  if (editAvatarBtn) {
    editAvatarBtn.addEventListener("click", () => {
      const newUrl = prompt("Enter a luxury image URL for your profile avatar portrait:", activeUser.avatar);
      if (newUrl && newUrl.trim() !== "") {
        activeUser.avatar = newUrl.trim();
        localStorage.setItem("fmd_active_user", JSON.stringify(activeUser));
        
        // Update both the mock registered user array and standard db
        const registered = JSON.parse(localStorage.getItem("fmd_registered_users") || "[]");
        const idx = registered.findIndex(u => u.email.toLowerCase() === activeUser.email.toLowerCase());
        if (idx !== -1) {
          registered[idx].avatar = newUrl.trim();
          localStorage.setItem("fmd_registered_users", JSON.stringify(registered));
        }

        document.getElementById("profile-avatar").src = newUrl.trim();
        showToast("Profile avatar portrait updated successfully!", "success");
      }
    });
  }

  // 6. FORM SAVE PROFILE DETAILS
  const detailsForm = document.getElementById("profile-details-form");
  if (detailsForm) {
    detailsForm.addEventListener("submit", (e) => {
      e.preventDefault();

      activeUser.name = document.getElementById("prof-name").value.trim();
      activeUser.phone = document.getElementById("prof-phone").value.trim();
      
      // Save Address block
      activeUser.address = {
        street: document.getElementById("prof-street").value.trim(),
        city: document.getElementById("prof-city").value.trim(),
        zip: document.getElementById("prof-zip").value.trim(),
        country: document.getElementById("prof-country").value.trim()
      };

      // Save to Active user and update database
      localStorage.setItem("fmd_active_user", JSON.stringify(activeUser));
      
      // Mirror to registered accounts
      const registered = JSON.parse(localStorage.getItem("fmd_registered_users") || "[]");
      const idx = registered.findIndex(u => u.email.toLowerCase() === activeUser.email.toLowerCase());
      if (idx !== -1) {
        registered[idx].name = activeUser.name;
        registered[idx].phone = activeUser.phone;
        registered[idx].address = activeUser.address;
        localStorage.setItem("fmd_registered_users", JSON.stringify(registered));
      }

      // Sync master navbar name if displayed
      const nameBadge = document.getElementById("dropdown-user-name");
      if (nameBadge) nameBadge.textContent = activeUser.name;

      document.getElementById("profile-user-name").textContent = activeUser.name;
      document.getElementById("profile-user-phone").textContent = activeUser.phone;

      showToast("Bespoke profile credentials and shipping parameters secured!", "success");
    });
  }

  // 7. LOGOUT SESSION BUTTON
  const logoutBtn = document.getElementById("profile-logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("fmd_active_user");
      showToast("Terminating secure connection. Safeguarding credentials...", "info");
      
      setTimeout(() => {
        // File Connection Note: redirects back to catalog main index
        window.location.href = "index.html";
      }, 1000);
    });
  }
});

// POPULATOR UTIL
function populateProfile(user) {
  document.getElementById("profile-avatar").src = user.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop";
  document.getElementById("profile-user-name").textContent = user.name;
  document.getElementById("profile-user-tier").textContent = user.tier || "Exquisite Club Patron";
  document.getElementById("profile-member-since").textContent = user.memberSince || "2026";
  document.getElementById("profile-user-phone").textContent = user.phone || "+1 (555) 000-0000";

  // Form Fields fill
  document.getElementById("prof-name").value = user.name;
  document.getElementById("prof-phone").value = user.phone || "";
  document.getElementById("prof-email").value = user.email;

  // Address block fill
  if (user.address) {
    document.getElementById("prof-street").value = user.address.street || "";
    document.getElementById("prof-city").value = user.address.city || "";
    document.getElementById("prof-zip").value = user.address.zip || "";
    document.getElementById("prof-country").value = user.address.country || "";
  }
}

// TABS UTIL
function setupTabs() {
  const tabs = document.querySelectorAll(".profile-tab-btn");
  const contents = document.querySelectorAll(".profile-tab-content");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetId = tab.getAttribute("data-tab");

      tabs.forEach(t => t.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));

      tab.classList.add("active");
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add("active");
    });
  });
}

// RENDER HISTORICAL ORDERS UTIL
function renderOrders(user) {
  const listContainer = document.getElementById("profile-order-list");
  if (!listContainer) return;

  // Fetch clientorders from fmd_orders or initial fallback list
  const allOrders = JSON.parse(localStorage.getItem("fmd_orders") || "[]");
  
  // Filter only current client's orders by email
  const clientOrders = allOrders.filter(o => o.userEmail.toLowerCase() === user.email.toLowerCase());

  // If none from dynamic check, read fallback from profile
  const ordersToRender = clientOrders.length > 0 ? clientOrders : (user.orders || []);

  if (ordersToRender.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-orders">
        <i data-lucide="shopping-bag" style="width: 48px; height: 48px; color: var(--gold-primary); margin-bottom: 15px;"></i>
        <h4 style="font-family: var(--font-display); color: var(--text-primary); margin-bottom: 10px;">Zero Active Invoices</h4>
        <p style="color: var(--text-secondary); font-size: 0.85rem; max-width: 320px; margin: 0 auto 20px auto;">
          You have not placed any bespoke commissions yet. Your order invoice history is empty.
        </p>
        <a href="index.html" class="btn-gold" style="font-size: 0.75rem; padding: 10px 20px;">Explore Products</a>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  listContainer.innerHTML = "";

  ordersToRender.forEach(order => {
    const card = document.createElement("div");
    card.className = "order-card";

    // Format ID
    const displayId = order.id.startsWith("FMD-") ? order.id : `FMD-${order.id}`;
    const dateFormatted = order.date;
    const statusLower = order.status.toLowerCase();
    const statusClass = statusLower === "delivered" ? "delivered" : "processing";

    card.innerHTML = `
      <div class="order-card-header">
        <div class="order-id">${displayId}</div>
        <div class="order-date"><i data-lucide="calendar" style="width: 12px; height: 12px; display: inline; vertical-align: middle; margin-right: 5px;"></i> ${dateFormatted}</div>
        <div class="order-status-pill ${statusClass}">${order.status}</div>
      </div>
      <div class="order-card-body">
        <div class="order-summary-details">
          <p style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 1px;">Invoice Subtotal</p>
          <div class="order-total-price">$${order.total.toLocaleString()}</div>
        </div>
        <div class="order-items-summary">
          <span style="border: 1px solid var(--glass-border); padding: 6px 12px; border-radius: var(--border-radius-sm); font-size: 0.75rem; background: rgba(255,255,255,0.02)">
            ${order.itemsCount || 1} exclusive item${(order.itemsCount || 1) > 1 ? 's' : ''}
          </span>
        </div>
      </div>
    `;

    listContainer.appendChild(card);
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}
