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
    
    // --- State Variables ---
    let currentLang = "fr";
    let currentType = "b2c"; // "b2c" or "b2b"

    // --- 1. Bilingual System (i18n) ---
    function initLanguage() {
        // Detect system language
        const savedLang = localStorage.getItem("preferred_lang");
        if (savedLang && (savedLang === "fr" || savedLang === "en" || savedLang === "ar")) {
            currentLang = savedLang;
        } else {
            const browserLang = (navigator.language || navigator.userLanguage).toLowerCase();
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
        langButtons.forEach(btn => {
            if (btn.getAttribute("data-lang") === currentLang) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });


        // Translate standard text content
        document.querySelectorAll("[data-i18n]").forEach(elem => {
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
        document.querySelectorAll("[data-i18n-placeholder]").forEach(elem => {
            const key = elem.getAttribute("data-i18n-placeholder");
            if (translations[currentLang][key]) {
                elem.setAttribute("placeholder", translations[currentLang][key]);
            }
        });

        // Retranslate any active validation error messages
        document.querySelectorAll(".error-message").forEach(errorSpan => {
            const parent = errorSpan.closest(".form-group");
            const input = parent.querySelector("input, select, textarea");
            if (input) {
                errorSpan.textContent = getValidationErrorMessage(input);
            }
        });
    }

    // --- 2. B2C / B2B Toggle Switcher ---
    function setFormType(type) {
        if (currentType === type) return;
        currentType = type;

        // Animate toggle slider
        if (type === "b2b") {
            toggleSlider.style.transform = "translateX(100%)";
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
            toggleSlider.style.transform = "translateX(0)";
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
    contactForm.querySelectorAll("input, select, textarea").forEach(input => {
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
        contactForm.querySelectorAll("input, select, textarea").forEach(input => {
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

        // Trigger loading state
        submitBtn.disabled = true;
        btnText.classList.add("hidden");
        btnArrow.classList.add("hidden");
        btnLoader.classList.remove("hidden");

        // Simulate Google Sheets form receipt/API delay
        setTimeout(() => {
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
            
            // Console log gathered form data (helpful for future Google Sheets script hookup)
            const formData = new FormData(contactForm);
            const dataObject = {
                formType: currentType,
                timestamp: new Date().toISOString()
            };
            formData.forEach((value, key) => {
                dataObject[key] = value;
            });
            console.log("Form successfully submitted (Ready for Google Sheets integration):", dataObject);
            
        }, 1500);
    });

    // --- 5. Reset Form ---
    resetBtn.addEventListener("click", () => {
        // Reset form values
        contactForm.reset();
        
        // Clear all validation states
        contactForm.querySelectorAll(".form-group").forEach(group => {
            group.classList.remove("invalid");
            const err = group.querySelector(".error-message");
            if (err) err.remove();
        });
        
        // Show form again
        successMessage.classList.add("hidden");
        contactForm.classList.remove("hidden");
        document.querySelector(".form-header").classList.remove("hidden");
        document.getElementById("typeToggle").classList.remove("hidden");
    });

    // --- Event Listeners ---
    langButtons.forEach(btn => {
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
