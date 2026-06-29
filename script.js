/**
 * FMD Shopping - Global JavaScript Engine
 * Handles shared functionalities: Navbar, Search, Theme Toggle, Local Storage DB, Toast Alerts
 */

// --- INITIAL PRODUCTS DATA (PREMIUM BLACK & GOLD ITEMS) ---
const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Onyx Chronograph",
    category: "Accessories",
    price: 1250,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop", // placeholder premium tech/watch image
    description: "An iconic timepiece styled with an ebonized steel case, custom midnight sunray dial, and 24-carat gold accented indices. Water resistant up to 100 meters, this is the ultimate signature of success.",
    rating: 4.9,
    reviews: 142,
    specs: ["Case Diameter: 42mm", "Strap: Genuine Black Italian Leather", "Movement: Swiss Quartz Chronograph", "Warranty: 5 Years Limited"],
    stock: 12,
    isFeatured: true
  },
  {
    id: 2,
    name: "Golden Aura Perfume",
    category: "Fragrances",
    price: 180,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600&auto=format&fit=crop", // perfume bottle
    description: "A sensual olfactory journey featuring top notes of sparkling bergamot and honeyed amber, a heart of crimson rose, and a deep dry-down of precious gilded oud and pure white musk.",
    rating: 4.8,
    reviews: 98,
    specs: ["Volume: 100ml / 3.4 fl. oz.", "Concentration: Eau de Parfum", "Origin: Grasse, France", "Scent Profile: Oriental Amber Wood"],
    stock: 25,
    isFeatured: true
  },
  {
    id: 3,
    name: "Midnight Heels",
    category: "Footwear",
    price: 850,
    image: "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?q=80&w=600&auto=format&fit=crop", // high heels / shoes
    description: "Feminine power in its finest form. Handcrafted glossy patent leather stiletto heels featuring a structural gold-plated metal collar and a comfortable cushioned calfskin insole.",
    rating: 4.7,
    reviews: 73,
    specs: ["Heel Height: 105mm / 4.1 inches", "Upper: 100% Patent Calf Leather", "Sole: Hand-painted Leather", "Made in Italy"],
    stock: 8,
    isFeatured: true
  },
  {
    id: 4,
    name: "Aurum Tote Bag",
    category: "Bags",
    price: 2100,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop", // stylish bag
    description: "Exquisite craftsmanship meets modern utility. Built from premium full-grain pebbled leather and secured with a signature 24-karat gold gold-plated twist-lock system.",
    rating: 5.0,
    reviews: 54,
    specs: ["Dimensions: 35 x 27 x 14 cm", "Hardware: 24k Gold-Plated Brass", "Interior: Gilded lambskin lining", "Includes protective dust bag"],
    stock: 5,
    isFeatured: true
  },
  {
    id: 5,
    name: "Sol Obsidian Glasses",
    category: "Accessories",
    price: 320,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop", // sunglasses
    description: "Retro aviator silhouette updated with jet-black polarized lenses and polished metallic gold architectural temples. Elegant sun protection for the modern tastemaker.",
    rating: 4.6,
    reviews: 110,
    specs: ["UV Protection: 100% UVA/UVB", "Frame: Stainless Steel & Acetate", "Lens Tech: Polarized Anti-Glare", "Fit: Standard / Unisex"],
    stock: 40,
    isFeatured: false
  },
  {
    id: 6,
    name: "Imperial Velvet Blazer",
    category: "Apparel",
    price: 950,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop", // suit/blazer
    description: "Exquisite evening luxury. Tailored from premium midnight-black velvet fabric with sleek silk-satin peak lapels and a single gold-engraved statement button clasp.",
    rating: 4.9,
    reviews: 67,
    specs: ["Material: 100% Cotton Velvet", "Details: Silk-Satin lapels and piping", "Fitting: Slim-fit bespoke cut", "Dry clean only"],
    stock: 14,
    isFeatured: false
  },
  {
    id: 7,
    name: "Elysium Silk Scarf",
    category: "Apparel",
    price: 140,
    image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=600&auto=format&fit=crop", // scarf/silk items
    description: "Woven entirely from finest Mulberry silk and featuring an elegant, hand-rolled gold filigree border illustration. A delicate draping masterwork of pure luxury.",
    rating: 4.5,
    reviews: 32,
    specs: ["Dimensions: 90 x 90 cm", "Material: 100% Grade-A Mulberry Silk", "Edges: Hand-rolled, hand-stitched", "Lustrous satin finish"],
    stock: 30,
    isFeatured: false
  },
  {
    id: 8,
    name: "Gold-Leaf Fountain Pen",
    category: "Accessories",
    price: 410,
    image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=600&auto=format&fit=crop", // pen
    description: "Elevate your daily writing into an artistic performance. Hand-assembled black resin body featuring a highly-detailed 14k gold nib and modular ink piston filling.",
    rating: 4.9,
    reviews: 41,
    specs: ["Nib Material: 14k Gold Medium Nib", "Body: Precious Black Resin", "Cap Type: Screw-on with gold clip", "Weight: 26g well-balanced"],
    stock: 15,
    isFeatured: false
  }
];

// --- CORE LOCALSTORAGE DB INITIALIZATION ---
function initDatabase() {
  if (!localStorage.getItem("fmd_products")) {
    localStorage.setItem("fmd_products", JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem("fmd_cart")) {
    localStorage.setItem("fmd_cart", JSON.stringify([]));
  }
  if (!localStorage.getItem("fmd_wishlist")) {
    localStorage.setItem("fmd_wishlist", JSON.stringify([]));
  }
  if (!localStorage.getItem("fmd_theme")) {
    localStorage.setItem("fmd_theme", "dark");
  }
  if (!localStorage.getItem("fmd_user")) {
    // Default guest profile
    localStorage.setItem("fmd_user", JSON.stringify({
      name: "Alexander Mercer",
      email: "alexander@mercerluxury.com",
      phone: "+1 (555) 777-8888",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
      tier: "VVIP Gold Member",
      memberSince: "2024",
      address: {
        street: "740 Park Avenue, Apt 12B",
        city: "New York",
        zip: "10021",
        country: "United States"
      },
      orders: [
        { id: "FMD-98721", date: "2026-05-14", total: 3220, status: "Delivered", itemsCount: 2 },
        { id: "FMD-95112", date: "2026-02-28", total: 180, status: "Delivered", itemsCount: 1 }
      ]
    }));
  }
}

// Execute DB initialization immediately
initDatabase();

// --- DOM READINESS ENGINE ---
document.addEventListener("DOMContentLoaded", () => {
  // 1. Hide Loader
  const loader = document.getElementById("loading-overlay");
  if (loader) {
    setTimeout(() => {
      loader.classList.add("hidden");
    }, 500);
  }

  // 2. Initialize Lucide Icons (CDN version)
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 3. Initialize Navbar Interactions
  initNavbar();

  // 4. Initialize Search Overlay
  initSearchOverlay();

  // 5. Initialize Theme Switcher
  initTheme();

  // 6. Initialize Back to Top
  initBackToTop();

  // 7. Update Global Badge Counters on startup
  updateCounters();

  // 8. Page Specific Hook (optional custom callbacks)
  if (window.onPageLoad) {
    window.onPageLoad();
  }
});

// --- NAVIGATION LOGIC ---
function initNavbar() {
  const header = document.querySelector("header");
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  const profileBtn = document.getElementById("profile-btn");
  const profileDropdown = document.getElementById("profile-dropdown");

  // Sticky navbar shadow and height shrinkage on scroll
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // Mobile menu toggle
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navLinks.classList.toggle("active");
    });

    // Close mobile menu on clicking links
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navLinks.classList.remove("active");
      });
    });
  }

  // Profile dropdown toggle
  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle("active");
    });

    // Close dropdown on click outside
    document.addEventListener("click", (e) => {
      if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
        profileDropdown.classList.remove("active");
      }
    });
  }
}

// --- FLOATING SEARCH BAR LOGIC ---
function initSearchOverlay() {
  const searchBtn = document.getElementById("search-btn");
  const searchOverlay = document.getElementById("search-overlay");
  const searchClose = document.getElementById("search-close");
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");

  if (searchBtn && searchOverlay && searchClose) {
    searchBtn.addEventListener("click", () => {
      searchOverlay.classList.add("active");
      setTimeout(() => {
        if (searchInput) searchInput.focus();
      }, 100);
    });

    searchClose.addEventListener("click", () => {
      searchOverlay.classList.remove("active");
    });

    // Close search overlay with Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && searchOverlay.classList.contains("active")) {
        searchOverlay.classList.remove("active");
      }
    });

    // Action of searching
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
          searchOverlay.classList.remove("active");
          // Redirect with query parameter to index.html (showing catalog)
          // File Connection Note: Redirects to index.html with a query param
          window.location.href = `index.html?search=${encodeURIComponent(query)}`;
        }
      });
    }
  }
}

// --- LIGHT / DARK MODE SYSTEM ---
function initTheme() {
  const themeToggle = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("fmd_theme") || "dark";
  
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      
      document.documentElement.setAttribute("data-theme", nextTheme);
      localStorage.setItem("fmd_theme", nextTheme);
      updateThemeIcon(nextTheme);
      showToast(`Switched to ${nextTheme === 'dark' ? 'Premium Midnight' : 'Champagne Light'} mode`, "info");
    });
  }
}

function updateThemeIcon(theme) {
  const iconSpan = document.querySelector("#theme-toggle i");
  if (iconSpan) {
    if (theme === "light") {
      iconSpan.setAttribute("data-lucide", "moon");
    } else {
      iconSpan.setAttribute("data-lucide", "sun");
    }
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}

// --- BACK TO TOP ENGINE ---
function initBackToTop() {
  const backBtn = document.getElementById("back-to-top");
  if (backBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 400) {
        backBtn.classList.add("visible");
      } else {
        backBtn.classList.remove("visible");
      }
    });

    backBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
}

// --- TOAST NOTIFICATIONS ENGINE ---
window.showToast = function(message, type = "success") {
  // Ensure toast container exists
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  // Create individual toast card
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  let iconName = "check-circle";
  if (type === "info") iconName = "info";
  if (type === "error") iconName = "alert-circle";

  toast.innerHTML = `
    <div class="toast-icon ${type}">
      <i data-lucide="${iconName}"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${type.toUpperCase()}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close">
      <i data-lucide="x"></i>
    </button>
  `;

  container.appendChild(toast);
  
  // Create icons inside the new toast
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Close event listener
  const closeBtn = toast.querySelector(".toast-close");
  closeBtn.addEventListener("click", () => {
    toast.style.animation = "fadeOut 0.3s ease-out forwards";
    setTimeout(() => {
      toast.remove();
    }, 300);
  });

  // Auto remove after 4 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.animation = "fadeOut 0.3s ease-out forwards";
      setTimeout(() => {
        toast.remove();
      }, 300);
    }
  }, 4000);
};

// --- SYNCRONIZATION COUNTERS MANAGER ---
window.updateCounters = function() {
  const cart = JSON.parse(localStorage.getItem("fmd_cart") || "[]");
  const wishlist = JSON.parse(localStorage.getItem("fmd_wishlist") || "[]");

  const cartBadges = document.querySelectorAll(".cart-count");
  const wishlistBadges = document.querySelectorAll(".wishlist-count");

  // Sum total items in cart (quantities counted)
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistItemCount = wishlist.length;

  cartBadges.forEach(badge => {
    badge.textContent = cartItemCount;
    badge.style.display = cartItemCount > 0 ? "flex" : "none";
  });

  wishlistBadges.forEach(badge => {
    badge.textContent = wishlistItemCount;
    badge.style.display = wishlistItemCount > 0 ? "flex" : "none";
  });
};

// --- GLOBAL DATABASE CORE OPERATIONS ---
window.FMD_DB = {
  getProducts: function() {
    return JSON.parse(localStorage.getItem("fmd_products") || "[]");
  },
  
  getProductById: function(id) {
    const products = this.getProducts();
    return products.find(p => p.id === parseInt(id));
  },
  
  saveProducts: function(products) {
    localStorage.setItem("fmd_products", JSON.stringify(products));
  },

  getCart: function() {
    return JSON.parse(localStorage.getItem("fmd_cart") || "[]");
  },

  getWishlist: function() {
    return JSON.parse(localStorage.getItem("fmd_wishlist") || "[]");
  },

  addToCart: function(productId, quantity = 1, size = "Standard") {
    const cart = this.getCart();
    const product = this.getProductById(productId);

    if (!product) {
      window.showToast("Product not found", "error");
      return;
    }

    // Check if item with exact product id and size exists in cart
    const existingIndex = cart.findIndex(item => item.id === product.id && item.size === size);

    if (existingIndex !== -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        size: size,
        quantity: quantity
      });
    }

    localStorage.setItem("fmd_cart", JSON.stringify(cart));
    window.updateCounters();
    window.showToast(`Added ${product.name} (${size}) to your Shopping Bag!`, "success");
  },

  addToWishlist: function(productId) {
    const wishlist = this.getWishlist();
    const product = this.getProductById(productId);

    if (!product) {
      window.showToast("Product not found", "error");
      return;
    }

    if (wishlist.some(id => id === product.id)) {
      // Remove it if already wishlisted (Toggle action)
      const updatedWishlist = wishlist.filter(id => id !== product.id);
      localStorage.setItem("fmd_wishlist", JSON.stringify(updatedWishlist));
      window.updateCounters();
      window.showToast(`Removed ${product.name} from Wishlist`, "info");
      return false; // indicates removed
    } else {
      wishlist.push(product.id);
      localStorage.setItem("fmd_wishlist", JSON.stringify(wishlist));
      window.updateCounters();
      window.showToast(`Saved ${product.name} to Wishlist`, "success");
      return true; // indicates added
    }
  }
};
