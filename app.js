document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const langSelector = document.getElementById("langSelector");
  const langButtons = langSelector.querySelectorAll(".lang-btn");

  const toggleSlider = document.getElementById("toggleSlider");
  const toggleB2C = document.getElementById("toggleB2C");
  const toggleB2B = document.getElementById("toggleB2B");

  const companyFields = document.getElementById("companyFields");
  const budgetField = document.getElementById("budgetField");
  const companyNameInput = document.getElementById("companyName");
  const industryInput = document.getElementById("industry");
  const budgetInput = document.getElementById("budget");

  const contactForm = document.getElementById("contactForm");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = submitBtn.querySelector(".btn-text");
  const btnLoader = submitBtn.querySelector(".btn-loader");
  const btnArrow = submitBtn.querySelector(".btn-arrow");

  const successMessage = document.getElementById("successMessage");
  const resetBtn = document.getElementById("resetBtn");
  const submitError = document.getElementById("submitError");

  // --- State Variables ---
  let currentLang = "fr";
  let currentType = "b2c"; // "b2c" or "b2b"

  // --- 1. Bilingual System (i18n) ---
  function initLanguage() {
    // Detect system language
    const savedLang = localStorage.getItem("preferred_lang");
    if (
      savedLang &&
      (savedLang === "fr" || savedLang === "en" || savedLang === "ar")
    ) {
      currentLang = savedLang;
    } else {
      const browserLang = (
        navigator.language || navigator.userLanguage
      ).toLowerCase();
      if (browserLang.startsWith("fr")) {
        currentLang = "fr";
      } else if (browserLang.startsWith("ar")) {
        currentLang = "ar";
      } else {
        currentLang = "en";
      }
    }
    updateLanguageUI();
  }

  function updateLanguageUI() {
    // Update document lang & dir attributes
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";

    // Update Selector button active class
    langButtons.forEach((btn) => {
      if (btn.getAttribute("data-lang") === currentLang) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Translate standard text content
    document.querySelectorAll("[data-i18n]").forEach((elem) => {
      const key = elem.getAttribute("data-i18n");
      if (translations[currentLang][key]) {
        // If it is a select option placeholder that is disabled
        if (elem.tagName === "OPTION" && elem.disabled) {
          elem.textContent = translations[currentLang][key];
        } else {
          elem.textContent = translations[currentLang][key];
        }
      }
    });

    // Translate placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach((elem) => {
      const key = elem.getAttribute("data-i18n-placeholder");
      if (translations[currentLang][key]) {
        elem.setAttribute("placeholder", translations[currentLang][key]);
      }
    });

    // Retranslate any active validation error messages
    document.querySelectorAll(".error-message").forEach((errorSpan) => {
      if (errorSpan.id === "submitError") return;
      const parent = errorSpan.closest(".form-group");
      const input = parent.querySelector("input, select, textarea");
      if (input) {
        errorSpan.textContent = getValidationErrorMessage(input);
      }
    });

    if (submitError && !submitError.classList.contains("hidden")) {
      submitError.textContent = translations[currentLang].errSubmit || "An error occurred. Please try again.";
    }

    // Update toggle slider position for the new language direction
    updateToggleSlider();
  }

  // --- 2. B2C / B2B Toggle Switcher ---
  function updateToggleSlider() {
    const isRTL = currentLang === "ar";
    if (currentType === "b2b") {
      toggleSlider.style.transform = isRTL ? "translateX(0)" : "translateX(100%)";
    } else {
      toggleSlider.style.transform = isRTL ? "translateX(100%)" : "translateX(0)";
    }
  }

  function setFormType(type) {
    if (currentType === type) return;
    currentType = type;

    // Animate toggle slider
    updateToggleSlider();

    if (type === "b2b") {
      toggleB2B.classList.add("active");
      toggleB2C.classList.remove("active");

      // Show B2B fields with animation
      companyFields.classList.remove("hidden");
      budgetField.classList.remove("hidden");

      // Set required validation for B2B fields
      companyNameInput.setAttribute("required", "required");
      industryInput.setAttribute("required", "required");
      budgetInput.setAttribute("required", "required");
    } else {
      toggleB2C.classList.add("active");
      toggleB2B.classList.remove("active");

      // Hide B2B fields with animation
      companyFields.classList.add("hidden");
      budgetField.classList.add("hidden");

      // Clear B2B validation errors & attributes
      removeError(companyNameInput);
      removeError(industryInput);
      removeError(budgetInput);
      companyNameInput.removeAttribute("required");
      industryInput.removeAttribute("required");
      budgetInput.removeAttribute("required");
    }
  }

  // --- 3. Form Validation ---
  function getValidationErrorMessage(input) {
    if (input.validity.valueMissing) {
      return translations[currentLang].errRequired;
    }
    if (input.type === "email" && input.validity.typeMismatch) {
      return translations[currentLang].errEmail;
    }
    // Custom simple phone format checking
    if (input.type === "tel" && input.value.trim() !== "") {
      const phoneRegex = /^[+]?[0-9\s.-]{8,20}$/;
      if (!phoneRegex.test(input.value.trim())) {
        return translations[currentLang].errPhone;
      }
    }
    return "";
  }

  function showError(input, message) {
    const formGroup = input.closest(".form-group");
    formGroup.classList.add("invalid");

    let errorSpan = formGroup.querySelector(".error-message");
    if (!errorSpan) {
      errorSpan = document.createElement("span");
      errorSpan.className = "error-message";
      formGroup.appendChild(errorSpan);
    }
    errorSpan.textContent = message;
  }

  function removeError(input) {
    const formGroup = input.closest(".form-group");
    if (formGroup) {
      formGroup.classList.remove("invalid");
      const errorSpan = formGroup.querySelector(".error-message");
      if (errorSpan) {
        errorSpan.remove();
      }
    }
  }

  function validateField(input) {
    const errorMessage = getValidationErrorMessage(input);
    if (errorMessage) {
      showError(input, errorMessage);
      return false;
    } else {
      removeError(input);
      return true;
    }
  }

  // Attach real-time input validation listeners
  contactForm.querySelectorAll("input, select, textarea").forEach((input) => {
    input.addEventListener("input", () => {
      validateField(input);
    });
    input.addEventListener("blur", () => {
      validateField(input);
    });
  });

  // --- 4. Form Submission ---
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    let isFormValid = true;

    // Validate all active inputs
    contactForm.querySelectorAll("input, select, textarea").forEach((input) => {
      // Skip validation for inputs nested in hidden sections
      if (input.closest(".b2b-field.hidden")) return;

      const isValid = validateField(input);
      if (!isValid) isFormValid = false;
    });

    if (!isFormValid) {
      // Scroll to the first error
      const firstError = contactForm.querySelector(".form-group.invalid");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    // Hide previous submit error
    if (submitError) {
      submitError.classList.add("hidden");
      submitError.textContent = "";
    }

    // Trigger loading state
    submitBtn.disabled = true;
    btnText.classList.add("hidden");
    btnArrow.classList.add("hidden");
    btnLoader.classList.remove("hidden");

    const formData = new FormData(contactForm);
    formData.append("formType", currentType);
    formData.append("timestamp", new Date().toISOString());

    // Submit to Google Sheets web app
    fetch("https://script.google.com/macros/s/AKfycbzy0d3lCaeVl7n1s6sMsLhKusJ-OFD3rhHnsKLWLiJjKzqr-Yq5MORqblmmCMht6bIjqQ/exec", {
      method: "POST",
      body: new URLSearchParams(formData),
      mode: "no-cors"
    })
    .then(() => {
      // Restore button state
      submitBtn.disabled = false;
      btnText.classList.remove("hidden");
      btnArrow.classList.remove("hidden");
      btnLoader.classList.add("hidden");

      // Hide form and show beautiful success state
      contactForm.classList.add("hidden");
      document.querySelector(".form-header").classList.add("hidden");
      document.getElementById("typeToggle").classList.add("hidden");
      successMessage.classList.remove("hidden");
    })
    .catch(error => {
      console.error("Form submission error:", error);
      // Restore button state
      submitBtn.disabled = false;
      btnText.classList.remove("hidden");
      btnArrow.classList.remove("hidden");
      btnLoader.classList.add("hidden");

      // Show submission error
      if (submitError) {
        submitError.textContent = translations[currentLang].errSubmit || "An error occurred. Please try again.";
        submitError.classList.remove("hidden");
      }
    });
  });

  // --- 5. Reset Form ---
  resetBtn.addEventListener("click", () => {
    // Reset form values
    contactForm.reset();

    // Clear all validation states
    contactForm.querySelectorAll(".form-group").forEach((group) => {
      group.classList.remove("invalid");
      const err = group.querySelector(".error-message");
      if (err) err.remove();
    });

    // Clear submit error
    if (submitError) {
      submitError.classList.add("hidden");
      submitError.textContent = "";
    }

    // Show form again
    successMessage.classList.add("hidden");
    contactForm.classList.remove("hidden");
    document.querySelector(".form-header").classList.remove("hidden");
    document.getElementById("typeToggle").classList.remove("hidden");
  });

  // --- Event Listeners ---
  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      if (currentLang !== lang) {
        currentLang = lang;
        localStorage.setItem("preferred_lang", currentLang);
        updateLanguageUI();
      }
    });
  });

  toggleB2C.addEventListener("click", () => setFormType("b2c"));
  toggleB2B.addEventListener("click", () => setFormType("b2b"));

  // --- WhatsApp Popover Delay Widget ---
  const waPopover = document.getElementById("waPopover");
  if (waPopover) {
    setTimeout(() => {
      waPopover.classList.add("visible");
      // Auto hide after 6 seconds
      setTimeout(() => {
        waPopover.classList.remove("visible");
      }, 6000);
    }, 3000);
  }

  // --- Initialize ---
  initLanguage();
});
