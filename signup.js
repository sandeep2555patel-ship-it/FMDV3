/**
 * FMD Shopping - Signup Page JavaScript Logic
 * Handles real-time password strength metrics and customer profile registration
 */

// FILE CONNECTION NOTES:
// This script interacts with:
// - login.html: to direct existing clients or upon account creation success
// - profile.html: logs the registered user in immediately on success

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup-form");
  const passwordInput = document.getElementById("signup-password");
  const confirmInput = document.getElementById("signup-confirm");
  const strengthMeter = document.getElementById("strength-meter");
  const strengthText = document.getElementById("strength-text");

  // 1. PASSWORD STRENGTH METER LOGIC
  if (passwordInput && strengthMeter && strengthText) {
    passwordInput.addEventListener("input", () => {
      const val = passwordInput.value;
      let score = 0;

      if (val.length === 0) {
        strengthMeter.style.width = "0%";
        strengthText.textContent = "Empty";
        strengthText.style.color = "var(--text-secondary)";
        return;
      }

      // Length Criteria
      if (val.length >= 6) score += 20;
      if (val.length >= 10) score += 20;

      // Complexity Criteria
      if (/[A-Z]/.test(val)) score += 20; // Uppercase letter
      if (/[0-9]/.test(val)) score += 20; // Digit
      if (/[^A-Za-z0-9]/.test(val)) score += 20; // Special character

      // Update UI Based on score
      strengthMeter.style.width = `${score}%`;

      if (score <= 40) {
        strengthMeter.style.backgroundColor = "#ef4444"; // Weak - Red
        strengthText.textContent = "Weak (Unsafe)";
        strengthText.style.color = "#ef4444";
      } else if (score <= 80) {
        strengthMeter.style.backgroundColor = "var(--gold-dark)"; // Medium - Gold Dark
        strengthText.textContent = "Medium (Moderate)";
        strengthText.style.color = "var(--gold-primary)";
      } else {
        strengthMeter.style.backgroundColor = "#22c55e"; // Strong - Green
        strengthText.textContent = "Strong (Exceptional Security)";
        strengthText.style.color = "#22c55e";
      }
    });
  }

  // 2. FORM SUBMIT REGISTRATION LOGIC
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("signup-name").value.trim();
      const email = document.getElementById("signup-email").value.trim();
      const phone = document.getElementById("signup-phone").value.trim();
      const password = passwordInput.value;
      const confirm = confirmInput.value;
      const terms = document.getElementById("signup-terms").checked;

      // Basic validations
      if (!name || !email || !phone || !password || !confirm) {
        showToast("Please provide all required private contact specifications", "error");
        return;
      }

      if (password !== confirm) {
        showToast("Password confirmation mismatch. Inputs must match precisely.", "error");
        return;
      }

      if (password.length < 6) {
        showToast("Secure passwords must be at least 6 characters in length", "error");
        return;
      }

      if (!terms) {
        showToast("Agreement to the Luxury Privacy Charter is mandatory", "error");
        return;
      }

      // Check if email already exists
      const existingRegistered = JSON.parse(localStorage.getItem("fmd_registered_users") || "[]");
      if (existingRegistered.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        showToast("This email address already holds an FMD membership. Try signing in.", "error");
        return;
      }

      // Add new registered account
      const newUser = {
        name,
        email,
        phone,
        password, // saved client side only for simulation
        role: "client"
      };

      existingRegistered.push(newUser);
      localStorage.setItem("fmd_registered_users", JSON.stringify(existingRegistered));

      // Log in immediately
      const sessionUser = {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        tier: "Club Patron Member",
        memberSince: "2026",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
      };
      
      localStorage.setItem("fmd_active_user", JSON.stringify(sessionUser));

      showToast(`Congratulations, ${name}! Your elite profile has been constructed.`, "success");

      setTimeout(() => {
        // File Connection Note: redirects to profile page instantly
        window.location.href = "profile.html";
      }, 1500);
    });
  }
});
