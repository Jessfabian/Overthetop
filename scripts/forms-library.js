"use strict";

document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================
       ELEMENTS
    ========================================== */

  const stateSelector = document.getElementById("stateSelector");
  const formSearch = document.getElementById("formSearch");
  const categoryFilter = document.getElementById("categoryFilter");
  const formsGrid = document.getElementById("formsGrid");
  const formResultCount = document.getElementById("formResultCount");
  const stateNoticePanel = document.getElementById("stateNoticePanel");

  /* ==========================================
       REQUIRED ELEMENT CHECK
    ========================================== */

  const requiredElements = {
    stateSelector,
    formSearch,
    categoryFilter,
    formsGrid,
    formResultCount,
    stateNoticePanel,
  };

  const missingElements = Object.entries(requiredElements)
    .filter(([, element]) => !element)
    .map(([name]) => name);

  if (missingElements.length > 0) {
    console.error(
      "Forms Library could not start. Missing HTML elements:",
      missingElements,
    );

    return;
  }

  /* ==========================================
       DATA CHECK
    ========================================== */

  if (!window.STATE_FORMS || typeof window.STATE_FORMS !== "object") {
    console.error(
      "STATE_FORMS was not found. Make sure forms-library-data.js loads before forms-library.js.",
    );

    formsGrid.innerHTML = `
            <div class="forms-empty-state">
                <div
                    class="empty-state-icon"
                    aria-hidden="true"
                >
                    !
                </div>

                <h3>Forms data could not be loaded</h3>

                <p>
                    Make sure forms-library-data.js is connected
                    before forms-library.js.
                </p>
            </div>
        `;

    formResultCount.textContent = "Data unavailable";

    return;
  }

  /* ==========================================
       CATEGORY LABELS
    ========================================== */

  const categoryLabels = {
    application: "Application",
    designation: "Ownership / Beneficiary",
    medical: "Medical / HIPAA",
    replacement: "Replacement",
    ltc: "Long-Term Care",
    supplement: "Supplement",
    disclosure: "Disclosure",
    other: "Other",
  };

  /* ==========================================
       ESCAPE HTML
    ========================================== */

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

  /* ==========================================
       URL VALIDATION
    ========================================== */

  function getSafeUrl(value) {
    if (typeof value !== "string" || value.trim() === "") {
      return "";
    }

    try {
      const parsedUrl = new URL(value.trim());

      if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
        return "";
      }

      return parsedUrl.href;
    } catch (error) {
      console.warn("Invalid form URL:", value);

      return "";
    }
  }

  /* ==========================================
       NORMALIZE FORM RECORD
    ========================================== */

  function normalizeForm(form = {}) {
    const category =
      typeof form.category === "string" && form.category.trim()
        ? form.category.trim().toLowerCase()
        : "other";

    return {
      number: form.number || form.formNumber || form.id || "Form",

      title:
        form.title ||
        form.name ||
        form.description ||
        "Form description unavailable",

      category,

      categoryLabel: form.categoryLabel || categoryLabels[category] || "Other",

      url: form.url || form.href || form.downloadUrl || form.link || "",

      note: form.note || form.notes || "",
    };
  }

  /* ==========================================
       EMPTY STATE
    ========================================== */

  function showEmptyState({ icon = "▤", title, message }) {
    formsGrid.innerHTML = `
            <div class="forms-empty-state">
                <div
                    class="empty-state-icon"
                    aria-hidden="true"
                >
                    ${escapeHtml(icon)}
                </div>

                <h3>
                    ${escapeHtml(title)}
                </h3>

                <p>
                    ${escapeHtml(message)}
                </p>
            </div>
        `;
  }

  /* ==========================================
       STATE NOTICES
    ========================================== */

  function renderStateNotices(stateData) {
    const notices = Array.isArray(stateData?.notices)
      ? stateData.notices.filter(Boolean)
      : [];

    if (notices.length === 0) {
      stateNoticePanel.hidden = true;
      stateNoticePanel.innerHTML = "";

      return;
    }

    const stateName =
      stateData.name ||
      stateSelector.options[stateSelector.selectedIndex]?.text ||
      "Selected state";

    stateNoticePanel.innerHTML = `
            <h3>
                ${escapeHtml(stateName)} review notes
            </h3>

            <ul class="state-notice-list">
                ${notices
                  .map(
                    (notice) => `
                            <li>
                                ${escapeHtml(notice)}
                            </li>
                        `,
                  )
                  .join("")}
            </ul>
        `;

    stateNoticePanel.hidden = false;
  }

  /* ==========================================
       CREATE OPEN FORM CONTROL
    ========================================== */

function createFormLink(form) {
  const safeUrl = getSafeUrl(form.url);

  if (!safeUrl) {
    return `
            <span class="form-unavailable">
                Link unavailable
            </span>
        `;
  }

  return `
       <a href="${safeUrl}">

            <span>Open Form</span>

            <span aria-hidden="true">
                ↗
            </span>

        </a>
    `;
}
  /* ==========================================
       CREATE FORM CARD
    ========================================== */

  function createFormCard(form) {
    const openFormControl = createFormLink(form);

    const noteMarkup = form.note
      ? `
                <p class="form-note">
                    ${escapeHtml(form.note)}
                </p>
            `
      : "";

    return `
            <article class="form-download-card">
                <div class="form-download-card__content">
                    <div class="form-name-row">
                        <h3 class="form-number">
                            ${escapeHtml(form.number)}
                        </h3>

                        <span class="form-category">
                            ${escapeHtml(form.categoryLabel)}
                        </span>
                    </div>

                    <p class="form-title">
                        ${escapeHtml(form.title)}
                    </p>

                    ${noteMarkup}
                </div>

                <div class="form-download-card__action">
                    ${openFormControl}
                </div>
            </article>
        `;
  }

  /* ==========================================
       FILTER FORMS
    ========================================== */

  function filterForms(forms) {
    const searchValue = formSearch.value.trim().toLowerCase();

    const selectedCategory = categoryFilter.value.toLowerCase();

    return forms.filter((form) => {
      const searchableText = [
        form.number,
        form.title,
        form.category,
        form.categoryLabel,
        form.note,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        searchValue === "" || searchableText.includes(searchValue);

      const matchesCategory =
        selectedCategory === "all" || form.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }

  /* ==========================================
       UPDATE RESULT COUNT
    ========================================== */

  function updateResultCount(count) {
    formResultCount.textContent = count === 1 ? "1 form" : `${count} forms`;
  }

  /* ==========================================
       RENDER FORMS
    ========================================== */

  function renderForms() {
    const stateCode = stateSelector.value.trim().toUpperCase();

    if (!stateCode) {
      stateNoticePanel.hidden = true;
      stateNoticePanel.innerHTML = "";

      formResultCount.textContent = "Select a state";

      showEmptyState({
        icon: "▤",
        title: "Select a contract state",
        message: "State-specific forms and download links will appear here.",
      });

      return;
    }

    const stateData = window.STATE_FORMS[stateCode];

    if (!stateData) {
      stateNoticePanel.hidden = true;
      stateNoticePanel.innerHTML = "";

      formResultCount.textContent = "No state data";

      showEmptyState({
        icon: "!",
        title: "State data has not been added",
        message: `Add ${stateCode} to forms-library-data.js.`,
      });

      return;
    }

    renderStateNotices(stateData);

    const rawForms = Array.isArray(stateData.forms) ? stateData.forms : [];

    const normalizedForms = rawForms.map(normalizeForm);

    const filteredForms = filterForms(normalizedForms);

    updateResultCount(filteredForms.length);

    if (filteredForms.length === 0) {
      const hasForms = normalizedForms.length > 0;

      showEmptyState({
        icon: "⌕",
        title: hasForms ? "No matching forms" : "No forms have been added",
        message: hasForms
          ? "Try another search term or category."
          : `No forms are currently listed for ${stateData.name || stateCode}.`,
      });

      return;
    }

    formsGrid.innerHTML = filteredForms.map(createFormCard).join("");
  }

  /* ==========================================
       EVENT LISTENERS
    ========================================== */

  stateSelector.addEventListener("change", () => {
    formSearch.value = "";
    categoryFilter.value = "all";

    renderForms();
  });

  formSearch.addEventListener("input", renderForms);

  categoryFilter.addEventListener("change", renderForms);

  /* ==========================================
       INITIAL RENDER
    ========================================== */

  renderForms();
});
