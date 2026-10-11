(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  window.globalSavedRequirements = Array.isArray(window.globalSavedRequirements)
    ? window.globalSavedRequirements
    : [];

  window.globalSavedAmendments = Array.isArray(window.globalSavedAmendments)
    ? window.globalSavedAmendments
    : [];

  function getRequirementTexts() {
    return window.globalSavedRequirements
      .map((requirement) => {
        if (typeof requirement === "string") {
          return requirement.trim();
        }

        return String(requirement?.text || "").trim();
      })
      .filter(Boolean);
  }

  function getAmendmentTexts() {
    return window.globalSavedAmendments
      .map((amendment) => {
        if (typeof amendment === "string") {
          return amendment.trim();
        }

        return String(amendment?.text || "").trim();
      })
      .filter(Boolean);
  }

  function getFormCount() {
    return document.querySelectorAll("#requiredForms .required-form-row")
      .length;
  }

  function updateStateDashboard() {
    const stateDropdown = $("contractState");
    const dashboardState = $("dashboardState");

    if (dashboardState) {
      dashboardState.textContent = stateDropdown?.value || "--";
    }
  }

  function updateFormDashboard() {
    const formCount = getFormCount();
    const dashboardCount = $("dashboardFormCount");

    if (dashboardCount) {
      dashboardCount.textContent = String(formCount);
    }
  }

  function renderRequirements() {
    const requirements = getRequirementTexts();
    const count = requirements.length;

    const output = $("compiledRequirements");
    const hiddenCount = $("compiledRequirementCount");
    const badge = $("compiledRequirementBadge");
    const dashboardCount = $("dashboardRequirementCount");
    const copyButton = $("copyAllRequirements");
    const clearButton = $("clearAllRequirements");

    if (output) {
      output.value = requirements
        .map((requirement, index) => {
          return `${index + 1}. ${requirement}`;
        })
        .join("\n\n");
    }

    if (hiddenCount) {
      hiddenCount.textContent = String(count);
    }

    if (badge) {
      badge.textContent =
        count === 1 ? "1 requirement" : `${count} requirements`;
    }

    if (dashboardCount) {
      dashboardCount.textContent = String(count);
    }

    if (copyButton) {
      copyButton.disabled = count === 0;
    }

    if (clearButton) {
      clearButton.disabled = count === 0;
    }
  }

  function renderAmendments() {
    const amendments = getAmendmentTexts();
    const count = amendments.length;

    const output = $("compiledAmendments");
    const hiddenCount = $("compiledAmendmentCount");
    const badge = $("compiledAmendmentBadge");
    const dashboardCount = $("dashboardAmendmentCount");
    const copyButton = $("copyAllAmendments");
    const clearButton = $("clearAllAmendments");

    if (output) {
      output.value = amendments
        .map((amendment, index) => {
          return `${index + 1}. ${amendment}`;
        })
        .join("\n\n");
    }

    if (hiddenCount) {
      hiddenCount.textContent = String(count);
    }

    if (badge) {
      badge.textContent = count === 1 ? "1 amendment" : `${count} amendments`;
    }

    if (dashboardCount) {
      dashboardCount.textContent = String(count);
    }

    if (copyButton) {
      copyButton.disabled = count === 0;
    }

    if (clearButton) {
      clearButton.disabled = count === 0;
    }
  }

  function updateOutputSummary() {
    const requirementCount = getRequirementTexts().length;

    const amendmentCount = getAmendmentTexts().length;

    const totalCount = requirementCount + amendmentCount;

    const total = $("compiledTotalCount");
    const status = $("reviewOutputStatus");

    if (total) {
      total.textContent = totalCount === 1 ? "1 item" : `${totalCount} items`;
    }

    if (status) {
      status.textContent = totalCount > 0 ? "Output ready" : "No outputs";
    }
  }

  function renderEverything() {
    updateStateDashboard();
    updateFormDashboard();
    renderRequirements();
    renderAmendments();
    updateOutputSummary();
  }

  function showStatus(elementId, message, isError = false) {
    const status = $(elementId);

    if (!status) {
      return;
    }

    status.textContent = message;
    status.classList.toggle("is-error", isError);

    window.clearTimeout(status.clearTimer);

    status.clearTimer = window.setTimeout(() => {
      status.textContent = "";
      status.classList.remove("is-error");
    }, 3000);
  }

  async function copyText(text, successMessage) {
    const value = String(text || "").trim();

    if (!value) {
      showStatus(
        "reviewOutputCopyStatus",
        "There is no wording to copy.",
        true,
      );

      return;
    }

    try {
      await navigator.clipboard.writeText(value);

      showStatus("reviewOutputCopyStatus", successMessage);
    } catch (error) {
      const helper = document.createElement("textarea");

      helper.value = value;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.opacity = "0";

      document.body.appendChild(helper);
      helper.select();

      const copied = document.execCommand("copy");

      helper.remove();

      showStatus(
        "reviewOutputCopyStatus",
        copied
          ? successMessage
          : "Copy was unavailable. Copy the wording manually.",
        !copied,
      );
    }
  }

  function addAmendment() {
    const generatedOutput = $("globalGeneratedAmendment");

    const amendmentText = generatedOutput?.value.trim() || "";

    if (!amendmentText) {
      showStatus(
        "amendmentSaveStatus",
        "Select an amendment template and complete the wording first.",
        true,
      );

      return;
    }

    const duplicateExists = getAmendmentTexts().includes(amendmentText);

    if (duplicateExists) {
      showStatus(
        "amendmentSaveStatus",
        "This amendment has already been added.",
        true,
      );

      return;
    }

    window.globalSavedAmendments.push(amendmentText);

    renderEverything();

    document.dispatchEvent(
      new CustomEvent("verbiageAmendmentsUpdated", {
        detail: {
          amendments: window.globalSavedAmendments,
        },
      }),
    );

    showStatus("amendmentSaveStatus", "Amendment added.");
  }

  function clearRequirements() {
    window.globalSavedRequirements.length = 0;

    document.dispatchEvent(
      new CustomEvent("requirementsUpdated", {
        detail: {
          requirements: [],
        },
      }),
    );

    renderEverything();

    showStatus("reviewOutputCopyStatus", "Requirements cleared.");
  }

  function clearAmendments() {
    window.globalSavedAmendments.length = 0;

    document.dispatchEvent(
      new CustomEvent("verbiageAmendmentsUpdated", {
        detail: {
          amendments: [],
        },
      }),
    );

    renderEverything();

    showStatus("reviewOutputCopyStatus", "Amendments cleared.");
  }

  function handleButtonClick(event) {
    const button = event.target.closest("button");

    if (!button) {
      return;
    }

    switch (button.id) {
      case "addGlobalAmendment":
        event.preventDefault();
        event.stopImmediatePropagation();
        addAmendment();
        break;

      case "copyGlobalAmendment":
        event.preventDefault();
        event.stopImmediatePropagation();

        copyText($("globalGeneratedAmendment")?.value, "Amendment copied.");
        break;

      case "copyAllRequirements":
        event.preventDefault();
        event.stopImmediatePropagation();

        copyText($("compiledRequirements")?.value, "Requirements copied.");
        break;

      case "clearAllRequirements":
        event.preventDefault();
        event.stopImmediatePropagation();
        clearRequirements();
        break;

      case "copyAllAmendments":
        event.preventDefault();
        event.stopImmediatePropagation();

        copyText($("compiledAmendments")?.value, "Amendments copied.");
        break;

      case "clearAllAmendments":
        event.preventDefault();
        event.stopImmediatePropagation();
        clearAmendments();
        break;

      default:
        break;
    }
  }

  function initializeVerbiageOutput() {
    document.addEventListener("click", handleButtonClick, true);

    $("contractState")?.addEventListener("change", () => {
      window.setTimeout(renderEverything, 0);
    });

    document.addEventListener("requirementsUpdated", () => {
      window.setTimeout(renderEverything, 0);
    });

    document.addEventListener("compiledRequirementsUpdated", () => {
      window.setTimeout(renderEverything, 0);
    });

    document.addEventListener("stateFormsUpdated", () => {
      window.setTimeout(renderEverything, 0);
    });

    const requiredForms = $("requiredForms");

    if (requiredForms) {
      const observer = new MutationObserver(() => {
        renderEverything();
      });

      observer.observe(requiredForms, {
        childList: true,
        subtree: true,
      });
    }

    renderEverything();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeVerbiageOutput, {
      once: true,
    });
  } else {
    initializeVerbiageOutput();
  }
})();











document.addEventListener("DOMContentLoaded", () => {

    const stateDropdown =
        document.getElementById("contractState");

    const stateChip =
        document.getElementById(
            "selectedStateDisplay"
        );

    if (!stateDropdown || !stateChip) {
        return;
    }

    stateDropdown.addEventListener("change", () => {

        const selectedOption =
            stateDropdown.options[
                stateDropdown.selectedIndex
            ];

        stateChip.textContent =
            selectedOption.textContent;

        stateChip.dataset.empty = "false";

    });

});