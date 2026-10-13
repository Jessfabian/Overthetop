(() => {
  "use strict";

  const API_URL = "/api/validate-stream";

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

      const applicationStatus = getElement("applicationUploadStatus");
      if (applicationStatus) {
        applicationStatus.textContent = "✓ Uploaded";
      }
    }

    if (fileType === "illustration") {
      validatorState.illustrationFile = file;

      getElement("irIllustrationFileMeta").textContent =
        formatFileDescription(file);

      const illustrationStatus = getElement("illustrationUploadStatus");
      if (illustrationStatus) {
        illustrationStatus.textContent = "✓ Uploaded";
      }
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

    if (!serviceStatus) {
      return;
    }

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

  function markStepComplete(stepId) {
    const step = getElement(stepId);

    if (!step) {
      return;
    }

    step.classList.remove("active", "pending");
    step.classList.add("complete");

    const icon = step.querySelector(".step-icon");
    if (icon) {
      icon.textContent = "✓";
    }
  }

  function markPreviousStepsComplete(stage) {
    if (["illustration", "comparison", "output", "complete"].includes(stage)) {
      markStepComplete("stepReadApplication");
    }

    if (["comparison", "output", "complete"].includes(stage)) {
      markStepComplete("stepReadIllustration");
    }

    if (["output", "complete"].includes(stage)) {
      markStepComplete("stepCompareValues");
    }

    if (stage === "complete") {
      markStepComplete("stepReviewOutput");
    }
  }

  function updateValidationProgress({
    percent = 0,
    stage = "",
    message = "Processing documents",
    elapsedSeconds,
  }) {
    const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));
    const progressFill = getElement("ivProgressFill");
    const progressPercent = getElement("ivProgressPercent");
    const progressMessage = getElement("ivProgressMessage");
    const elapsedElement = getElement("ivElapsedTime");

    if (progressFill) {
      progressFill.style.width = `${safePercent}%`;
    }

    if (progressPercent) {
      progressPercent.textContent = `${safePercent}%`;
    }

    if (progressMessage) {
      progressMessage.textContent = message;
    }

    if (elapsedElement && typeof elapsedSeconds === "number") {
      elapsedElement.textContent = `Elapsed: ${elapsedSeconds.toFixed(1)}s`;
    }

    document.querySelectorAll(".iv-step").forEach((step) => {
      step.classList.remove("active");
    });

    const stageMap = {
      application: "stepReadApplication",
      illustration: "stepReadIllustration",
      comparison: "stepCompareValues",
      output: "stepReviewOutput",
    };

    const currentStep = getElement(stageMap[stage]);
    if (currentStep) {
      currentStep.classList.remove("pending");
      currentStep.classList.add("active");
    }

    markPreviousStepsComplete(stage);
  }

  function resetProgressDisplay() {
    const progressFill = getElement("ivProgressFill");
    const progressPercent = getElement("ivProgressPercent");
    const progressMessage = getElement("ivProgressMessage");
    const elapsedTime = getElement("ivElapsedTime");

    if (progressFill) progressFill.style.width = "0%";
    if (progressPercent) progressPercent.textContent = "0%";
    if (progressMessage) progressMessage.textContent = "Ready to begin";
    if (elapsedTime) elapsedTime.textContent = "Elapsed: 0.0s";

    document.querySelectorAll(".iv-step").forEach((step) => {
      step.classList.remove("active", "complete");
      step.classList.add("pending");
      const icon = step.querySelector(".step-icon");
      if (icon) icon.textContent = "○";
    });
  }

  async function runIllustrationValidation() {
    const runButton = getElement("irRunValidationButton");
    const runStatus = getElement("irValidationRunStatus");

    if (!validatorState.applicationFile || !validatorState.illustrationFile) {
      showValidationError("Upload both PDFs before running validation.");
      return;
    }

    if (!runButton || !runStatus) {
      console.error("The validation button or status element is missing.");
      return;
    }

    runButton.disabled = true;
    runStatus.textContent = "Validation in progress";
    runStatus.className = "validation-status validation-status-warning";
    showValidationError("");
    resetProgressDisplay();

    updateValidationProgress({
      percent: 1,
      stage: "application",
      message: "Uploading documents...",
      elapsedSeconds: 0,
    });

    const uploadData = new FormData();
    uploadData.append("application", validatorState.applicationFile);
    uploadData.append("illustration", validatorState.illustrationFile);

    const stateField = getElement("irValidationState");
    uploadData.append("state", stateField?.value || "");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: uploadData,
      });

      if (!response.ok) {
        let errorMessage = "Validation request failed.";
        try {
          const errorResult = await response.json();
          errorMessage = errorResult.error || errorMessage;
        } catch (_parseError) {
          // Keep the default message when the error response is not JSON.
        }
        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error(
          "The browser could not read the validation progress stream.",
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let remainingText = "";
      let finalReport = null;

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        remainingText += decoder.decode(value, { stream: true });
        const lines = remainingText.split("\n");
        remainingText = lines.pop() || "";

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine) continue;

          const event = JSON.parse(cleanLine);

          if (event.type === "progress") {
            updateValidationProgress(event);
          } else if (event.type === "complete") {
            updateValidationProgress(event);
            finalReport = event.report;
          } else if (event.type === "error") {
            throw new Error(event.message || "Validation failed.");
          }
        }
      }

      if (remainingText.trim()) {
        const event = JSON.parse(remainingText.trim());
        if (event.type === "complete") {
          updateValidationProgress(event);
          finalReport = event.report;
        } else if (event.type === "error") {
          throw new Error(event.message || "Validation failed.");
        }
      }

      if (!finalReport) {
        throw new Error("Validation finished without returning a report.");
      }

      const documentErrors = [
        ...(finalReport.application?.errors || []),
        ...(finalReport.illustration?.errors || []),
      ];

      if (documentErrors.length) {
        throw new Error(documentErrors.join(" "));
      }

      validatorState.report = finalReport;
      validatorState.mismatches = getActionableMismatches(
        finalReport.comparison || [],
      );

      renderValidationReport(finalReport);
      saveValidationToCase(finalReport);

      updateValidationProgress({
        percent: 100,
        stage: "complete",
        message: "Validation complete",
        elapsedSeconds: Number(finalReport.elapsedSeconds) || undefined,
      });

      runStatus.textContent = "Validation complete";
      runStatus.className = "validation-status validation-status-good";
    } catch (error) {
      console.error(error);
      showValidationError(
        error.message || "The documents could not be validated.",
      );
      runStatus.textContent = "Validation failed";
      runStatus.className = "validation-status validation-status-error";
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

    resetProgressDisplay();

    const applicationInput = getElement("irApplicationFile");
    const illustrationInput = getElement("irIllustrationFile");
    if (applicationInput) applicationInput.value = "";
    if (illustrationInput) illustrationInput.value = "";

    const applicationMeta = getElement("irApplicationFileMeta");
    const illustrationMeta = getElement("irIllustrationFileMeta");
    if (applicationMeta)
      applicationMeta.textContent = "No application selected";
    if (illustrationMeta)
      illustrationMeta.textContent = "No illustration selected";

    const applicationStatus = getElement("applicationUploadStatus");
    const illustrationStatus = getElement("illustrationUploadStatus");
    if (applicationStatus) applicationStatus.textContent = "Not Uploaded";
    if (illustrationStatus) illustrationStatus.textContent = "Not Uploaded";

    const summary = getElement("irValidationSummary");
    const extractedArea = getElement("irExtractedValuesArea");
    const resultsCard = getElement("irValidationResultsCard");
    if (summary) summary.hidden = true;
    if (extractedArea) extractedArea.hidden = true;
    if (resultsCard) resultsCard.hidden = true;

    const applicationFields = getElement("irApplicationExtractedFields");
    const illustrationFields = getElement("irIllustrationExtractedFields");
    const applicationText = getElement("irApplicationExtractedText");
    const illustrationText = getElement("irIllustrationExtractedText");
    const comparisonResults = getElement("irValidationComparisonResults");
    if (applicationFields) applicationFields.innerHTML = "";
    if (illustrationFields) illustrationFields.innerHTML = "";
    if (applicationText) applicationText.value = "";
    if (illustrationText) illustrationText.value = "";
    if (comparisonResults) comparisonResults.innerHTML = "";

    const requirementsButton = getElement("irAddValidationRequirementButton");
    if (requirementsButton) {
      requirementsButton.hidden = true;
      requirementsButton.disabled = false;
      requirementsButton.textContent = "Add Mismatches to Requirements";
    }

    showValidationError("");
    updateRunButton();
  }

  function initializeStateIntegration() {
    const validationStateField = getElement("irValidationState");

    if (!validationStateField) {
      return;
    }

    const displayState = () => {
      const display = getElement("validationStateDisplay");
      if (display) {
        display.textContent = validationStateField.value || "Not Selected";
      }

      const ruleBadge = getElement("irValidationRuleBadge");
      if (ruleBadge) {
        const isNewYork = validationStateField.value === "NY";
        ruleBadge.textContent = isNewYork
          ? "NY Reg 74 checks enabled"
          : "Standard comparison rules";
        ruleBadge.className = isNewYork
          ? "validation-status validation-status-warning"
          : "validation-status validation-status-neutral";
      }
    };

    const existingStateField =
      getElement("contractState") ||
      getElement("contractStateSelect") ||
      getElement("caseContractState");

    if (existingStateField?.value) {
      const stateValue = existingStateField.value.trim().toUpperCase();
      validationStateField.value = stateValue === "NY" ? "NY" : "OTHER";
    }

    validationStateField.addEventListener("change", displayState);
    displayState();
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
