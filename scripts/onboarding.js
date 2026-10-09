document.addEventListener("DOMContentLoaded", function () {
  console.log("Onboarding loaded");

  const caseProfile = {
    product: null,
    state: null,
    bot: null,
    replacement: null,
    insured: null,
  };

  const questionState = document.getElementById("questionState");

  const questionBot = document.getElementById("questionBot");

  const questionReplacement = document.getElementById("questionReplacement");

  const questionInsured = document.getElementById("questionInsured");

  const qualificationComplete = document.getElementById(
    "qualificationComplete",
  );

  const qualificationSummary = document.getElementById("qualificationSummary");

  const reviewWorkbench = document.getElementById("reviewWorkbench");

  const launchWorkbench = document.getElementById("launchWorkbench");

  const stateDropdown = document.getElementById("contractState");

  const qualificationFlow = document.getElementById("qualificationFlow");

  hideElement(questionState);
  hideElement(questionBot);
  hideElement(questionReplacement);
  hideElement(questionInsured);
  hideElement(qualificationComplete);
  hideElement(qualificationSummary);
  hideElement(reviewWorkbench);

  function hideElement(element) {
    if (element) {
      element.hidden = true;
    }
  }

  function setHiddenValue(elementId, value) {
    const field = document.getElementById(elementId);

    if (field) {
      field.value = value;
    }
  }

  function setText(elementId, value) {
    const element = document.getElementById(elementId);

    if (element) {
      element.textContent = value;
    }
  }

  function selectOption(button, selector) {
    document.querySelectorAll(selector).forEach(function (option) {
      option.classList.remove("selected");

      option.setAttribute("aria-pressed", "false");
    });

    button.classList.add("selected");

    button.setAttribute("aria-pressed", "true");
  }

  function updateProgress(step) {
    const fill = document.getElementById("wizardProgressFill");

    const label = document.getElementById("wizardProgressLabel");

    const percentLabel = document.getElementById("wizardProgressPercent");

    const normalizedStep = Math.min(5, Math.max(1, step));

    const percentages = {
      1: 20,
      2: 40,
      3: 60,
      4: 80,
      5: 100,
    };

    const percent = percentages[normalizedStep];

    if (fill) {
      fill.style.width = percent + "%";
    }

    if (label) {
      label.textContent = "Question " + normalizedStep + " of 5";
    }

    if (percentLabel) {
      percentLabel.textContent = percent + "%";
    }
  }

  function renderProgressAnswers() {
    const summary = document.getElementById("wizardAnswerSummary");

    if (!summary) {
      return;
    }

    const answers = [];

    if (caseProfile.product) {
      answers.push(caseProfile.product === "perm" ? "Permanent" : "Term");
    }

    if (caseProfile.state) {
      answers.push(caseProfile.state);
    }

    if (caseProfile.bot) {
      answers.push("BOT: " + (caseProfile.bot === "yes" ? "Yes" : "No"));
    }

    if (caseProfile.replacement) {
      const replacementLabels = {
        none: "No Replacement",
        internal: "Internal",
        external: "External",
      };

      answers.push(replacementLabels[caseProfile.replacement]);
    }

    if (caseProfile.insured) {
      answers.push(caseProfile.insured === "single" ? "Single" : "Joint");
    }

    summary.textContent = "";

    if (answers.length === 0) {
      const emptyMessage = document.createElement("span");

      emptyMessage.className = "wizard-answer-empty";

      emptyMessage.textContent = "Your selections will appear here.";

      summary.appendChild(emptyMessage);

      return;
    }

    const answerText = document.createElement("span");

    answerText.className = "wizard-answer-inline";

    answerText.textContent = answers.join(" • ");

    summary.appendChild(answerText);
  }

  function revealSection(section) {
    if (!section) {
      return;
    }

    section.hidden = false;

    requestAnimationFrame(function () {
      section.classList.add("in-view");
    });

    window.setTimeout(function () {
      scrollToElement(section, 95);
    }, 150);
  }

  function scrollToElement(element, offset) {
    if (!element) {
      return;
    }

    const destination =
      element.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({
      top: destination,
      behavior: "smooth",
    });
  }

  function getSelectedStateName() {
    if (!stateDropdown || stateDropdown.selectedIndex < 0) {
      return caseProfile.state || "";
    }

    return stateDropdown.options[
      stateDropdown.selectedIndex
    ].textContent.trim();
  }

  function buildSummary() {
    const summaryContainer = document.getElementById(
      "qualificationSummaryContent",
    );

    if (!summaryContainer) {
      return;
    }

    const productLabels = {
      perm: "Permanent",
      term: "Term",
    };

    const botLabels = {
      yes: "Yes",
      no: "No",
    };

    const replacementLabels = {
      none: "No Replacement",
      internal: "Internal Replacement",
      external: "External Replacement",
    };

    const insuredLabels = {
      single: "Single",
      joint: "Joint",
    };

    const items = [
      {
        label: "Product",
        value: productLabels[caseProfile.product] || "Not selected",
      },
      {
        label: "State",
        value: getSelectedStateName() || "Not selected",
      },
      {
        label: "BOT",
        value: botLabels[caseProfile.bot] || "Not selected",
      },
      {
        label: "Replacement",
        value: replacementLabels[caseProfile.replacement] || "Not selected",
      },
      {
        label: "Insured",
        value: insuredLabels[caseProfile.insured] || "Not selected",
      },
    ];

    summaryContainer.textContent = "";

    items.forEach(function (item) {
      const container = document.createElement("div");

      const label = document.createElement("strong");

      const value = document.createElement("span");

      container.className = "profile-summary-item";

      label.textContent = item.label;
      value.textContent = item.value;

      container.appendChild(label);
      container.appendChild(value);

      summaryContainer.appendChild(container);
    });

    qualificationSummary.hidden = false;
  }

  function populateWorkbenchProfile() {
    const productLabels = {
      perm: "Permanent",
      term: "Term",
    };

    const botLabels = {
      yes: "Yes",
      no: "No",
    };

    const replacementLabels = {
      none: "No Replacement",
      internal: "Internal Replacement",
      external: "External Replacement",
    };

    const insuredLabels = {
      single: "Single",
      joint: "Joint",
    };

    setText(
      "profileProduct",
      productLabels[caseProfile.product] || "Not selected",
    );

    setText("profileState", getSelectedStateName() || "Not selected");

    setText("profileBOT", botLabels[caseProfile.bot] || "Not selected");

    setText(
      "profileReplacement",
      replacementLabels[caseProfile.replacement] || "Not selected",
    );

    setText(
      "profileInsured",
      insuredLabels[caseProfile.insured] || "Not selected",
    );

    setText("dashboardState", caseProfile.state || "--");

    setText("caseProfileStatus", "Ready");

    window.initialReviewCaseProfile = {
      product: caseProfile.product,
      state: caseProfile.state,
      bot: caseProfile.bot,
      replacement: caseProfile.replacement,
      insured: caseProfile.insured,
    };

    document.dispatchEvent(
      new CustomEvent("initialReviewProfileReady", {
        detail: window.initialReviewCaseProfile,
      }),
    );
  }

  document.querySelectorAll("[data-product]").forEach(function (button) {
    button.setAttribute("aria-pressed", "false");

    button.addEventListener("click", function () {
      caseProfile.product = button.dataset.product;

      setHiddenValue("selectedProduct", caseProfile.product);

      selectOption(button, "[data-product]");

      renderProgressAnswers();
      updateProgress(2);
      revealSection(questionState);
    });
  });

  if (stateDropdown) {
    stateDropdown.addEventListener("change", function () {
      if (!stateDropdown.value) {
        return;
      }

      caseProfile.state = stateDropdown.value;

      setHiddenValue("selectedState", caseProfile.state);

      renderProgressAnswers();
      updateProgress(3);
      revealSection(questionBot);
    });
  }

  document.querySelectorAll("[data-bot]").forEach(function (button) {
    button.setAttribute("aria-pressed", "false");

    button.addEventListener("click", function () {
      caseProfile.bot = button.dataset.bot;

      setHiddenValue("selectedBOT", caseProfile.bot);

      selectOption(button, "[data-bot]");

      renderProgressAnswers();
      updateProgress(4);

      revealSection(questionReplacement);
    });
  });

  document.querySelectorAll("[data-replacement]").forEach(function (button) {
    button.setAttribute("aria-pressed", "false");

    button.addEventListener("click", function () {
      caseProfile.replacement = button.dataset.replacement;

      setHiddenValue("selectedReplacement", caseProfile.replacement);

      selectOption(button, "[data-replacement]");

      renderProgressAnswers();
      updateProgress(5);

      revealSection(questionInsured);
    });
  });

  document.querySelectorAll("[data-insured]").forEach(function (button) {
    button.setAttribute("aria-pressed", "false");

    button.addEventListener("click", function () {
      caseProfile.insured = button.dataset.insured;

      setHiddenValue("selectedInsuredType", caseProfile.insured);

      selectOption(button, "[data-insured]");

      renderProgressAnswers();

      const progressWrapper = document.getElementById("wizardProgressWrapper");

      if (progressWrapper) {
        progressWrapper.classList.add("fade-out");

        window.setTimeout(function () {
          progressWrapper.style.display = "none";
        }, 400);
      }

      buildSummary();

      if (qualificationComplete) {
        qualificationComplete.hidden = false;

        requestAnimationFrame(function () {
          qualificationComplete.classList.add("in-view");
        });
      }

      window.setTimeout(function () {
        if (qualificationSummary) {
          scrollToElement(qualificationSummary, 95);
        }
      }, 450);
    });
  });

  if (launchWorkbench && qualificationComplete && reviewWorkbench) {
    launchWorkbench.addEventListener("click", function () {
      const button = this;

      button.textContent = "Launching Workspace...";

      button.disabled = true;

      document.body.classList.add("workspace-launching");

      qualificationComplete.classList.add("is-launching");

      if (qualificationSummary) {
        qualificationSummary.classList.add("is-launching");
      }

      window.setTimeout(function () {
        qualificationComplete.hidden = true;

        if (qualificationSummary) {
          qualificationSummary.hidden = true;
        }

        if (qualificationFlow) {
          qualificationFlow.hidden = true;
        }

        populateWorkbenchProfile();

        reviewWorkbench.hidden = false;

        reviewWorkbench.classList.add("workbench-opening");

        reviewWorkbench.scrollIntoView({
          behavior: "auto",
          block: "start",
        });

        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            reviewWorkbench.classList.add("workbench-visible");

            document.body.classList.remove("workspace-launching");
          });
        });
      }, 900);
    });
  }

  updateProgress(1);
  renderProgressAnswers();
});
