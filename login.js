/**
 * FMD Shopping - Login Page JavaScript Logic
 * Handles credentials checks, session initialization, and Google OAuth Mock authentication
 */

// FILE CONNECTION NOTES:
// This script interacts with:
// - signup.html: when clicking "Create Private Account" to register a new user
// - profile.html: on successful client login
// - admin.html: on successful admin login
// - index.html: fallback landing page on mock logins

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const googleBtn = document.getElementById("btn-google-login");
  const forgotTrigger = document.getElementById("forgot-password-trigger");

  // Mock Credentials DB Check
  const MOCK_ACCOUNTS = [
    {
      email: "alexander@mercerluxury.com",
      password: "password",
      role: "client",
      redirect: "profile.html",
      data: {
        name: "Alexander Mercer",
        email: "alexander@mercerluxury.com",
        phone: "+1 (555) 777-8888",
        tier: "VVIP Gold Member",
        memberSince: "2024",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
      }
    },
    {
      email: "admin@fmd.com",
      password: "admin",
      role: "admin",
      redirect: "admin.html",
      data: {
        name: "Bespoke Curator",
        email: "admin@fmd.com",
        phone: "+1 (800) Gold-FMD",
        tier: "Bespoke Master Curator",
        memberSince: "2021",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop"
      }
    }
  ];

  // 1. FORM SUBMIT HANDLER
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const emailInput = document.getElementById("login-email").value.trim();
      const passwordInput = document.getElementById("login-password").value.trim();
      const rememberMe = document.getElementById("login-remember").checked;

      // Basic front-end checks
      if (!emailInput || !passwordInput) {
        showToast("Please enter all required luxury credentials", "error");
        return;
      }

      // Check registered users from custom signup first
      const registeredUsers = JSON.parse(localStorage.getItem("fmd_registered_users") || "[]");
      const matchedRegUser = registeredUsers.find(u => u.email.toLowerCase() === emailInput.toLowerCase() && u.password === passwordInput);

      if (matchedRegUser) {
        // Successful login for custom registered user
        const activeUser = {
          name: matchedRegUser.name,
          email: matchedRegUser.email,
          phone: matchedRegUser.phone || "+1 (555) 123-4567",
          tier: "Exclusive Club Patron",
          memberSince: "2026",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" // standard sleek guest avatar
        };

        localStorage.setItem("fmd_active_user", JSON.stringify(activeUser));
        showToast(`Welcome back, ${activeUser.name}! Unlocking client portal...`, "success");
        
        setTimeout(() => {
          window.location.href = "profile.html";
        }, 1200);
        return;
      }

      // Check main pre-defined accounts
      const matchedAccount = MOCK_ACCOUNTS.find(
        acc => acc.email.toLowerCase() === emailInput.toLowerCase() && acc.password === passwordInput
      );

      if (matchedAccount) {
        // Save Active Session
        localStorage.setItem("fmd_active_user", JSON.stringify(matchedAccount.data));
        
        showToast(`Access granted! Welcome, ${matchedAccount.data.name}`, "success");
        
        setTimeout(() => {
          // File Connection Note: redirects to profile.html or admin.html based on user tier
          window.location.href = matchedAccount.redirect;
        }, 1200);

      } else {
        showToast("Invalid email credentials or access code. Try alexander@mercerluxury.com / password", "error");
      }
    });
  }

  // 2. GOOGLE LOGIN MOCK
  if (googleBtn) {
    googleBtn.addEventListener("click", () => {
      showToast("Redirecting to secure Google Auth portal...", "info");
      
      googleBtn.style.opacity = "0.7";
      googleBtn.disabled = true;

      setTimeout(() => {
        const googleUser = {
          name: "James Sterling",
          email: "james.sterling@gmail.com",
          phone: "+1 (555) 999-7777",
          tier: "Patron Member",
          memberSince: "2026",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop"
        };

        // Save Google Session
        localStorage.setItem("fmd_active_user", JSON.stringify(googleUser));
        
        showToast("Google account authenticated successfully!", "success");
        
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1000);

      }, 1500);
    });
  }

  // 3. FORGOT PASSWORD TRIGGER
  if (forgotTrigger) {
    forgotTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      
      const email = prompt("Enter your registered email address to receive a private access recovery code:");
      if (email && email.trim() !== "") {
        showToast(`Bespoke recovery link dispatched to ${email.trim()}. Please verify your inbox.`, "success");
      }
    });
  }
});
