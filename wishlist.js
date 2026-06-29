/**
 * FMD Shopping - Wishlist Page JavaScript Logic
 * Renders saved items, handles immediate cart migrations, and animates deletions beautifully
 */

// FILE CONNECTION NOTES:
// This script interacts with:
// - index.html: redirects when shopping catalog is empty
// - product.html?id=[productId]: links when clicking on item titles or images
// - cart.html: when adding wishlist items to bag

document.addEventListener("DOMContentLoaded", () => {
  renderWishlist();
});

function renderWishlist() {
  const grid = document.getElementById("wishlist-items-grid");
  if (!grid) return;

  const wishlistIds = FMD_DB.getWishlist();
  const allProducts = FMD_DB.getProducts();

  // Filter products whose IDs are in the wishlist array
  const wishlistedItems = allProducts.filter(p => wishlistIds.includes(p.id));

  if (wishlistedItems.length === 0) {
    grid.innerHTML = `
      <div class="empty-wishlist">
        <div class="empty-wishlist-icon">
          <i data-lucide="heart" style="width: 32px; height: 32px;"></i>
        </div>
        <h2 style="font-family: var(--font-display); color: var(--text-primary); margin-bottom: 15px;">Your Wishlist is Empty</h2>
        <p style="color: var(--text-secondary); font-size: 0.9rem; max-width: 400px; margin: 0 auto 30px auto; line-height: 1.8;">
          Keep track of your favorite luxury pieces by tapping the heart icon in our catalog. They will be saved here for your private review.
        </p>
        <a href="index.html" class="btn-gold">Explore Gilded Catalog</a>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  grid.innerHTML = "";

  wishlistedItems.forEach(p => {
    const card = document.createElement("div");
    card.className = "wishlist-card";
    card.id = `wishlist-card-${p.id}`;

    card.innerHTML = `
      <div class="wishlist-img-container">
        <img src="${p.image}" class="wishlist-img" alt="${p.name}" onclick="window.location.href='product.html?id=${p.id}'">
        <button class="wishlist-remove-btn" onclick="removeItem(${p.id})" title="Remove Item">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
      <div class="wishlist-info">
        <span class="wishlist-cat">${p.category}</span>
        <h3 class="wishlist-name">
          <a href="product.html?id=${p.id}">${p.name}</a>
        </h3>
        <div class="wishlist-footer">
          <span class="wishlist-price">$${p.price.toLocaleString()}</span>
          <button class="wishlist-add-bag" onclick="moveToCart(${p.id})">
            <i data-lucide="shopping-bag"></i> Add To Bag
          </button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// REMOVE ITEM MICRO-INTERACTION FLOW
window.removeItem = function(id) {
  const card = document.getElementById(`wishlist-card-${id}`);
  if (card) {
    // Add custom animation class
    card.classList.add("removing");
    
    // Perform data updates
    FMD_DB.addToWishlist(id); // Toggles / removes from wishlist DB

    // Wait for the CSS fadeout and scale collapse animation to complete
    setTimeout(() => {
      card.remove();
      
      // If no cards left, trigger full catalog empty render check
      const remainingIds = FMD_DB.getWishlist();
      if (remainingIds.length === 0) {
        renderWishlist();
      }
    }, 400);
  }
};

// MIGRATE ITEM TO CART
window.moveToCart = function(id) {
  // Add to cart DB
  FMD_DB.addToCart(id, 1);
  
  // Optionally remove from wishlist (standard luxury flow to avoid duplicates)
  window.removeItem(id);
};
