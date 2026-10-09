(function () {
  "use strict";

  const comparisonItems = [
    {
      key: "planType",
      label: "Plan Type",
      question: "C2 / C16",
    },
    {
      key: "faceAmount",
      label: "Face Amount",
      question: "C3 / C17",
    },
    {
      key: "automaticPremiumLoan",
      label: "Automatic Premium Loan",
      question: "C4",
    },
    {
      key: "loanRate",
      label: "Loan Rate",
      question: "C5",
    },
    {
      key: "dividendOption",
      label: "Dividend Option",
      question: "C6",
    },
    {
      key: "waiverOfPremium",
      label: "Waiver of Premium",
      question: "C7 / C18",
    },
    {
      key: "ltcr",
      label: "Long-Term Care Rider",
      question: "C9",
    },
    {
      key: "gir",
      label: "Guaranteed Insurability Rider",
      question: "C10",
    },
    {
      key: "paymentFrequency",
      label: "Payment Frequency",
      question: "Policy Design",
    },
  ];

  function normalizeComparisonValue(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\$/g, "")
      .replace(/,/g, "")
      .replace(/\s+/g, " ")
      .replace(/\byes\b/g, "yes")
      .replace(/\bno\b/g, "no");
  }

  function valuesMatch(firstValue, secondValue) {
    return (
      normalizeComparisonValue(firstValue) ===
      normalizeComparisonValue(secondValue)
    );
  }

  function createComparisonRows() {
    const container = document.getElementById("illustrationComparisonRows");

    if (!container) {
      return;
    }

    container.innerHTML = "";

    comparisonItems.forEach(function (item) {
      const row = document.createElement("div");

      row.className = "illustration-comparison-row";
      row.dataset.comparisonKey = item.key;

      row.innerHTML = `
        <div class="comparison-item-name">
          ${item.label}

          <span class="comparison-question">
            Part 1 ${item.question}
          </span>
        </div>

        <input
          type="text"
          class="comparison-input part-one-comparison-value"
          data-comparison-key="${item.key}"
          placeholder="Enter Part 1 value"
          autocomplete="off">

        <input
          type="text"
          class="comparison-input illustration-comparison-value"
          data-comparison-key="${item.key}"
          placeholder="Enter illustration value"
          autocomplete="off">

        <span class="comparison-result pending">
          Not Reviewed
        </span>
      `;

      container.appendChild(row);
    });
  }

  function setValidationBadge(status, text) {
    const badge = document.getElementById("illustrationValidationBadge");

    if (!badge) {
      return;
    }

    badge.className = "validation-badge " + status;
    badge.textContent = text;
  }

  function buildRequirement(mismatches) {
    if (!mismatches.length) {
      return "";
    }

    const mismatchLines = mismatches
      .map(function (item) {
        return (
          "• " +
          item.label +
          ": The Part 1 indicates " +
          item.partOneValue +
          "; however, the illustration indicates " +
          item.illustrationValue +
          "."
        );
      })
      .join("\n");

    return (
      "Please confirm the intended policy design for the following items:\n\n" +
      mismatchLines
    );
  }

  function validateIllustration() {
    const matches = [];
    const mismatches = [];
    const incomplete = [];

    comparisonItems.forEach(function (item) {
      const row = document.querySelector(`[data-comparison-key="${item.key}"]`);

      if (!row) {
        return;
      }

      const partOneInput = row.querySelector(".part-one-comparison-value");

      const illustrationInput = row.querySelector(
        ".illustration-comparison-value",
      );

      const result = row.querySelector(".comparison-result");

      const partOneValue = partOneInput ? partOneInput.value.trim() : "";

      const illustrationValue = illustrationInput
        ? illustrationInput.value.trim()
        : "";

      row.classList.remove("row-match", "row-mismatch", "row-incomplete");

      if (!partOneValue && !illustrationValue) {
        if (result) {
          result.className = "comparison-result not-applicable";

          result.textContent = "Not Reviewed";
        }

        return;
      }

      if (!partOneValue || !illustrationValue) {
        incomplete.push({
          label: item.label,
          partOneValue: partOneValue,
          illustrationValue: illustrationValue,
        });

        row.classList.add("row-incomplete");

        if (result) {
          result.className = "comparison-result pending";

          result.textContent = "Incomplete";
        }

        return;
      }

      if (valuesMatch(partOneValue, illustrationValue)) {
        matches.push({
          label: item.label,
          partOneValue: partOneValue,
          illustrationValue: illustrationValue,
        });

        row.classList.add("row-match");

        if (result) {
          result.className = "comparison-result match";

          result.textContent = "Matches";
        }

        return;
      }

      mismatches.push({
        label: item.label,
        partOneValue: partOneValue,
        illustrationValue: illustrationValue,
      });

      row.classList.add("row-mismatch");

      if (result) {
        result.className = "comparison-result mismatch";

        result.textContent = "Does Not Match";
      }
    });

    updateValidationSummary(matches, mismatches, incomplete);
  }

  function updateValidationSummary(matches, mismatches, incomplete) {
    const resultSection = document.getElementById(
      "illustrationValidationResult",
    );

    const title = document.getElementById("illustrationValidationTitle");

    const count = document.getElementById("illustrationMatchCount");

    const details = document.getElementById("illustrationValidationDetails");

    const requirementSection = document.getElementById(
      "illustrationMismatchRequirementSection",
    );

    const requirementOutput = document.getElementById(
      "illustrationMismatchRequirement",
    );

    const reviewedCount = matches.length + mismatches.length;

    if (count) {
      count.textContent =
        reviewedCount + " reviewed, " + incomplete.length + " incomplete";
    }

    if (mismatches.length > 0) {
      setValidationBadge(
        "validation-mismatch",
        mismatches.length + " Mismatch",
      );

      if (resultSection) {
        resultSection.className =
          "illustration-validation-result " + "validation-result-mismatch";
      }

      if (title) {
        title.textContent = "The illustration does not match the Part 1.";
      }
    } else if (incomplete.length > 0) {
      setValidationBadge("validation-incomplete", "Incomplete");

      if (resultSection) {
        resultSection.className =
          "illustration-validation-result " + "validation-result-incomplete";
      }

      if (title) {
        title.textContent =
          "Additional information is needed to complete validation.";
      }
    } else if (matches.length > 0) {
      setValidationBadge("validation-match", "Matches");

      if (resultSection) {
        resultSection.className =
          "illustration-validation-result " + "validation-result-match";
      }

      if (title) {
        title.textContent =
          "The illustration matches the Part 1 as applied for.";
      }
    } else {
      setValidationBadge("validation-not-started", "Not Started");

      if (resultSection) {
        resultSection.className =
          "illustration-validation-result validation-neutral";
      }

      if (title) {
        title.textContent = "Enter the Part 1 and illustration values.";
      }
    }

    const detailItems = [];

    matches.forEach(function (item) {
      detailItems.push(`
        <li class="validation-detail-item match">
          <strong>${item.label}:</strong>
          Matches at ${item.partOneValue}.
        </li>
      `);
    });

    mismatches.forEach(function (item) {
      detailItems.push(`
        <li class="validation-detail-item mismatch">
          <strong>${item.label}:</strong>
          Part 1 shows ${item.partOneValue};
          illustration shows ${item.illustrationValue}.
        </li>
      `);
    });

    incomplete.forEach(function (item) {
      detailItems.push(`
        <li class="validation-detail-item incomplete">
          <strong>${item.label}:</strong>
          A value is missing from the Part 1 or illustration.
        </li>
      `);
    });

    if (details) {
      details.innerHTML = detailItems.length
        ? `<ul class="validation-detail-list">
             ${detailItems.join("")}
           </ul>`
        : "";
    }

    if (requirementSection) {
      requirementSection.hidden = mismatches.length === 0;
    }

    if (requirementOutput) {
      requirementOutput.value = buildRequirement(mismatches);
    }
  }

  function clearValidation() {
    document
      .querySelectorAll(
        ".part-one-comparison-value, " + ".illustration-comparison-value",
      )
      .forEach(function (input) {
        input.value = "";
      });

    document
      .querySelectorAll(".illustration-comparison-row")
      .forEach(function (row) {
        row.classList.remove("row-match", "row-mismatch", "row-incomplete");

        const result = row.querySelector(".comparison-result");

        if (result) {
          result.className = "comparison-result pending";

          result.textContent = "Not Reviewed";
        }
      });

    updateValidationSummary([], [], []);
  }

  function initializeIllustrationValidation() {
    createComparisonRows();

    document
      .getElementById("validateIllustration")
      ?.addEventListener("click", validateIllustration);

    document
      .getElementById("clearIllustrationValidation")
      ?.addEventListener("click", clearValidation);

    document
      .getElementById("copyIllustrationMismatchRequirement")
      ?.addEventListener("click", function () {
        const output = document.getElementById(
          "illustrationMismatchRequirement",
        );

        const status = document.getElementById(
          "illustrationMismatchCopyStatus",
        );

        if (!output || !output.value.trim()) {
          return;
        }

        navigator.clipboard.writeText(output.value);

        if (status) {
          status.textContent = "✓ Requirement copied";

          window.setTimeout(function () {
            status.textContent = "";
          }, 2000);
        }
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeIllustrationValidation,
      {
        once: true,
      },
    );
  } else {
    initializeIllustrationValidation();
  }
})();
