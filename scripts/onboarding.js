document.addEventListener("DOMContentLoaded", function () {
  console.log("Onboarding loaded");
  const caseProfile = {
    product: null,
    state: null,
    bot: null,
    replacement: null,
    insured: null,
  };
  /* * Main onboarding elements */ const quickStartButton =
    document.getElementById("quickStartButton");
  const quickStartModal = document.getElementById("quickStartModal");
  const launchQuickStart = document.getElementById("launchQuickStart");
  const closeQuickStart = document.getElementById("closeQuickStart");
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
  const skipToWorkbench = document.getElementById("skipToWorkbench");
  const returnToSetup = document.getElementById("returnToSetup");
  /* * General utility functions */ function hideElement(element) {
    if (element) {
      element.hidden = true;
    }
  }
  function showElement(element) {
    if (element) {
      element.hidden = false;
    }
  }
  function setHiddenValue(elementId, value) {
    const field = document.getElementById(elementId);
    if (field) {
      field.value = value || "";
    }
  }
  function setText(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value || "";
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
  function scrollToElement(element, offset) {
    if (!element) {
      return;
    }
    const destination =
      element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, destination), behavior: "smooth" });
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
  /* * Progress indicator */ function updateProgress(step) {
    const fill = document.getElementById("wizardProgressFill");
    const label = document.getElementById("wizardProgressLabel");
    const percentLabel = document.getElementById("wizardProgressPercent");
    const normalizedStep = Math.min(5, Math.max(1, step));
    const percentages = { 1: 20, 2: 40, 3: 60, 4: 80, 5: 100 };
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
  /* * State display helper */ function getSelectedStateName() {
    if (
      !stateDropdown ||
      stateDropdown.selectedIndex < 0 ||
      !stateDropdown.value
    ) {
      return caseProfile.state || "";
    }
    const selectedOption = stateDropdown.options[stateDropdown.selectedIndex];
    return selectedOption
      ? selectedOption.textContent.trim()
      : caseProfile.state || "";
  }
  /* * Label helpers */ function getProductLabel() {
    const labels = { perm: "Permanent", term: "Term" };
    return labels[caseProfile.product] || "Not selected";
  }
  function getBotLabel() {
    const labels = { yes: "Yes", no: "No" };
    return labels[caseProfile.bot] || "Not selected";
  }
  function getReplacementLabel() {
    const labels = {
      none: "No Replacement",
      internal: "Internal Replacement",
      external: "External Replacement",
    };
    return labels[caseProfile.replacement] || "Not selected";
  }
  function getInsuredLabel() {
    const labels = { single: "Single", joint: "Joint" };
    return labels[caseProfile.insured] || "Not selected";
  }
  function getStateLabel() {
    return getSelectedStateName() || caseProfile.state || "Not selected";
  }
  /* * Small answer summary displayed in the wizard */ function renderProgressAnswers() {
    const summary = document.getElementById("wizardAnswerSummary");
    if (!summary) {
      return;
    }
    const answers = [];
    if (caseProfile.product) {
      answers.push(getProductLabel());
    }
    if (caseProfile.state) {
      answers.push(getStateLabel());
    }
    if (caseProfile.bot) {
      answers.push("BOT: " + getBotLabel());
    }
    if (caseProfile.replacement) {
      answers.push(getReplacementLabel());
    }
    if (caseProfile.insured) {
      answers.push(getInsuredLabel());
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
  /* * Completed qualification summary */ function buildSummary() {
    const summaryContainer = document.getElementById(
      "qualificationSummaryContent",
    );
    if (!summaryContainer) {
      console.warn(
        'Element with id "qualificationSummaryContent" was not found.',
      );
      return;
    }
    const items = [
      { label: "Product", value: getProductLabel() },
      { label: "State", value: getStateLabel() },
      { label: "BOT", value: getBotLabel() },
      { label: "Replacement", value: getReplacementLabel() },
      { label: "Insured", value: getInsuredLabel() },
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
    if (qualificationSummary) {
      qualificationSummary.hidden = false;
    }
  }
  /* * Populate values displayed inside the workbench. * * This supports two HTML approaches: * * 1. Elements with these optional IDs: * workbenchProduct * workbenchState * workbenchBOT * workbenchReplacement * workbenchInsured * * 2. Elements with data-profile-field attributes: * data-profile-field="product" * data-profile-field="state" * data-profile-field="bot" * data-profile-field="replacement" * data-profile-field="insured" */ function populateWorkbenchProfile() {
    const profileValues = {
      product: getProductLabel(),
      state: getStateLabel(),
      bot: getBotLabel(),
      replacement: getReplacementLabel(),
      insured: getInsuredLabel(),
    };
    /* * Populate optional ID-based fields. * These calls safely do nothing if an element does not exist. */ setText(
      "workbenchProduct",
      profileValues.product,
    );
    setText("workbenchState", profileValues.state);
    setText("workbenchBOT", profileValues.bot);
    setText("workbenchReplacement", profileValues.replacement);
    setText("workbenchInsured", profileValues.insured);
    /* * Populate data-attribute-based fields. */ document
      .querySelectorAll("[data-profile-field]")
      .forEach(function (element) {
        const fieldName = element.dataset.profileField;
        if (Object.prototype.hasOwnProperty.call(profileValues, fieldName)) {
          element.textContent = profileValues[fieldName];
        }
      });
    /* * Optional single-line workbench summary. */ const workbenchProfileSummary =
      document.getElementById("workbenchProfileSummary");
    if (workbenchProfileSummary) {
      workbenchProfileSummary.textContent = [
        profileValues.product,
        profileValues.state,
        "BOT: " + profileValues.bot,
        profileValues.replacement,
        profileValues.insured,
      ].join(" • ");
    }
  }
  /* * Central workbench-opening function. * * This function was missing from the original script and caused: * * ReferenceError: openWorkbench is not defined */ function openWorkbench(
    options,
  ) {
    const settings = Object.assign(
      { hideQuestions: true, smoothScroll: true },
      options || {},
    );
    if (!reviewWorkbench) {
      console.error(
        'Cannot open the workbench because an element with id "reviewWorkbench" was not found.',
      );
      return;
    }
    /* * Close Quick Start if it is currently open. */ if (quickStartModal) {
      quickStartModal.hidden = true;
    }
    /* * Hide completed-wizard sections. */ if (qualificationComplete) {
      qualificationComplete.hidden = true;
      qualificationComplete.classList.remove("is-launching");
    }
    if (qualificationSummary) {
      qualificationSummary.hidden = true;
      qualificationSummary.classList.remove("is-launching");
    }
    /* * Quick Start and the normal launch button hide the questions. * The skip link may leave the setup questions available. */ if (
      qualificationFlow &&
      settings.hideQuestions
    ) {
      qualificationFlow.hidden = true;
    }
    /* * Transfer selected values to the workspace. */ populateWorkbenchProfile();
    /* * Display and animate the workbench. */ reviewWorkbench.hidden = false;
    reviewWorkbench.classList.add("workbench-opening");
    document.body.classList.add("workbench-open");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        reviewWorkbench.classList.add("workbench-visible");
        document.body.classList.remove("workspace-launching");
      });
    });
    /* * Move the viewport to the workbench. */ reviewWorkbench.scrollIntoView({
      behavior: settings.smoothScroll ? "smooth" : "auto",
      block: "start",
    });
  }
  /* * Return from the workbench to onboarding. */ function returnToOnboarding() {
    if (reviewWorkbench) {
      reviewWorkbench.classList.remove(
        "workbench-opening",
        "workbench-visible",
      );
      reviewWorkbench.hidden = true;
    }
    document.body.classList.remove("workbench-open", "workspace-launching");
    if (qualificationFlow) {
      qualificationFlow.hidden = false;
    }
    if (launchWorkbench) {
      launchWorkbench.textContent = "Launch Workspace";
      launchWorkbench.disabled = false;
    }
    const firstMissingSection = !caseProfile.product
      ? document.getElementById("questionProduct")
      : !caseProfile.state
        ? questionState
        : !caseProfile.bot
          ? questionBot
          : !caseProfile.replacement
            ? questionReplacement
            : !caseProfile.insured
              ? questionInsured
              : qualificationSummary;
    if (firstMissingSection) {
      firstMissingSection.hidden = false;
      firstMissingSection.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }
  /* * Initial screen state */ hideElement(questionState);
  hideElement(questionBot);
  hideElement(questionReplacement);
  hideElement(questionInsured);
  hideElement(qualificationComplete);
  hideElement(qualificationSummary);
  hideElement(reviewWorkbench);
  /* * Skip directly to workbench */ if (skipToWorkbench) {
    skipToWorkbench.addEventListener("click", function () {
      openWorkbench({ hideQuestions: false, smoothScroll: true });
    });
  }
  /* * Return to setup */ if (returnToSetup) {
    returnToSetup.addEventListener("click", function () {
      returnToOnboarding();
    });
  }
  /* * Open Quick Start modal */ if (quickStartButton && quickStartModal) {
    quickStartButton.addEventListener("click", function () {
      quickStartModal.hidden = false;
    });
  }
  /* * Close Quick Start modal */ if (closeQuickStart && quickStartModal) {
    closeQuickStart.addEventListener("click", function () {
      quickStartModal.hidden = true;
    });
  }
  /* * Close Quick Start when Escape is pressed */ document.addEventListener(
    "keydown",
    function (event) {
      if (
        event.key === "Escape" &&
        quickStartModal &&
        !quickStartModal.hidden
      ) {
        quickStartModal.hidden = true;
      }
    },
  );
  /* * Launch Quick Start selections */ if (launchQuickStart) {
    launchQuickStart.addEventListener("click", function () {
      const quickProduct = document.getElementById("qsProduct");
      const quickState = document.getElementById("qsState");
      const quickBOT = document.getElementById("qsBOT");
      const quickReplacement = document.getElementById("qsReplacement");
      const quickInsured = document.getElementById("qsInsured");
      if (
        !quickProduct ||
        !quickState ||
        !quickBOT ||
        !quickReplacement ||
        !quickInsured
      ) {
        console.error("One or more Quick Start fields are missing.", {
          qsProduct: Boolean(quickProduct),
          qsState: Boolean(quickState),
          qsBOT: Boolean(quickBOT),
          qsReplacement: Boolean(quickReplacement),
          qsInsured: Boolean(quickInsured),
        });
        return;
      }
      if (!quickState.value) {
        quickState.focus();
        alert("Please select a Contract State.");
        return;
      }
      caseProfile.product = quickProduct.value;
      caseProfile.state = quickState.value;
      caseProfile.bot = quickBOT.value;
      caseProfile.replacement = quickReplacement.value;
      caseProfile.insured = quickInsured.value;
      setHiddenValue("selectedProduct", caseProfile.product);
      setHiddenValue("selectedState", caseProfile.state);
      setHiddenValue("selectedBOT", caseProfile.bot);
      setHiddenValue("selectedReplacement", caseProfile.replacement);
      setHiddenValue("selectedInsuredType", caseProfile.insured);
      /* * Keep the onboarding state dropdown synchronized with * the Quick Start state. */ if (
        stateDropdown
      ) {
        stateDropdown.value = caseProfile.state;
      }
      renderProgressAnswers();
      if (quickStartModal) {
        quickStartModal.hidden = true;
      }
      openWorkbench({ hideQuestions: true, smoothScroll: true });
    });
  }
  /* * Product question */ document
    .querySelectorAll("[data-product]")
    .forEach(function (button) {
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
  /* State question */

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
  /* * BOT question */ document
    .querySelectorAll("[data-bot]")
    .forEach(function (button) {
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
  /* * Replacement question */ document
    .querySelectorAll("[data-replacement]")
    .forEach(function (button) {
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
  /* * Insured question */ document
    .querySelectorAll("[data-insured]")
    .forEach(function (button) {
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", function () {
        caseProfile.insured = button.dataset.insured;
        setHiddenValue("selectedInsuredType", caseProfile.insured);
        selectOption(button, "[data-insured]");
        renderProgressAnswers();
        const progressWrapper = document.getElementById(
          "wizardProgressWrapper",
        );
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
  /* * Normal Launch Workspace button */ if (
    launchWorkbench &&
    qualificationComplete &&
    reviewWorkbench
  ) {
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
        openWorkbench({ hideQuestions: true, smoothScroll: false });
      }, 900);
      configureReplacementReview();
    });
  }
  /* * Initial values */ updateProgress(1);
  renderProgressAnswers();
});
function configureReplacementReview() {
  const replacementReview = document.getElementById("replacementReviewSection");

  const internalSection = document.getElementById("internalReplacementSection");

  const externalSection = document.getElementById("externalReplacementSection");

  if (!replacementReview) {
    return;
  }

  replacementReview.hidden = caseProfile.replacement === "none";

  if (internalSection) {
    internalSection.hidden = caseProfile.replacement !== "internal";
  }

  if (externalSection) {
    externalSection.hidden = caseProfile.replacement !== "external";
  }
}
if (caseProfile.state === "NY") {
  document.getElementById("nyReviewDashboard").hidden = false;
}
``;
function updateNYReplacementStatus() {
  const status = document.getElementById("nyReplacementStatus");

  const type = document.getElementById("nyReplacementType");

  if (caseProfile.replacement === "none") {
    status.textContent = "No Replacement Identified";

    type.textContent = "N/A";
  }

  if (caseProfile.replacement === "internal") {
    status.textContent = "Replacement Identified";

    type.textContent = "Internal";
  }

  if (caseProfile.replacement === "external") {
    status.textContent = "Replacement Identified";

    type.textContent = "External";
  }
}
