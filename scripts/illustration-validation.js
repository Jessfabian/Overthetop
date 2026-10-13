(() => {
  "use strict";

  const API_URL = "/api/validate";

  const validatorState = {
    applicationFile: null,
    illustrationFile: null,
    report: null,
    mismatches: [],
  };

  const fieldLabels = {
    insuredName: "Insured name",
    plan: "Plan",
    faceAmount: "Face amount",
    apl: "Automatic Premium Loan",
    loanRate: "Loan rate",
    dividend: "Dividend option",
    waiver: "Waiver of Premium",
    gir: "GIR",
    rtr: "RTR",
    lisr: "LISR",
    lisrTfa: "LISR Target Face Amount",
    lisrModal: "LISR Modal Payment",
    lisrLumpSum: "LISR Unscheduled Lump Sum",
    alirModal: "ALIR Modal Payment",
    alirDuration: "ALIR Payment Duration",
    alirUnscheduled: "ALIR Unscheduled",
    frequency: "Payment frequency",
    signedDate: "Signature date",
    signatureEvidence: "Signature evidence",
    applicationCityState: "Application signed in",
  };

  function getElement(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        })[character],
    );
  }

  function showValidationError(message = "") {
    const errorElement = getElement("irValidationError");

    if (!errorElement) {
      return;
    }

    errorElement.textContent = message;
    errorElement.hidden = !message;
  }

  function updateRunButton() {
    const runButton = getElement("irRunValidationButton");

    const statusElement = getElement("irValidationRunStatus");

    const ready = Boolean(
      validatorState.applicationFile && validatorState.illustrationFile,
    );

    runButton.disabled = !ready;

    statusElement.textContent = ready
      ? "Ready for validation"
      : "Waiting for both PDFs";

    statusElement.className = ready
      ? "validation-status validation-status-good"
      : "validation-status validation-status-pending";
  }

  function validatePdfFile(file) {
    if (!file) {
      return false;
    }

    const fileName = file.name.toLowerCase();

    return file.type === "application/pdf" || fileName.endsWith(".pdf");
  }

  function setSelectedFile(fileType, file) {
    if (!validatePdfFile(file)) {
      showValidationError("Please select a valid PDF file.");

      return;
    }

    showValidationError("");

    if (fileType === "application") {
      validatorState.applicationFile = file;

      getElement("irApplicationFileMeta").textContent =
        formatFileDescription(file);
    }

    if (fileType === "illustration") {
      validatorState.illustrationFile = file;

      getElement("irIllustrationFileMeta").textContent =
        formatFileDescription(file);
    }

    updateRunButton();
  }

  function formatFileDescription(file) {
    const sizeInMegabytes = (file.size / 1024 / 1024).toFixed(2);

    return `${file.name} • ${sizeInMegabytes} MB`;
  }

  function configureDropZone({ dropZoneId, fileInputId, fileType }) {
    const dropZone = getElement(dropZoneId);
    const fileInput = getElement(fileInputId);

    if (!dropZone || !fileInput) {
      return;
    }

    fileInput.addEventListener("change", () => {
      const selectedFile = fileInput.files?.[0];

      setSelectedFile(fileType, selectedFile);
    });

    ["dragenter", "dragover"].forEach((eventName) => {
      dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();

        dropZone.classList.add("is-dragging");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();

        dropZone.classList.remove("is-dragging");
      });
    });

    dropZone.addEventListener("drop", (event) => {
      const droppedFile = event.dataTransfer?.files?.[0];

      setSelectedFile(fileType, droppedFile);
    });
  }

  async function checkValidatorService() {
    const serviceStatus = getElement("irValidatorServiceStatus");

    try {
      const response = await fetch("/api/health");

      if (!response.ok) {
        throw new Error("Service health check failed.");
      }

      serviceStatus.textContent = "Python service ready";

      serviceStatus.className = "validation-status " + "validation-status-good";
    } catch (error) {
      console.error(error);

      serviceStatus.textContent = "Python service unavailable";

      serviceStatus.className =
        "validation-status " + "validation-status-error";
    }
  }

  async function runIllustrationValidation() {
    const runButton = getElement("irRunValidationButton");

    const runStatus = getElement("irValidationRunStatus");

    if (!validatorState.applicationFile || !validatorState.illustrationFile) {
      showValidationError("Upload both PDFs before running validation.");

      return;
    }

    runButton.disabled = true;

    runStatus.textContent = "Extracting PDFs and running OCR...";

    runStatus.className = "validation-status " + "validation-status-warning";

    showValidationError("");

    const uploadData = new FormData();

    uploadData.append("application", validatorState.applicationFile);

    uploadData.append("illustration", validatorState.illustrationFile);

    uploadData.append("state", getElement("irValidationState").value);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: uploadData,
      });

      const report = await response.json();

      if (!response.ok) {
        throw new Error(report.error || "Validation request failed.");
      }

      const documentErrors = [
        ...(report.application?.errors || []),
        ...(report.illustration?.errors || []),
      ];

      if (documentErrors.length) {
        throw new Error(documentErrors.join(" "));
      }

      validatorState.report = report;

      validatorState.mismatches = getActionableMismatches(
        report.comparison || [],
      );

      renderValidationReport(report);

      saveValidationToCase(report);

      runStatus.textContent = "Validation complete";

      runStatus.className = "validation-status " + "validation-status-good";
    } catch (error) {
      console.error(error);

      showValidationError(
        error.message || "The documents could not be validated.",
      );

      runStatus.textContent = "Validation failed";

      runStatus.className = "validation-status " + "validation-status-error";
    } finally {
      runButton.disabled = false;
    }
  }

  function getActionableMismatches(rows) {
    return rows.filter(
      (row) =>
        row.status === "Mismatch" ||
        row.status === "Review" ||
        row.status === "Failed",
    );
  }

  function renderValidationReport(report) {
    renderValidationSummary(report.summary || {});

    renderExtractedFields(
      "irApplicationExtractedFields",
      report.application?.fields || {},
    );

    renderExtractedFields(
      "irIllustrationExtractedFields",
      report.illustration?.fields || {},
    );

    getElement("irApplicationExtractedText").value = buildExtractedText(
      report.application?.pages || [],
    );

    getElement("irIllustrationExtractedText").value = buildExtractedText(
      report.illustration?.pages || [],
    );

    renderComparisonTable(report.comparison || []);

    getElement("irValidationSummary").hidden = false;

    getElement("irExtractedValuesArea").hidden = false;

    getElement("irValidationResultsCard").hidden = false;

    getElement("irAddValidationRequirementButton").hidden =
      validatorState.mismatches.length === 0;
  }

  function renderValidationSummary(summary) {
    getElement("irMatchCount").textContent = summary.matches || 0;

    getElement("irMismatchCount").textContent = summary.mismatches || 0;

    getElement("irReviewCount").textContent = summary.reviews || 0;

    getElement("irExcludedCount").textContent = summary.excluded || 0;
  }

  function renderExtractedFields(containerId, fields) {
    const container = getElement(containerId);

    container.innerHTML = "";

    Object.entries(fieldLabels).forEach(([fieldKey, label]) => {
      const field = fields[fieldKey] || {};
      const value = field.value || "";

      const card = document.createElement("article");

      card.className = [
        "validation-field-card",
        getConfidenceClass(field),
      ].join(" ");

      card.innerHTML = `
                    <div class="validation-field-heading">
                        <strong>
                            ${escapeHtml(label)}
                        </strong>

                        <span class="validation-confidence">
                            ${
                              field.excluded
                                ? "N/A"
                                : `${field.confidence || 0}%`
                            }
                        </span>
                    </div>

                    <div class="validation-field-value">
                        ${escapeHtml(value) || "Not found"}
                    </div>

                    <small class="validation-field-source">
                        ${
                          field.page_number
                            ? `Page ${field.page_number} • `
                            : ""
                        }
                        ${escapeHtml(field.source || "No source identified")}
                    </small>
                `;

      container.appendChild(card);
    });
  }

  function getConfidenceClass(field) {
    if (field.excluded) {
      return "is-excluded";
    }

    const confidence = Number(field.confidence || 0);

    if (confidence >= 85) {
      return "is-high";
    }

    if (confidence >= 50) {
      return "is-medium";
    }

    return "is-low";
  }

  function buildExtractedText(pages) {
    return pages
      .map(
        (page) =>
          `PAGE ${page.page_number} ` +
          `[${page.source}]\n` +
          `${page.text || ""}`,
      )
      .join("\n\n");
  }

  function renderComparisonTable(rows) {
    const container = getElement("irValidationComparisonResults");

    const tableRows = rows
      .map(
        (row) => `
            <tr>
                <td>
                    ${escapeHtml(row.label)}
                </td>

                <td>
                    ${escapeHtml(row.application)}
                </td>

                <td>
                    ${escapeHtml(row.illustration)}
                </td>

                <td>
                    ${renderResultBadge(row.status)}
                </td>

                <td>
                    ${escapeHtml(row.note)}
                </td>
            </tr>
        `,
      )
      .join("");

    container.innerHTML = `
            <table class="validation-table">
                <thead>
                    <tr>
                        <th>Field</th>
                        <th>Part 1</th>
                        <th>Illustration</th>
                        <th>Result</th>
                        <th>Review note</th>
                    </tr>
                </thead>

                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        `;
  }

  function renderResultBadge(status) {
    const statusClassMap = {
      Match: "validation-status-good",
      Mismatch: "validation-status-error",
      Review: "validation-status-warning",
      Excluded: "validation-status-neutral",
      Failed: "validation-status-error",
    };

    const statusClass = statusClassMap[status] || "validation-status-neutral";

    return `
            <span
                class="validation-status ${statusClass}"
            >
                ${escapeHtml(status)}
            </span>
        `;
  }

  function saveValidationToCase(report) {
    /*
     * Shared Full IR result object.
     * Other Full IR scripts can access:
     *
     * window.fullIRIllustrationValidation
     */

    window.fullIRIllustrationValidation = {
      completed: true,
      completedAt: report.generatedAt || new Date().toISOString(),

      state: report.state || "",

      summary: {
        matches: report.summary?.matches || 0,

        mismatches: report.summary?.mismatches || 0,

        reviews: report.summary?.reviews || 0,

        excluded: report.summary?.excluded || 0,

        failed: report.summary?.failed || 0,
      },

      application: report.application?.fields || {},

      illustration: report.illustration?.fields || {},

      comparison: report.comparison || [],

      actionableItems: validatorState.mismatches,
    };

    localStorage.setItem(
      "fullIRIllustrationValidation",
      JSON.stringify(window.fullIRIllustrationValidation),
    );

    document.dispatchEvent(
      new CustomEvent("fullIRIllustrationValidationComplete", {
        detail: window.fullIRIllustrationValidation,
      }),
    );
  }

  function addValidationRequirements() {
    const mismatches = validatorState.mismatches;

    if (!mismatches.length) {
      return;
    }

    mismatches.forEach((row) => {
      const requirementText = buildRequirementText(row);

      addRequirementToFullIR(requirementText, row);
    });

    document.dispatchEvent(new CustomEvent("fullIRRequirementsUpdated"));

    const button = getElement("irAddValidationRequirementButton");

    button.textContent = "Requirements Added";

    button.disabled = true;
  }

  function buildRequirementText(row) {
    if (row.status === "Mismatch") {
      return (
        `Illustration validation mismatch - ` +
        `${row.label}: ` +
        `Part 1 reflects ` +
        `"${row.application}" while the ` +
        `illustration reflects ` +
        `"${row.illustration}". ` +
        `Please provide corrected documentation.`
      );
    }

    return (
      `Illustration validation review required - ` + `${row.label}: ${row.note}`
    );
  }

  function addRequirementToFullIR(requirementText, comparisonRow) {
    /*
     * Use the Full IR requirement function when it
     * already exists.
     */

    if (typeof window.addSavedRequirement === "function") {
      window.addSavedRequirement(requirementText);

      return;
    }

    if (typeof window.addRequirement === "function") {
      window.addRequirement(requirementText);

      return;
    }

    /*
     * Fallback for your shared requirement array.
     */

    window.globalSavedRequirements = window.globalSavedRequirements || [];

    const alreadyExists = window.globalSavedRequirements.some((requirement) => {
      const existingText =
        typeof requirement === "string" ? requirement : requirement.text;

      return existingText === requirementText;
    });

    if (!alreadyExists) {
      window.globalSavedRequirements.push({
        id: `illustration-validation-` + `${comparisonRow.field}`,

        type: "illustration-validation",

        source: "Full Initial Review",

        text: requirementText,

        field: comparisonRow.field,

        applicationValue: comparisonRow.application,

        illustrationValue: comparisonRow.illustration,

        status: comparisonRow.status,

        createdAt: new Date().toISOString(),
      });
    }

    localStorage.setItem(
      "globalSavedRequirements",
      JSON.stringify(window.globalSavedRequirements),
    );
  }

  function resetIllustrationValidation() {
    validatorState.applicationFile = null;
    validatorState.illustrationFile = null;
    validatorState.report = null;
    validatorState.mismatches = [];

    getElement("irApplicationFile").value = "";
    getElement("irIllustrationFile").value = "";

    getElement("irApplicationFileMeta").textContent = "No application selected";

    getElement("irIllustrationFileMeta").textContent =
      "No illustration selected";

    getElement("irValidationSummary").hidden = true;

    getElement("irExtractedValuesArea").hidden = true;

    getElement("irValidationResultsCard").hidden = true;

    getElement("irApplicationExtractedFields").innerHTML = "";

    getElement("irIllustrationExtractedFields").innerHTML = "";

    getElement("irApplicationExtractedText").value = "";

    getElement("irIllustrationExtractedText").value = "";

    getElement("irValidationComparisonResults").innerHTML = "";

    const requirementsButton = getElement("irAddValidationRequirementButton");

    requirementsButton.hidden = true;
    requirementsButton.disabled = false;
    requirementsButton.textContent = "Add Mismatches to Requirements";

    showValidationError("");
    updateRunButton();
  }

  function initializeStateIntegration() {
    const validationStateField = getElement("irValidationState");

    /*
     * Attempts to copy the existing Full IR
     * contract-state selection.
     */

    const existingStateField =
      getElement("contractState") ||
      getElement("contractStateSelect") ||
      getElement("caseContractState");

    if (existingStateField && existingStateField.value) {
      const stateValue = existingStateField.value.trim().toUpperCase();

      validationStateField.value = stateValue === "NY" ? "NY" : "OTHER";
    }

    validationStateField.addEventListener("change", () => {
      const isNewYork = validationStateField.value === "NY";

      const ruleBadge = getElement("irValidationRuleBadge");

      ruleBadge.textContent = isNewYork
        ? "NY Reg 74 checks enabled"
        : "Standard comparison rules";

      ruleBadge.className = isNewYork
        ? "validation-status " + "validation-status-warning"
        : "validation-status " + "validation-status-neutral";
    });
  }

  function restoreSavedValidation() {
    try {
      const savedValue = localStorage.getItem("fullIRIllustrationValidation");

      if (!savedValue) {
        return;
      }

      window.fullIRIllustrationValidation = JSON.parse(savedValue);
    } catch (error) {
      console.warn(
        "Could not restore illustration " + "validation results.",
        error,
      );
    }
  }

  function initializeIllustrationValidator() {
    const section = getElement("illustrationValidationSection");

    if (!section) {
      return;
    }

    configureDropZone({
      dropZoneId: "irApplicationDropZone",

      fileInputId: "irApplicationFile",

      fileType: "application",
    });

    configureDropZone({
      dropZoneId: "irIllustrationDropZone",

      fileInputId: "irIllustrationFile",

      fileType: "illustration",
    });

    getElement("irRunValidationButton").addEventListener(
      "click",
      runIllustrationValidation,
    );

    getElement("irResetValidationButton").addEventListener(
      "click",
      resetIllustrationValidation,
    );

    getElement("irAddValidationRequirementButton").addEventListener(
      "click",
      addValidationRequirements,
    );

    initializeStateIntegration();
    restoreSavedValidation();
    updateRunButton();
    checkValidatorService();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeIllustrationValidator,
    );
  } else {
    initializeIllustrationValidator();
  }
})();
