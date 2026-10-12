"use strict";

// Single source of truth for every package and displayed rate.
const KAIZEN_PACKAGE_CONFIG = [
  {
    id: "solo-standard",
    label: "Solo Standard",
    kicker: "FOUNDATION TRACK",
    title: "Solo Standard",
    priceMode: "solo",
    groups: [
      {
        id: "standard",
        packages: [
          { sessions: 12, headline: "2,500 SAR", priceLabel: "Total investment", secondary: "208 SAR / session", validity: 45 },
          { sessions: 16, headline: "3,280 SAR", priceLabel: "Total investment", secondary: "205 SAR / session", validity: 45 },
          { sessions: 20, headline: "4,000 SAR", priceLabel: "Total investment", secondary: "200 SAR / session", validity: 60 },
          { sessions: 24, headline: "4,730 SAR", priceLabel: "Total investment", secondary: "197 SAR / session", validity: 60 },
          { sessions: 32, headline: "6,240 SAR", priceLabel: "Total investment", secondary: "195 SAR / session", validity: 75 },
          { sessions: 36, headline: "6,900 SAR", priceLabel: "Total investment", secondary: "192 SAR / session", validity: 90 },
          { sessions: 48, headline: "9,120 SAR", priceLabel: "Total investment", secondary: "190 SAR / session", validity: 120, saving: "Save 880 SAR" },
        ],
      },
    ],
  },
  {
    id: "solo-gold",
    label: "Solo Gold (VIP)",
    kicker: "VIP TRANSFORMATION SUITE",
    title: "Solo Gold",
    note: "Senior Consultant led with priority access and advanced performance architecture.",
    priceMode: "solo",
    tone: "gold",
    groups: [
      {
        id: "gold",
        tone: "gold",
        packages: [
          { sessions: 12, headline: "3,500 SAR", priceLabel: "Total investment", secondary: "292 SAR / session", validity: 45 },
          { sessions: 16, headline: "4,550 SAR", priceLabel: "Total investment", secondary: "284 SAR / session", validity: 45 },
          { sessions: 20, headline: "5,520 SAR", priceLabel: "Total investment", secondary: "276 SAR / session", validity: 60 },
          { sessions: 24, headline: "6,480 SAR", priceLabel: "Total investment", secondary: "270 SAR / session", validity: 60 },
          { sessions: 32, headline: "8,540 SAR", priceLabel: "Total investment", secondary: "267 SAR / session", validity: 75 },
          { sessions: 36, headline: "9,540 SAR", priceLabel: "Total investment", secondary: "265 SAR / session", validity: 90 },
          { sessions: 48, headline: "12,480 SAR", priceLabel: "Total investment", secondary: "260 SAR / session", validity: 120, saving: "Save 1,520 SAR" },
        ],
      },
    ],
  },
  {
    id: "duo",
    label: "Duo (2:1)",
    kicker: "PARTNER TRAINING",
    title: "Duo Performance Architecture",
    note: "All headline figures are the total package investment for two people. The per-person investment is shown beneath.",
    priceMode: "duo",
    groups: [
      {
        id: "standard-duo",
        label: "Standard Duo",
        packages: [
          { sessions: 12, headline: "3,750 SAR total", priceLabel: "Total for two people", secondary: "1,875 SAR / person", validity: 45 },
          { sessions: 16, headline: "4,920 SAR total", priceLabel: "Total for two people", secondary: "2,460 SAR / person", validity: 45 },
          { sessions: 24, headline: "7,095 SAR total", priceLabel: "Total for two people", secondary: "3,548 SAR / person", validity: 60 },
          { sessions: 32, headline: "9,360 SAR total", priceLabel: "Total for two people", secondary: "4,680 SAR / person", validity: 75 },
          { sessions: 48, headline: "13,680 SAR total", priceLabel: "Total for two people", secondary: "6,840 SAR / person", validity: 120 },
        ],
      },
      {
        id: "gold-duo",
        label: "Gold Duo",
        tone: "gold",
        packages: [
          { sessions: 12, headline: "5,250 SAR total", priceLabel: "Total for two people", secondary: "2,625 SAR / person", validity: 45 },
          { sessions: 16, headline: "6,825 SAR total", priceLabel: "Total for two people", secondary: "3,413 SAR / person", validity: 45 },
          { sessions: 24, headline: "9,720 SAR total", priceLabel: "Total for two people", secondary: "4,860 SAR / person", validity: 60 },
          { sessions: 32, headline: "12,800 SAR total", priceLabel: "Total for two people", secondary: "6,400 SAR / person", validity: 75 },
          { sessions: 48, headline: "18,720 SAR total", priceLabel: "Total for two people", secondary: "9,360 SAR / person", validity: 120 },
        ],
      },
    ],
  },
  {
    id: "semi-private",
    label: "Semi-Private",
    kicker: "4 CLIENTS MAXIMUM",
    title: "Semi-Private Performance Track",
    note: "Every listed investment is per person, with close coaching oversight retained throughout.",
    footnote: "32 and 48 session tiers are offline customised packages requiring in-person client sign-off and trainer approval to ensure long-term group synchronisation.",
    priceMode: "semi-private",
    groups: [
      {
        id: "semi-private",
        packages: [
          { sessions: 12, headline: "1,150 SAR / person", priceLabel: "Per-person investment", secondary: "~96 SAR / session", validity: 45 },
          { sessions: 16, headline: "1,450 SAR / person", priceLabel: "Per-person investment", secondary: "~90 SAR / session", validity: 45 },
          { sessions: 24, headline: "2,050 SAR / person", priceLabel: "Per-person investment", secondary: "~85 SAR / session", validity: 60 },
        ],
      },
    ],
  },
];

window.addEventListener("DOMContentLoaded", () => {
  // Split text into word and character spans.
  new SplitType("[text-split]", {
    types: "words, chars",
    tagName: "span",
  });

  function createScrollTrigger(triggerElement, timeline) {
    // Reset the timeline after scrolling back below the element.
    ScrollTrigger.create({
      trigger: triggerElement,
      start: "top bottom",
      onLeaveBack: () => {
        timeline.progress(0);
        timeline.pause();
      },
    });

    // Play the timeline when the element reaches 60% of the viewport.
    ScrollTrigger.create({
      trigger: triggerElement,
      start: "top 60%",
      onEnter: () => timeline.play(),
    });
  }

  $("[letters-fade-in-random]").each(function animateLetters() {
    const timeline = gsap.timeline({ paused: true });

    timeline.from($(this).find(".char"), {
      opacity: 0,
      duration: 0.05,
      ease: "power1.out",
      stagger: {
        amount: 0.4,
        from: "random",
      },
    });

    createScrollTrigger($(this), timeline);
  });

  // Avoid a flash of unstyled content.
  gsap.set("[text-split]", { opacity: 1 });
});

new Swiper(".swiper", {
  direction: "horizontal",
  grabCursor: true,
  keyboard: {
    enabled: true,
    onlyInViewport: false,
  },
  slidesPerView: 3,
  spaceBetween: 0,
  breakpoints: {
    320: {
      slidesPerView: 1.125,
      spaceBetween: 0,
    },
    480: {
      slidesPerView: 1.5,
      spaceBetween: 0,
    },
    640: {
      slidesPerView: 2.25,
      spaceBetween: 0,
    },
    1024: {
      slidesPerView: 4,
      spaceBetween: 0,
    },
  },
  navigation: {
    nextEl: ".case-slider_arrow.is-right",
    prevEl: ".case-slider_arrow.is-left",
  },
});

// Play background video after the first user interaction on low-power devices.
$("video").addClass("inlinevideo");
$("body").on("click touchstart", () => {
  $(".inlinevideo").trigger("play");
});

// Data-driven packages, accessible tabs, mobile scroll-snap, and checkout.
window.addEventListener("DOMContentLoaded", () => {
  const tablist = document.querySelector("#package-tablist");
  const panelsRoot = document.querySelector("#package-panels");
  const checkoutModal = document.querySelector("#package-checkout-modal");

  if (!tablist || !panelsRoot || !checkoutModal) return;

  const packageLookup = new Map();
  let selectedPackage = null;
  let lastCheckoutTrigger = null;

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const renderCard = (track, group, packageItem) => {
    const key = `${track.id}:${group.id}:${packageItem.sessions}`;
    const trackLabel = group.label ? `${track.label} — ${group.label}` : track.label;
    packageLookup.set(key, { trackLabel, packageItem });

    return `
      <article class="package-card${group.tone === "gold" || track.tone === "gold" ? " package-card--gold" : ""}">
        <div class="package-card__topline">
          <p class="package-card__track">${escapeHtml(trackLabel)}</p>
          ${packageItem.saving ? `<span class="package-card__saving">${escapeHtml(packageItem.saving)}</span>` : ""}
        </div>
        <p class="package-card__sessions">${packageItem.sessions}<span>Sessions</span></p>
        <p class="package-card__price">${escapeHtml(packageItem.headline)}</p>
        <p class="package-card__price-label">${escapeHtml(packageItem.priceLabel)}</p>
        <p class="package-card__secondary-price">${escapeHtml(packageItem.secondary)}</p>
        <p class="package-card__validity">Valid for ${packageItem.validity} days from Session #1</p>
        <div class="package-card__actions">
          <button class="package-card__primary" type="button" data-package-select="${escapeHtml(key)}">Select &amp; Pay</button>
          <button class="package-card__secondary" type="button" data-assessment-open>Or Book Free Assessment First</button>
        </div>
      </article>`;
  };

  const renderGroup = (track, group, groupIndex) => {
    const scrollerId = `package-scroller-${track.id}-${groupIndex}`;
    const cards = group.packages.map((packageItem) => renderCard(track, group, packageItem)).join("");
    const dots = group.packages
      .map(
        (packageItem, index) =>
          `<button class="package-progress__dot" type="button" aria-label="Show ${packageItem.sessions} session package" aria-current="${index === 0 ? "true" : "false"}" data-slide-index="${index}"></button>`,
      )
      .join("");
    const content = `
      ${group.label ? `<h4 class="package-group__title" id="${scrollerId}-title">${escapeHtml(group.label)}</h4>` : ""}
      <div class="package-scroller" id="${scrollerId}"${group.label ? ` aria-labelledby="${scrollerId}-title"` : ""}>${cards}</div>
      <div class="package-progress" aria-label="Package carousel position">${dots}</div>`;

    return group.label
      ? `<section class="package-group" aria-labelledby="${scrollerId}-title">${content}</section>`
      : `<div class="package-group">${content}</div>`;
  };

  KAIZEN_PACKAGE_CONFIG.forEach((track, trackIndex) => {
    const tabId = `package-tab-${track.id}`;
    const panelId = `package-panel-${track.id}`;
    const tab = document.createElement("button");
    tab.className = "packages-tabs__tab";
    tab.type = "button";
    tab.id = tabId;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", panelId);
    tab.setAttribute("aria-selected", trackIndex === 0 ? "true" : "false");
    tab.tabIndex = trackIndex === 0 ? 0 : -1;
    tab.dataset.tabIndex = String(trackIndex);
    tab.textContent = track.label;
    tablist.append(tab);

    const panel = document.createElement("section");
    panel.className = "package-panel";
    panel.id = panelId;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tabId);
    panel.tabIndex = 0;
    panel.hidden = trackIndex !== 0;
    panel.innerHTML = `
      <header class="package-panel__header">
        <p class="package-panel__kicker">${escapeHtml(track.kicker)}</p>
        <h3 class="package-panel__title">${escapeHtml(track.title)}</h3>
        ${track.note ? `<p class="package-panel__note">${escapeHtml(track.note)}</p>` : ""}
      </header>
      ${track.groups.map((group, groupIndex) => renderGroup(track, group, groupIndex)).join("")}
      ${track.footnote ? `<p class="package-panel__footnote">${escapeHtml(track.footnote)}</p>` : ""}`;
    panelsRoot.append(panel);
  });

  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const panels = [...panelsRoot.querySelectorAll('[role="tabpanel"]')];

  const updateProgress = (scroller) => {
    const cards = [...scroller.querySelectorAll(".package-card")];
    const progress = scroller.nextElementSibling;
    const dots = progress ? [...progress.querySelectorAll(".package-progress__dot")] : [];
    if (!cards.length || !dots.length || !scroller.offsetParent) return;

    const scrollerRect = scroller.getBoundingClientRect();
    const isRtl = getComputedStyle(scroller).direction === "rtl";
    const inlineStart = isRtl ? scrollerRect.right : scrollerRect.left;
    let activeIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const cardStart = isRtl ? cardRect.right : cardRect.left;
      const distance = Math.abs(cardStart - inlineStart);
      if (distance < closestDistance) {
        closestDistance = distance;
        activeIndex = index;
      }
    });

    dots.forEach((dot, index) => dot.setAttribute("aria-current", index === activeIndex ? "true" : "false"));
  };

  panelsRoot.querySelectorAll(".package-scroller").forEach((scroller) => {
    let animationFrame = null;
    scroller.addEventListener(
      "scroll",
      () => {
        if (animationFrame) window.cancelAnimationFrame(animationFrame);
        animationFrame = window.requestAnimationFrame(() => updateProgress(scroller));
      },
      { passive: true },
    );

    const progress = scroller.nextElementSibling;
    progress?.querySelectorAll(".package-progress__dot").forEach((dot) => {
      dot.addEventListener("click", () => {
        const card = scroller.querySelectorAll(".package-card")[Number(dot.dataset.slideIndex)];
        card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
      });
    });
  });

  const activateTab = (nextIndex, moveFocus = false) => {
    tabs.forEach((tab, index) => {
      const isActive = index === nextIndex;
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
      tab.tabIndex = isActive ? 0 : -1;
      panels[index].hidden = !isActive;
    });

    if (moveFocus) tabs[nextIndex].focus();
    window.requestAnimationFrame(() => {
      panels[nextIndex].querySelectorAll(".package-scroller").forEach(updateProgress);
    });
  };

  tablist.addEventListener("click", (event) => {
    const tab = event.target.closest('[role="tab"]');
    if (tab) activateTab(Number(tab.dataset.tabIndex));
  });

  tablist.addEventListener("keydown", (event) => {
    const currentTab = event.target.closest('[role="tab"]');
    if (!currentTab) return;
    const currentIndex = Number(currentTab.dataset.tabIndex);
    const isRtl = getComputedStyle(tablist).direction === "rtl";
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight") nextIndex = currentIndex + (isRtl ? -1 : 1);
    if (event.key === "ArrowLeft") nextIndex = currentIndex + (isRtl ? 1 : -1);
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex === currentIndex && !["Home", "End"].includes(event.key)) return;

    event.preventDefault();
    activateTab((nextIndex + tabs.length) % tabs.length, true);
  });

  const checkoutClose = checkoutModal.querySelector("[data-checkout-close]");
  const checkoutForm = checkoutModal.querySelector("#package-checkout-form");
  const checkoutName = checkoutModal.querySelector("#checkout-name");
  const checkoutStatus = checkoutModal.querySelector("[data-checkout-status]");
  const checkoutTrack = checkoutModal.querySelector("[data-checkout-track]");
  const checkoutPackage = checkoutModal.querySelector("[data-checkout-package]");
  const checkoutPrice = checkoutModal.querySelector("[data-checkout-price]");
  const checkoutValidity = checkoutModal.querySelector("[data-checkout-validity]");

  const closeCheckout = () => {
    if (typeof checkoutModal.close === "function") checkoutModal.close();
    else checkoutModal.removeAttribute("open");
    document.body.classList.remove("is-package-checkout-open");
    lastCheckoutTrigger?.focus();
  };

  panelsRoot.addEventListener("click", (event) => {
    const selectButton = event.target.closest("[data-package-select]");
    if (!selectButton) return;
    selectedPackage = packageLookup.get(selectButton.dataset.packageSelect);
    if (!selectedPackage) return;

    lastCheckoutTrigger = selectButton;
    const { trackLabel, packageItem } = selectedPackage;
    checkoutTrack.textContent = trackLabel;
    checkoutPackage.textContent = `${packageItem.sessions} Sessions`;
    checkoutPrice.textContent = `${packageItem.headline} · ${packageItem.secondary}`;
    checkoutValidity.textContent = `Valid for ${packageItem.validity} days from Session #1`;
    checkoutStatus.textContent = "";

    if (typeof checkoutModal.showModal === "function") checkoutModal.showModal();
    else checkoutModal.setAttribute("open", "");
    document.body.classList.add("is-package-checkout-open");
    window.requestAnimationFrame(() => checkoutName?.focus());
  });

  checkoutClose?.addEventListener("click", closeCheckout);
  checkoutModal.addEventListener("click", (event) => {
    if (event.target === checkoutModal) closeCheckout();
  });
  checkoutModal.addEventListener("cancel", () => {
    document.body.classList.remove("is-package-checkout-open");
    lastCheckoutTrigger?.focus();
  });

  checkoutForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!selectedPackage) return;

    const formData = new FormData(checkoutForm);
    const { trackLabel, packageItem } = selectedPackage;
    const message = [
      "Hello Kaizen Fitness, I would like to proceed with a package and receive the secure payment arrangement.",
      `Package: ${trackLabel}`,
      `Sessions: ${packageItem.sessions}`,
      `Investment: ${packageItem.headline}`,
      `Validity: ${packageItem.validity} days from Session #1`,
      `Name: ${formData.get("name")}`,
      `Mobile: ${formData.get("phone")}`,
      `Email: ${formData.get("email")}`,
    ].join("\n");

    window.open(`https://wa.me/966531322818?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    checkoutStatus.textContent = "WhatsApp opened with your selected package details.";
  });

  activateTab(0);
});

// Primary assessment lead funnel.
window.addEventListener("DOMContentLoaded", () => {
  const modal = document.querySelector("#assessment-modal");
  const form = modal?.querySelector("#assessment-form");
  if (!modal || !form) return;

  const closeButton = modal.querySelector("[data-assessment-close]");
  const formView = modal.querySelector("[data-assessment-form-view]");
  const successView = modal.querySelector("[data-assessment-success]");
  const successTitle = modal.querySelector("#assessment-success-title");
  const successWhatsApp = modal.querySelector("[data-assessment-success-whatsapp]");
  const nameInput = form.querySelector("#assessment-name");
  const phoneInput = form.querySelector("#assessment-phone");
  const focusSelect = form.querySelector("#assessment-focus");
  const windowSelect = form.querySelector("#assessment-window");
  const readinessRadios = [...form.querySelectorAll('input[name="healthReadiness"]')];
  const healthReveal = form.querySelector("[data-health-details]");
  const healthDetails = form.querySelector("#assessment-health-details");
  const submitButton = form.querySelector('.assessment-form__submit');
  const submitLabel = submitButton.querySelector("[data-submit-label]");
  const status = form.querySelector("#assessment-form-status");
  const fallback = form.querySelector("[data-assessment-fallback]");
  const fallbackLink = fallback.querySelector("a");
  let lastTrigger = null;
  let isSubmitting = false;
  let submissionSucceeded = false;
  let pendingRequest = null;

  const normaliseSaudiMobile = () => {
    let digits = phoneInput.value.replace(/\D/g, "");
    if (digits.startsWith("966")) digits = digits.slice(3);
    if (digits.startsWith("0")) digits = digits.slice(1);
    phoneInput.value = digits;
    return digits;
  };

  const setError = (fieldName, input, errorId, message) => {
    const field = form.querySelector(`[data-assessment-field="${fieldName}"]`);
    const error = form.querySelector(`#${errorId}`);
    field?.classList.toggle("is-invalid", Boolean(message));
    input?.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) error.textContent = message;
    return !message;
  };

  const validateName = () =>
    setError(
      "name",
      nameInput,
      "assessment-name-error",
      nameInput.value.trim() ? "" : "Please enter your full name.",
    );

  const validatePhone = () => {
    const digits = normaliseSaudiMobile();
    return setError(
      "phone",
      phoneInput,
      "assessment-phone-error",
      /^5\d{8}$/.test(digits) ? "" : "Enter a valid Saudi mobile number, for example 53 132 2818.",
    );
  };

  const validateFocus = () =>
    setError(
      "focus",
      focusSelect,
      "assessment-focus-error",
      focusSelect.value ? "" : "Please select your primary focus.",
    );

  const validateWindow = () =>
    setError(
      "window",
      windowSelect,
      "assessment-window-error",
      windowSelect.value ? "" : "Please select your preferred training window.",
    );

  const getReadiness = () => readinessRadios.find((radio) => radio.checked)?.value || "";

  const validateReadiness = () => {
    const readiness = getReadiness();
    const isValid = setError(
      "readiness",
      readinessRadios[0],
      "assessment-readiness-error",
      readiness ? "" : "Please confirm your health and physical readiness.",
    );
    readinessRadios.forEach((radio) => radio.setAttribute("aria-invalid", isValid ? "false" : "true"));
    return isValid;
  };

  const validateHealthDetails = () => {
    const error = form.querySelector("#assessment-health-details-error");
    const message = getReadiness() === "Yes" && !healthDetails.value.trim()
      ? "Please briefly describe the relevant condition."
      : "";
    healthDetails.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) error.textContent = message;
    return !message;
  };

  const syncHealthDetails = () => {
    const shouldShow = getReadiness() === "Yes";
    healthReveal.classList.toggle("is-visible", shouldShow);
    healthReveal.setAttribute("aria-hidden", shouldShow ? "false" : "true");
    healthDetails.disabled = !shouldShow;
    healthDetails.required = shouldShow;

    if (!shouldShow) {
      healthDetails.value = "";
      healthDetails.setAttribute("aria-invalid", "false");
      const healthError = form.querySelector("#assessment-health-details-error");
      if (healthError) healthError.textContent = "";
    }
  };

  const buildLeadPayload = () => ({
    source: "Kaizen Fitness Website",
    submittedAt: new Date().toISOString(),
    fullName: nameInput.value.trim(),
    whatsappMobile: `+966${normaliseSaudiMobile()}`,
    primaryFocus: focusSelect.value,
    preferredTrainingWindow: windowSelect.value,
    healthReadiness: getReadiness(),
    healthDetails: getReadiness() === "Yes" ? healthDetails.value.trim() : "None",
  });

  const buildWhatsAppUrl = (payload, confirmation = false) => {
    const lines = confirmation
      ? [
          "Hello Kaizen Fitness, my private performance assessment request has been received.",
          `Name: ${payload.fullName}`,
          `WhatsApp: ${payload.whatsappMobile}`,
        ]
      : [
          "Hello Kaizen Fitness, I would like to book a private performance assessment and movement audit.",
          `Name: ${payload.fullName}`,
          `WhatsApp: ${payload.whatsappMobile}`,
          `Primary focus: ${payload.primaryFocus}`,
          `Preferred training window: ${payload.preferredTrainingWindow}`,
          `Health readiness: ${payload.healthReadiness}`,
          `Health details: ${payload.healthDetails}`,
        ];
    return `https://wa.me/966531322818?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  const resetAfterSuccess = () => {
    form.reset();
    healthDetails.value = "";
    syncHealthDetails();
    form.querySelectorAll(".is-invalid").forEach((field) => field.classList.remove("is-invalid"));
    form.querySelectorAll('[aria-invalid="true"]').forEach((field) => field.setAttribute("aria-invalid", "false"));
    form.querySelectorAll(".assessment-form__error").forEach((error) => {
      error.textContent = "";
    });
    status.textContent = "";
    fallback.hidden = true;
    formView.hidden = false;
    successView.hidden = true;
    submissionSucceeded = false;
    pendingRequest = null;
  };

  const openModal = (trigger) => {
    lastTrigger = trigger;
    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
    document.body.classList.add("is-assessment-modal-open");
    window.requestAnimationFrame(() => nameInput.focus());
  };

  const closeModal = () => {
    if (typeof modal.close === "function") modal.close();
    else modal.removeAttribute("open");
    document.body.classList.remove("is-assessment-modal-open");
    if (submissionSucceeded) resetAfterSuccess();
    lastTrigger?.focus();
  };

  nameInput.addEventListener("blur", validateName);
  phoneInput.addEventListener("blur", validatePhone);
  focusSelect.addEventListener("blur", validateFocus);
  windowSelect.addEventListener("blur", validateWindow);
  healthDetails.addEventListener("blur", validateHealthDetails);
  readinessRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      syncHealthDetails();
      validateReadiness();
    });
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest?.("[data-assessment-open]");
    if (!trigger) return;
    event.preventDefault();
    openModal(trigger);
  });

  closeButton.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  modal.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeModal();
  });

  modal.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const focusable = [...modal.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled])')].filter(
      (element) => !element.closest("[hidden]") && element.offsetParent !== null,
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const validationResults = [
      validateName(),
      validatePhone(),
      validateFocus(),
      validateWindow(),
      validateReadiness(),
      validateHealthDetails(),
    ];
    if (validationResults.includes(false)) {
      status.textContent = "Please review the highlighted fields before submitting.";
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    const payload = buildLeadPayload();
    const fingerprint = JSON.stringify({ ...payload, submittedAt: undefined });
    if (!pendingRequest || pendingRequest.fingerprint !== fingerprint) {
      pendingRequest = { fingerprint, id: crypto.randomUUID(), submittedAt: payload.submittedAt };
    }
    payload.requestId = pendingRequest.id;
    payload.submittedAt = pendingRequest.submittedAt;
    const webhookUrl = form.dataset.webhookUrl.trim();
    fallback.hidden = true;
    status.textContent = "";
    isSubmitting = true;
    submitButton.disabled = true;
    submitButton.classList.add("is-loading");
    submitButton.setAttribute("aria-busy", "true");
    submitLabel.textContent = "Sending securely…";
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 25000);

    try {
      if (!webhookUrl) throw new Error('Assessment webhook is not configured.');
      const response = await fetch(webhookUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Assessment webhook returned ${response.status}.`);
      const result = await response.json();
      if (result.ok !== true || result.requestId !== payload.requestId) {
        throw new Error("The server did not confirm that the request was saved.");
      }

      submissionSucceeded = true;
      formView.hidden = true;
      successView.hidden = false;
      successWhatsApp.href = buildWhatsAppUrl(payload, true);
      window.requestAnimationFrame(() => successTitle.focus());
    } catch (error) {
      console.error("Assessment submission failed:", error);
      status.textContent = "We could not send your request securely. Your information has not been cleared.";
      fallbackLink.href = buildWhatsAppUrl(payload);
      fallback.hidden = false;
    } finally {
      window.clearTimeout(timeout);
      isSubmitting = false;
      submitButton.disabled = false;
      submitButton.classList.remove("is-loading");
      submitButton.removeAttribute("aria-busy");
      submitLabel.textContent = "Book Free Assessment";
    }
  });

  syncHealthDetails();
});
