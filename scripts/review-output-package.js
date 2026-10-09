document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  window.globalSavedRequirements = window.globalSavedRequirements || [];

  const compiledAmendments = document.getElementById("compiledAmendments");

  const compiledRequirements = document.getElementById("compiledRequirements");

  const amendmentCount = document.getElementById("compiledAmendmentCount");

  const requirementCount = document.getElementById("compiledRequirementCount");

  const totalCount = document.getElementById("compiledTotalCount");

  const amendmentBadge = document.getElementById("compiledAmendmentBadge");

  const requirementBadge = document.getElementById("compiledRequirementBadge");

  const outputStatus = document.getElementById("reviewOutputStatus");

  const copyAllAmendmentsButton = document.getElementById("copyAllAmendments");

  const copyAllRequirementsButton = document.getElementById(
    "copyAllRequirements",
  );

  const copyStatus = document.getElementById("reviewOutputCopyStatus");

  let compileTimer = null;

  function cleanText(value) {
    return String(value || "")
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function getFormRows() {
    return Array.from(
      document.querySelectorAll('.required-form-row[data-form-status="nigo"]'),
    );
  }

  function getFormInformation(row) {
    const formId =
      row.dataset.formId ||
      row.querySelector(".state-form-id")?.textContent?.trim() ||
      "NIGO Form";

    const description =
      row.querySelector(".form-description")?.textContent?.trim() || "";

    return {
      formId,
      description,
    };
  }

  function collectGeneratedAmendments() {
    const results = [];

    getFormRows().forEach(function (row) {
      const form = getFormInformation(row);

      const panel = row.querySelector(".form-nigo-panel");

      const amendments = JSON.parse(panel?.dataset.amendments || "[]");

      amendments.forEach(function (amendment) {
        results.push({
          formId: form.formId,

          description: form.description,

          text: amendment.wording,
        });
      });
    });

    return results;
  }

  function collectGeneratedRequirements() {
    const requirements = Array.isArray(window.globalSavedRequirements)
      ? window.globalSavedRequirements
      : [];

    return requirements
      .map(function (requirement) {
        if (typeof requirement === "string") {
          return {
            formId: "",
            description: "",
            text: requirement.trim(),
          };
        }

        return {
          formId: requirement.formId || "",

          description: requirement.description || "",

          text: String(requirement.text || "").trim(),
        };
      })
      .filter(function (requirement) {
        return Boolean(requirement.text);
      });
  }

  function formatCompiledItems(items) {
    if (items.length === 0) {
      return "";
    }

    return items
      .map(function (item) {
        return item.text;
      })
      .join("\n");
  }

  function updateOutputReadiness() {
    document
      .querySelectorAll('.required-form-row[data-form-status="nigo"]')
      .forEach(function (row) {
        const amendment = cleanText(
          row.querySelector(".generated-amendment")?.value,
        );

        const requirement = cleanText(
          row.querySelector(".generated-requirement")?.value,
        );

        row.classList.toggle("amendment-output-ready", Boolean(amendment));

        row.classList.toggle("requirement-output-ready", Boolean(requirement));
      });
  }

  function compileReviewOutputs() {
    const amendments = collectGeneratedAmendments();

    const requirements = collectGeneratedRequirements();

    const amendmentText = formatCompiledItems(amendments);

    const requirementText = formatCompiledItems(requirements);

    if (compiledAmendments) {
      compiledAmendments.value = amendmentText;
    }

    if (compiledRequirements) {
      compiledRequirements.value = requirementText;
    }
    document.dispatchEvent(
      new CustomEvent("compiledRequirementsUpdated", {
        detail: {
          requirements: compiledRequirements.value,
        },
      }),
    );
    if (amendmentCount) {
      amendmentCount.textContent = String(amendments.length);
    }

    if (requirementCount) {
      requirementCount.textContent = String(requirements.length);
    }

    if (totalCount) {
      totalCount.textContent = String(amendments.length + requirements.length);
    }

    if (amendmentBadge) {
      amendmentBadge.textContent =
        amendments.length + " amendment" + (amendments.length === 1 ? "" : "s");
    }

    if (requirementBadge) {
      requirementBadge.textContent =
        requirements.length +
        " requirement" +
        (requirements.length === 1 ? "" : "s");
    }

    if (copyAllAmendmentsButton) {
      copyAllAmendmentsButton.disabled = amendments.length === 0;
    }

    if (copyAllRequirementsButton) {
      copyAllRequirementsButton.disabled = requirements.length === 0;
    }

    if (outputStatus) {
      const totalOutputs = amendments.length + requirements.length;

      outputStatus.textContent =
        totalOutputs > 0
          ? totalOutputs +
            " Output" +
            (totalOutputs === 1 ? "" : "s") +
            " Ready"
          : "No Outputs";

      outputStatus.classList.toggle("complete", totalOutputs > 0);
    }

    updateOutputReadiness();
  }

  function scheduleCompile() {
    window.clearTimeout(compileTimer);

    /*
     * Wait until amendment-engine.js finishes
     * updating its generated textarea values.
     */
    compileTimer = window.setTimeout(compileReviewOutputs, 0);
  }

  async function copyText(textarea, successMessage) {
    if (!textarea || !textarea.value.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(textarea.value);
    } catch (error) {
      textarea.focus();
      textarea.select();

      document.execCommand("copy");
    }

    if (copyStatus) {
      copyStatus.textContent = successMessage;

      window.setTimeout(function () {
        copyStatus.textContent = "";
      }, 1800);
    }
  }

  if (copyAllAmendmentsButton) {
    copyAllAmendmentsButton.addEventListener("click", function () {
      copyText(compiledAmendments, "All policy amendments copied.");
    });
  }

  if (copyAllRequirementsButton) {
    copyAllRequirementsButton.addEventListener("click", function () {
      copyText(compiledRequirements, "All agency requirements copied.");
    });
  }

  /*
   * User changes that may create or update
   * an amendment or requirement.
   */
  document.addEventListener("input", scheduleCompile);

  document.addEventListener("change", scheduleCompile);

  document.addEventListener("click", function (event) {
    if (
      event.target.closest("[data-form-action]") ||
      event.target.closest(".amendment-template") ||
      event.target.closest(".requirement-template")
    ) {
      scheduleCompile();
    }
  });

  document.addEventListener("stateFormsUpdated", scheduleCompile);

  document.addEventListener("nigoPanelOpened", scheduleCompile);

  document.addEventListener("requirementsUpdated", scheduleCompile);
  /*
   * Watch for stateLoader.js rebuilding
   * the required-form rows.
   */
  const requiredFormsContainer = document.getElementById("requiredForms");

  if (requiredFormsContainer) {
    const observer = new MutationObserver(scheduleCompile);

    observer.observe(requiredFormsContainer, {
      childList: true,
      subtree: true,
    });
  }

  compileReviewOutputs();
});
