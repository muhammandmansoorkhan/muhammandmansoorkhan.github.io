document.addEventListener("DOMContentLoaded", () => {
  const siteHeader = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");
  const navLinks = document.querySelectorAll(".nav-links a");
  const allHashLinks = document.querySelectorAll('a[href^="#"]');
  const revealElements = document.querySelectorAll(".reveal");
  const navSectionIds = Array.from(navLinks)
    .map((link) => link.getAttribute("href"))
    .filter((href) => href && href.startsWith("#"))
    .map((href) => href.replace("#", ""));
  const sectionsForActiveNav = Array.from(new Set(navSectionIds))
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const projectCards = document.querySelectorAll(".project-card");
  const contactForm = document.getElementById("contactForm");
  const formSuccess = document.getElementById("formSuccess");

  const closeMenu = () => {
    if (!siteNav || !navToggle) {
      return;
    }
    siteNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const willOpen = !siteNav.classList.contains("open");
      siteNav.classList.toggle("open", willOpen);
      navToggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
    });

    document.addEventListener("click", (event) => {
      if (!siteNav.classList.contains("open")) {
        return;
      }

      if (!event.target.closest(".header-inner")) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 900) {
        closeMenu();
      }
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  allHashLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") {
        return;
      }

      const targetElement = document.querySelector(targetId);
      if (!targetElement) {
        return;
      }

      event.preventDefault();
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));

  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", isActive);
    });
  };

  const activeLinkObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: "-40% 0px -48% 0px"
    }
  );

  sectionsForActiveNav.forEach((section) => activeLinkObserver.observe(section));

  projectCards.forEach((card) => {
    const toggleButton = card.querySelector(".project-toggle");
    const details = card.querySelector(".project-details");

    if (!toggleButton || !details) {
      return;
    }

    toggleButton.addEventListener("click", () => {
      const isOpen = card.classList.contains("open");

      projectCards.forEach((otherCard) => {
        const otherButton = otherCard.querySelector(".project-toggle");
        const otherDetails = otherCard.querySelector(".project-details");
        otherCard.classList.remove("open");
        if (otherButton) {
          otherButton.setAttribute("aria-expanded", "false");
          otherButton.textContent = "View System Details";
        }
        if (otherDetails) {
          otherDetails.setAttribute("aria-hidden", "true");
        }
      });

      if (!isOpen) {
        card.classList.add("open");
        toggleButton.setAttribute("aria-expanded", "true");
        toggleButton.textContent = "Hide System Details";
        details.setAttribute("aria-hidden", "false");
      }
    });
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

  const setFieldError = (field, message) => {
    const fieldWrapper = field.closest(".field");
    if (!fieldWrapper) {
      return;
    }

    const errorText = fieldWrapper.querySelector(".error-msg");
    fieldWrapper.classList.toggle("invalid", Boolean(message));

    if (errorText) {
      errorText.textContent = message || "";
    }
  };

  const validateWebsiteUrl = (value) => {
    if (!value.trim()) {
      return true;
    }
    const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    try {
      // eslint-disable-next-line no-new
      new URL(normalized);
      return true;
    } catch (error) {
      return false;
    }
  };

  if (contactForm) {
    const fields = contactForm.querySelectorAll("input, select, textarea");

    fields.forEach((field) => {
      field.addEventListener("input", () => setFieldError(field, ""));
      field.addEventListener("change", () => setFieldError(field, ""));
    });

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      let isValid = true;

      const requiredFields = contactForm.querySelectorAll("[required]");
      requiredFields.forEach((field) => {
        const value = field.value.trim();
        if (!value) {
          isValid = false;
          setFieldError(field, "This field is required.");
        } else {
          setFieldError(field, "");
        }
      });

      const emailField = contactForm.elements.email;
      if (emailField && emailField.value.trim() && !emailRegex.test(emailField.value.trim())) {
        isValid = false;
        setFieldError(emailField, "Please enter a valid email format.");
      }

      const websiteField = contactForm.elements.website;
      if (websiteField && websiteField.value.trim() && !validateWebsiteUrl(websiteField.value.trim())) {
        isValid = false;
        setFieldError(websiteField, "Please enter a valid website URL.");
      }

      if (!isValid) {
        if (formSuccess) {
          formSuccess.hidden = true;
        }
        return;
      }

      contactForm.reset();

      if (formSuccess) {
        formSuccess.textContent =
          "Thanks. Your request has been received. I’ll review your business system and respond with next steps.";
        formSuccess.hidden = false;
      }
    });
  }

  const updateHeaderShadow = () => {
    if (!siteHeader) {
      return;
    }
    siteHeader.classList.toggle("scrolled", window.scrollY > 8);
  };

  updateHeaderShadow();
  window.addEventListener("scroll", updateHeaderShadow, { passive: true });
});
