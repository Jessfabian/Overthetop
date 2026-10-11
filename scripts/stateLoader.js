(() => {
  "use strict";

  window.formReviewStatus = window.formReviewStatus || {};
  window.activeNigoRow = null;

  const $ = (id) => document.getElementById(id);

  /*
   * =========================================================
   * GENERAL HELPERS
   * =========================================================
   */

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalizeFormValues(value) {
    if (value === null || value === undefined || value === "") {
      return [];
    }

    return Array.isArray(value) ? value : [value];
  }

  function getRequirementBuilder() {
    return $("nigoRequirementBuilder");
  }

  function getRequirementBuilderParking() {
    return $("requirementBuilderParking");
  }

  function getActiveNigoInformation() {
    const row = window.activeNigoRow;

    if (!row || !document.body.contains(row)) {
      return null;
    }

    const formId = row.dataset.formId || "";
    const formDescription = row.dataset.formDescription || formId;

    return {
      row,
      formId,
      formDescription,
    };
  }

  /*
   * =========================================================
   * STATE NOTICE RENDERING
   * =========================================================
   */

  function renderNotices(stateData) {
    const container = $("stateImportantNotices");

    if (!container) {
      return;
    }

    const notices = Array.isArray(stateData.important)
      ? stateData.important
      : [];

    if (!notices.length) {
      container.innerHTML = "";
      container.hidden = true;
      return;
    }

    container.hidden = false;

    container.innerHTML = `
      <div class="state-notice state-notice-important">
        <h3>Important</h3>

        <ul>
          ${notices
            .map((notice) => {
              return `<li>${escapeHTML(notice)}</li>`;
            })
            .join("")}
        </ul>
      </div>
    `;
  }

  function renderNotes(stateData) {
    const container = $("stateNotes");

    if (!container) {
      return;
    }

    const notes = Array.isArray(stateData.notes) ? stateData.notes : [];

    if (!notes.length) {
      container.innerHTML = "";
      container.hidden = true;
      return;
    }

    container.hidden = false;

    container.innerHTML = `
      <div class="state-notice">
        <h3>State Notes</h3>

        <ul>
          ${notes
            .map((note) => {
              return `<li>${escapeHTML(note)}</li>`;
            })
            .join("")}
        </ul>
      </div>
    `;
  }

  /*
   * =========================================================
   * CONDITIONAL FORM EVALUATION
   * =========================================================
   */

  function evaluateConditions(conditions) {
    if (!Array.isArray(conditions) || conditions.length === 0) {
      return true;
    }

    return conditions.every((condition) => {
      const field = condition.field;
      const value = condition.value;
      const operator = condition.operator;

      let current;

      switch (field) {
        case "replacement":
          current = $("replacement")?.checked ? "yes" : "no";
          break;

        case "additionalInsured":
          current = $("additionalInsured")?.checked ? "yes" : "no";
          break;

        case "beneficiaryOther":
          current = $("beneficiaryOther")?.value || "";
          break;

        case "ownerType":
          current = $("ownerType")?.value || "";
          break;

        default:
          /*
           * This standalone page may not contain every Initial
           * Review condition field. An unknown condition should
           * not display the conditional form.
           */
          return false;
      }

      if (operator === "equals") {
        return current === value;
      }

      if (operator === "notEquals") {
        return current !== value;
      }

      if (operator === "includes") {
        return normalizeFormValues(value).includes(current);
      }

      return false;
    });
  }

  /*
   * =========================================================
   * REQUIREMENT GENERATOR STATE
   * =========================================================
   */

  function getRequirementFieldValues() {
    const values = {};

    document
      .querySelectorAll("#globalRequirementFields [data-requirement-field]")
      .forEach((field) => {
        values[field.dataset.requirementField] = field.value || "";
      });

    return values;
  }

  function clearGlobalRequirementDraft() {
    const dropdown = $("globalRequirementTemplate");
    const fields = $("globalRequirementFields");
    const output = $("globalGeneratedRequirement");
    const status = $("requirementSaveStatus");

    if (dropdown) {
      dropdown.value = "";

      dropdown.dispatchEvent(
        new Event("change", {
          bubbles: true,
        }),
      );
    }

    if (fields) {
      fields.innerHTML = "";
    }

    if (output) {
      output.value = "";
      output.placeholder = "Select a requirement template.";
    }

    if (status) {
      status.textContent = "";
    }
  }

  function populateActiveRequirementFormField() {
    const active = getActiveNigoInformation();

    if (!active) {
      return;
    }

    const fields = $("globalRequirementFields");

    if (!fields) {
      return;
    }

    const formField = fields.querySelector(
      '[data-requirement-field="formName"],' +
        '[data-requirement-field="documentName"],' +
        '[data-requirement-field="supplementName"],' +
        '[data-requirement-field="item"]',
    );

    if (!formField || formField.value.trim()) {
      return;
    }

    formField.value = active.formDescription;

    formField.dispatchEvent(
      new Event("input", {
        bubbles: true,
      }),
    );

    formField.dispatchEvent(
      new Event("change", {
        bubbles: true,
      }),
    );
  }

  function syncActiveNigoRequirement() {
    const active = getActiveNigoInformation();

    if (!active) {
      return;
    }

    const dropdown = $("globalRequirementTemplate");
    const output = $("globalGeneratedRequirement");

    const templateId = dropdown?.value || "";

    const selectedOption = dropdown?.options[dropdown.selectedIndex];

    const issueLabel = selectedOption?.textContent?.trim() || "";

    const requirementText = output?.value?.trim() || "";

    const resultText = active.row.querySelector(".form-review-result");

    window.formReviewStatus[active.formId] = {
      status: templateId ? "NIGO" : "NIGO_PENDING",
      issueLabel,
      templateId,
      formId: active.formId,
      formDescription: active.formDescription,
      requirementGenerated: Boolean(requirementText),
      requirementText,
      fieldValues: getRequirementFieldValues(),
    };

    active.row.dataset.formStatus = templateId ? "nigo" : "nigo-pending";

    if (resultText) {
      if (templateId) {
        resultText.textContent = `NIGO: ${issueLabel}`;
        resultText.className = "form-review-result result-nigo";
        resultText.title = issueLabel;
      } else {
        resultText.textContent = "Select Requirement";
        resultText.className = "form-review-result result-nigo-pending";
        resultText.title = "";
      }
    }

    updateStateDashboard();
    checkReviewCompletion();

    document.dispatchEvent(new CustomEvent("stateFormsUpdated"));
  }

  function refreshActiveNigoRequirement() {
    /*
     * amendment-engine.js handles the change first and creates
     * the dynamic fields. The timeout lets that finish.
     */
    window.setTimeout(() => {
      populateActiveRequirementFormField();

      window.setTimeout(() => {
        syncActiveNigoRequirement();
      }, 0);
    }, 0);
  }

  function restoreRequirementDraft(formId) {
    const saved = window.formReviewStatus[formId];

    if (!saved?.templateId) {
      clearGlobalRequirementDraft();
      return;
    }

    const dropdown = $("globalRequirementTemplate");

    if (!dropdown) {
      return;
    }

    dropdown.value = saved.templateId;

    dropdown.dispatchEvent(
      new Event("change", {
        bubbles: true,
      }),
    );

    window.setTimeout(() => {
      const savedValues = saved.fieldValues || {};

      document
        .querySelectorAll("#globalRequirementFields [data-requirement-field]")
        .forEach((field) => {
          const fieldName = field.dataset.requirementField;

          if (Object.prototype.hasOwnProperty.call(savedValues, fieldName)) {
            field.value = savedValues[fieldName];

            field.dispatchEvent(
              new Event("input", {
                bubbles: true,
              }),
            );
          }
        });

      populateActiveRequirementFormField();

      window.setTimeout(() => {
        syncActiveNigoRequirement();
      }, 0);
    }, 0);
  }

  function parkRequirementBuilder({ clearDraft = false } = {}) {
    const builder = getRequirementBuilder();
    const parking = getRequirementBuilderParking();

    if (window.activeNigoRow) {
      syncActiveNigoRequirement();
    }

    if (builder && parking) {
      parking.appendChild(builder);
    }

    window.activeNigoRow = null;

    const activeFormDisplay = $("activeNigoFormDisplay");

    if (activeFormDisplay) {
      activeFormDisplay.textContent = "Select a requirement for this form.";
    }

    if (clearDraft) {
      clearGlobalRequirementDraft();
    }
  }

  function mountRequirementBuilder(row) {
    if (!row) {
      return;
    }

    const builder = getRequirementBuilder();

    const host = row.querySelector(".nigo-requirement-host");

    if (!builder || !host) {
      console.warn("The NIGO requirement builder or host was not found.");

      return;
    }

    if (window.activeNigoRow && window.activeNigoRow !== row) {
      syncActiveNigoRequirement();
    }

    window.activeNigoRow = row;
    host.appendChild(builder);

    const formId = row.dataset.formId || "";

    const formDescription = row.dataset.formDescription || formId;

    const activeFormDisplay = $("activeNigoFormDisplay");

    if (activeFormDisplay) {
      activeFormDisplay.textContent = `${formId} — ${formDescription}`;
    }

    restoreRequirementDraft(formId);

    window.setTimeout(() => {
      $("globalRequirementTemplate")?.focus();
    }, 0);
  }

  /*
   * =========================================================
   * AMENDMENT FORM DROPDOWN
   * =========================================================
   */

  function populateAmendmentFormDropdown(applicableForms) {
    const dropdown = $("globalAmendmentForm");

    if (!dropdown) {
      return;
    }

    dropdown.innerHTML = '<option value="">Select Form</option>';

    applicableForms.forEach((form) => {
      const option = document.createElement("option");

      option.value = form.form;

      option.textContent = `${form.form} - ${form.description}`;

      dropdown.appendChild(option);
    });

    console.log("Amendment form options:", dropdown.options.length);
  }

  /*
   * =========================================================
   * STATE FORM RENDERING
   * =========================================================
   */

  function renderStateGuidance(stateData) {
    const requiredForms = $("requiredForms");
    const summary = $("stateRequirementSummary");
    const completionBanner = $("reviewCompletionBanner");

    if (!requiredForms) {
      console.warn(
        "Unable to render state forms because #requiredForms was not found.",
      );

      return;
    }

    /*
     * The old active row is about to be removed.
     */
    parkRequirementBuilder({
      clearDraft: true,
    });

    if (completionBanner) {
      completionBanner.hidden = true;
    }

    renderNotices(stateData);
    renderNotes(stateData);

    const stateForms = Array.isArray(stateData.forms) ? stateData.forms : [];

    const applicableForms = stateForms.filter((form) => {
      if (form.required === true) {
        return true;
      }

      return evaluateConditions(form.conditions || []);
    });

    populateAmendmentFormDropdown(applicableForms);

    if (summary) {
      summary.textContent = `${stateData.displayName} Requirements`;
    }

    requiredForms.innerHTML = applicableForms
      .map((form) => {
        const formId = escapeHTML(form.form);
        const description = escapeHTML(form.description);

        return `
          <div
            class="required-form-row"
            data-form-id="${formId}"
            data-form-description="${description}"
          >
            <div class="state-form-main">

              <div class="state-form-content">
                <strong class="state-form-id">
                  ${formId}
                </strong>

                <span class="form-description">
                  ${description}
                </span>
              </div>

              <div class="form-status-actions">

                <span
                  class="form-review-result"
                  data-result="${formId}"
                  aria-live="polite"
                ></span>

                <button
                  type="button"
                  class="form-status-button igo-button"
                  data-form="${formId}"
                  aria-pressed="false"
                >
                  IGO
                </button>

                <button
                  type="button"
                  class="form-status-button nigo-button"
                  data-form="${formId}"
                  aria-pressed="false"
                >
                  NIGO
                </button>

              </div>
            </div>

            <div
              class="nigo-template-picker"
              hidden
            >
              <div
                class="nigo-requirement-host"
              ></div>
            </div>
          </div>
        `;
      })
      .join("");

    const formCount = $("applicableFormCount");

    if (formCount) {
      formCount.textContent = String(applicableForms.length);
    }

    updateStateDashboard();
  }

  /*
   * =========================================================
   * IGO / NIGO BUTTON HANDLER
   * =========================================================
   */

  function handleRequiredFormsClick(event) {
    const igoButtonClicked = event.target.closest(".igo-button");

    const nigoButtonClicked = event.target.closest(".nigo-button");

    if (!igoButtonClicked && !nigoButtonClicked) {
      return;
    }

    const clickedButton = igoButtonClicked || nigoButtonClicked;

    const row = clickedButton.closest(".required-form-row");

    if (!row) {
      return;
    }

    const formId = row.dataset.formId || "";

    const formDescription = row.dataset.formDescription || formId;

    const igoButton = row.querySelector(".igo-button");

    const nigoButton = row.querySelector(".nigo-button");

    const resultText = row.querySelector(".form-review-result");

    const nigoPicker = row.querySelector(".nigo-template-picker");

    /*
     * IGO
     */
    if (igoButtonClicked) {
      igoButton?.classList.add("selected");

      igoButton?.setAttribute("aria-pressed", "true");

      nigoButton?.classList.remove("selected");

      nigoButton?.setAttribute("aria-pressed", "false");

      if (window.activeNigoRow === row) {
        parkRequirementBuilder({
          clearDraft: true,
        });
      }

      if (nigoPicker) {
        nigoPicker.hidden = true;
      }

      row.dataset.formStatus = "igo";

      window.formReviewStatus[formId] = {
        status: "IGO",
        issueLabel: "",
        templateId: "",
        formId,
        formDescription,
        requirementGenerated: false,
        requirementText: "",
        fieldValues: {},
      };

      if (resultText) {
        resultText.textContent = "Reviewed";
        resultText.className = "form-review-result result-igo";
        resultText.title = "";
      }

      updateStateDashboard();
      checkReviewCompletion();

      document.dispatchEvent(new CustomEvent("stateFormsUpdated"));

      return;
    }

    /*
     * NIGO
     */
    if (nigoButtonClicked) {
      if (window.activeNigoRow && window.activeNigoRow !== row) {
        syncActiveNigoRequirement();
      }

      nigoButton?.classList.add("selected");

      nigoButton?.setAttribute("aria-pressed", "true");

      igoButton?.classList.remove("selected");

      igoButton?.setAttribute("aria-pressed", "false");

      row.dataset.formStatus = "nigo-pending";

      if (!window.formReviewStatus[formId]) {
        window.formReviewStatus[formId] = {
          status: "NIGO_PENDING",
          issueLabel: "",
          templateId: "",
          formId,
          formDescription,
          requirementGenerated: false,
          requirementText: "",
          fieldValues: {},
        };
      }

      if (nigoPicker) {
        nigoPicker.hidden = false;
      }

      if (resultText) {
        resultText.textContent = window.formReviewStatus[formId]?.templateId
          ? `NIGO: ${window.formReviewStatus[formId].issueLabel}`
          : "Select Requirement";

        resultText.className = window.formReviewStatus[formId]?.templateId
          ? "form-review-result result-nigo"
          : "form-review-result result-nigo-pending";
      }

      mountRequirementBuilder(row);

      updateStateDashboard();

      document.dispatchEvent(new CustomEvent("stateFormsUpdated"));
    }
  }

  /*
   * =========================================================
   * DASHBOARD
   * =========================================================
   */

  function checkReviewCompletion() {
    const rows = document.querySelectorAll(".required-form-row");

    const reviewedRows = document.querySelectorAll(
      '.required-form-row[data-form-status="igo"],' +
        '.required-form-row[data-form-status="nigo"]',
    );

    const completionBanner = $("reviewCompletionBanner");

    const complete = rows.length > 0 && reviewedRows.length === rows.length;

    if (completionBanner) {
      completionBanner.hidden = !complete;
    }

    if (complete) {
      console.log("State review complete.");
    }
  }

  function updateStateDashboard() {
    const total = document.querySelectorAll(".required-form-row").length;

    const statuses = Object.values(window.formReviewStatus);

    const reviewed = statuses.filter((item) => {
      return item?.status === "IGO" || item?.status === "NIGO";
    }).length;

    const issues = statuses.filter((item) => {
      return item?.status === "NIGO";
    }).length;

    const remaining = Math.max(total - reviewed, 0);

    if ($("reviewedCountCard")) {
      $("reviewedCountCard").textContent = String(reviewed);
    }

    if ($("remainingCountCard")) {
      $("remainingCountCard").textContent = String(remaining);
    }

    if ($("dashboardIssueCount")) {
      $("dashboardIssueCount").textContent = String(issues);
    }

    if ($("dashboardState")) {
      $("dashboardState").textContent = $("contractState")?.value || "--";
    }

    updateNigoDashboard();
  }

  function updateNigoDashboard() {
    const issueContainer = $("openNigoList");
    const countElement = $("openNigoCount");

    if (!issueContainer || !countElement) {
      return;
    }

    const nigos = Object.values(window.formReviewStatus).filter((item) => {
      return item?.status === "NIGO";
    });

    countElement.textContent = String(nigos.length);

    if (!nigos.length) {
      issueContainer.innerHTML = `
        <div class="nigo-empty">
          No documented NIGOs
        </div>
      `;

      return;
    }

    issueContainer.innerHTML = nigos
      .map((item) => {
        return `
          <div class="nigo-issue-item">
            <div class="nigo-issue-form">
              ${escapeHTML(item.formId)}
            </div>

            <div class="nigo-issue-reason">
              ${escapeHTML(item.issueLabel)}
            </div>
          </div>
        `;
      })
      .join("");
  }

  /*
   * =========================================================
   * GLOBAL REQUIREMENT GENERATOR EVENTS
   * =========================================================
   */

  function bindRequirementGeneratorEvents() {
    document.addEventListener("change", (event) => {
      if (event.target.id === "globalRequirementTemplate") {
        refreshActiveNigoRequirement();
        return;
      }

      if (event.target.closest("#globalRequirementFields")) {
        refreshActiveNigoRequirement();
      }
    });

    document.addEventListener("input", (event) => {
      if (event.target.closest("#globalRequirementFields")) {
        refreshActiveNigoRequirement();
      }
    });

    /*
     * Sync the active form before amendment-engine.js
     * handles the Add Requirement button.
     */
    document.addEventListener(
      "click",
      (event) => {
        if (event.target.closest("#addGlobalRequirement")) {
          syncActiveNigoRequirement();
        }
      },
      true,
    );
  }

  /*
   * =========================================================
   * STATE LOADING
   * =========================================================
   */

  async function loadSelectedState(stateCode) {
    const requiredForms = $("requiredForms");
    const completionBanner = $("reviewCompletionBanner");

    if (!stateCode) {
      window.formReviewStatus = {};

      parkRequirementBuilder({
        clearDraft: true,
      });

      if (requiredForms) {
        requiredForms.innerHTML = "";
      }

      if ($("stateImportantNotices")) {
        $("stateImportantNotices").innerHTML = "";
        $("stateImportantNotices").hidden = true;
      }

      if ($("stateNotes")) {
        $("stateNotes").innerHTML = "";
        $("stateNotes").hidden = true;
      }

      if ($("applicableFormCount")) {
        $("applicableFormCount").textContent = "0";
      }

      if (completionBanner) {
        completionBanner.hidden = true;
      }

      return;
    }

    window.formReviewStatus = {};

    try {
      const url = `./data/States/${stateCode}.json`;

      console.log("Loading state:", url);

      const response = await fetch(url, {
        cache: "no-store",
      });

      console.log("Status:", response.status);

      if (!response.ok) {
        throw new Error(`${stateCode}.json not found`);
      }

      const stateData = await response.json();

      window.currentStateData = stateData;

      console.log("STATE DATA", stateData);
      console.log("FORMS ARRAY", stateData.forms);
      console.log("FORMS LENGTH", stateData.forms?.length);

      renderStateGuidance(stateData);
    } catch (error) {
      console.error("State load failed:", error);

      if (requiredForms) {
        requiredForms.innerHTML = `
          <div class="state-load-error">
            Unable to load the selected state's forms.
          </div>
        `;
      }
    }
  }

  /*
   * =========================================================
   * INITIALIZATION
   * =========================================================
   */

  function initializeStateLoader() {
    const stateDropdown = $("contractState");
    const requiredForms = $("requiredForms");

    if (!stateDropdown) {
      console.error("Missing #contractState.");

      return;
    }

    if (!requiredForms) {
      console.error("Missing #requiredForms.");

      return;
    }

    stateDropdown.addEventListener("change", (event) => {
      loadSelectedState(event.target.value);
    });

    requiredForms.addEventListener("click", handleRequiredFormsClick);

    bindRequirementGeneratorEvents();

    if (stateDropdown.value) {
      loadSelectedState(stateDropdown.value);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeStateLoader, {
      once: true,
    });
  } else {
    initializeStateLoader();
  }
})();
