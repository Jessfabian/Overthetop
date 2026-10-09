document.addEventListener("DOMContentLoaded", function () {
  console.log("Onboarding loaded");
  const caseProfile = {
    product: null,
    state: null,
    bot: null,
    replacement: null,
    insured: null,
  };
  window.caseProfile = caseProfile;
  let quickStartIsLaunching = false;
  const welcomeHero = document.getElementById("welcomeHero");
  const quickStartButton = document.getElementById("quickStartButton");
  const quickStartModal = document.getElementById("quickStartModal");
  const launchQuickStart = document.getElementById("launchQuickStart");
  const closeQuickStart = document.getElementById("closeQuickStart");
  const questionProduct = document.getElementById("questionProduct");
  const questionState = document.getElementById("questionState");
  const questionBot = document.getElementById("questionBot");
  const questionReplacement = document.getElementById("questionReplacement");
  const questionInsured = document.getElementById("questionInsured");
  const qualificationFlow = document.getElementById("qualificationFlow");
  const qualificationSummary = document.getElementById("qualificationSummary");
  const qualificationComplete = document.getElementById(
    "qualificationComplete",
  );
  const reviewWorkbench = document.getElementById("reviewWorkbench");
  const launchWorkbench = document.getElementById("launchWorkbench");
  const returnToSetup = document.getElementById("returnToSetup");
  const stateDropdown = document.getElementById("contractState");
  function hideElement(element) {
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
    const element = document.getElementById(elementId);
    if (element) {
      element.value = value || "";
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
  function updateProgress(step) {
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
  function getProductLabel() {
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
  function getSelectedStateName() {
    if (
      !stateDropdown ||
      !stateDropdown.value ||
      stateDropdown.selectedIndex < 0
    ) {
      return caseProfile.state || "";
    }
    const selectedOption = stateDropdown.options[stateDropdown.selectedIndex];
    if (!selectedOption) {
      return caseProfile.state || "";
    }
    return selectedOption.textContent.trim();
  }
  function getStateLabel() {
    return getSelectedStateName() || caseProfile.state || "Not selected";
  }
  function renderProgressAnswers() {
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
    if (!answers.length) {
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
  function buildSummary() {
    const container = document.getElementById("qualificationSummaryContent");
    if (!container) {
      return;
    }
    const items = [
      { label: "Product", value: getProductLabel() },
      { label: "State", value: getStateLabel() },
      { label: "BOT", value: getBotLabel() },
      { label: "Replacement", value: getReplacementLabel() },
      { label: "Insured", value: getInsuredLabel() },
    ];
    container.textContent = "";
    items.forEach(function (item) {
      const itemContainer = document.createElement("div");
      const label = document.createElement("strong");
      const value = document.createElement("span");
      itemContainer.className = "profile-summary-item";
      label.textContent = item.label;
      value.textContent = item.value;
      itemContainer.appendChild(label);
      itemContainer.appendChild(value);
      container.appendChild(itemContainer);
    });
    if (qualificationSummary) {
      qualificationSummary.hidden = false;
    }
  }
  function populateWorkbenchProfile() {
    const profileValues = {
      product: getProductLabel(),
      state: getStateLabel(),
      bot: getBotLabel(),
      replacement: getReplacementLabel(),
      insured: getInsuredLabel(),
    };
    setText("profileProduct", profileValues.product);
    setText("profileState", profileValues.state);
    setText("profileBOT", profileValues.bot);
    setText("profileReplacement", profileValues.replacement);
    setText("profileInsured", profileValues.insured);
    document
      .querySelectorAll("[data-profile-field]")
      .forEach(function (element) {
        const fieldName = element.dataset.profileField;
        if (Object.prototype.hasOwnProperty.call(profileValues, fieldName)) {
          element.textContent = profileValues[fieldName];
        }
      });
    const status = document.getElementById("caseProfileStatus");
    if (status) {
      const complete = Boolean(
        caseProfile.product &&
        caseProfile.state &&
        caseProfile.bot &&
        caseProfile.replacement &&
        caseProfile.insured,
      );
      status.textContent = complete ? "Ready" : "Incomplete";
      status.classList.toggle("is-ready", complete);
      status.classList.toggle("is-incomplete", !complete);
    }
  }
  function configureNewYorkDashboard() {
    const nyDashboard = document.getElementById("nyReviewDashboard");
    const botReview = document.getElementById("botReviewSection");
    if (nyDashboard) {
      nyDashboard.hidden = caseProfile.state !== "NY";
    }
    if (botReview) {
      botReview.hidden = caseProfile.bot !== "yes";
    }
  }
  function configureReplacementWorkflow() {
    const internalSection = document.getElementById(
      "internalReplacementSection",
    );
    const externalSection = document.getElementById(
      "externalReplacementSection",
    );
    const statusRadios = document.querySelectorAll(
      'input[name="reviewReplacementStatus"]',
    );
    if (internalSection) {
      internalSection.hidden = caseProfile.replacement !== "internal";
    }
    if (externalSection) {
      externalSection.hidden = caseProfile.replacement !== "external";
    }
    statusRadios.forEach(function (radio) {
      radio.checked = radio.value === caseProfile.replacement;
    });
  }
  function updateNYReplacementStatus() {
    const status = document.getElementById("nyReplacementStatus");
    const type = document.getElementById("nyReplacementType");
    if (!status || !type) {
      return;
    }
    if (caseProfile.replacement === "internal") {
      status.textContent = "Replacement Identified";
      type.textContent = "Internal";
      return;
    }
    if (caseProfile.replacement === "external") {
      status.textContent = "Replacement Identified";
      type.textContent = "External";
      return;
    }
    status.textContent = "No Replacement Identified";
    type.textContent = "N/A";
  }
  function synchronizeWorkbench() {
    populateWorkbenchProfile();
    configureNewYorkDashboard();
    configureReplacementWorkflow();
    updateNYReplacementStatus();
  }
  function openWorkbench(options) {
    const settings = Object.assign(
      { hideQuestions: true, smoothScroll: true },
      options || {},
    );
    if (!reviewWorkbench) {
      console.error("The review workbench was not found.");
      return;
    }
    if (quickStartModal) {
      quickStartModal.hidden = true;
    }
    if (welcomeHero) {
      welcomeHero.hidden = true;
    }
    if (quickStartButton) {
      quickStartButton.hidden = true;
    }
    if (qualificationComplete) {
      qualificationComplete.hidden = true;
      qualificationComplete.classList.remove("is-launching", "in-view");
    }
    if (qualificationSummary) {
      qualificationSummary.hidden = true;
      qualificationSummary.classList.remove("is-launching");
    }
    if (qualificationFlow && settings.hideQuestions) {
      qualificationFlow.hidden = true;
    }
    synchronizeWorkbench();
    reviewWorkbench.hidden = false;
    reviewWorkbench.classList.add("workbench-opening");
    document.body.classList.add("workbench-open");
    requestAnimationFrame(function () {
      reviewWorkbench.classList.add("workbench-visible");
      document.body.classList.remove("workspace-launching");
      requestAnimationFrame(function () {
        reviewWorkbench.scrollIntoView({
          behavior: settings.smoothScroll ? "smooth" : "auto",
          block: "start",
        });
      });
    });
  }
  function returnToOnboarding() {
    if (reviewWorkbench) {
      reviewWorkbench.classList.remove(
        "workbench-opening",
        "workbench-visible",
      );
      reviewWorkbench.hidden = true;
    }
    document.body.classList.remove("workbench-open", "workspace-launching");
    if (welcomeHero) {
      welcomeHero.hidden = false;
    }
    if (quickStartButton) {
      quickStartButton.hidden = false;
    }
    if (qualificationFlow) {
      qualificationFlow.hidden = false;
    }
    if (launchWorkbench) {
      launchWorkbench.textContent = "Begin Review";
      launchWorkbench.disabled = false;
    }
    let firstMissingSection = qualificationSummary;
    if (!caseProfile.product) {
      firstMissingSection = questionProduct;
    } else if (!caseProfile.state) {
      firstMissingSection = questionState;
    } else if (!caseProfile.bot) {
      firstMissingSection = questionBot;
    } else if (!caseProfile.replacement) {
      firstMissingSection = questionReplacement;
    } else if (!caseProfile.insured) {
      firstMissingSection = questionInsured;
    } else {
      if (qualificationSummary) {
        qualificationSummary.hidden = false;
      }
      if (qualificationComplete) {
        qualificationComplete.hidden = false;
      }
    }
    if (firstMissingSection) {
      firstMissingSection.hidden = false;
      firstMissingSection.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }
  hideElement(questionState);
  hideElement(questionBot);
  hideElement(questionReplacement);
  hideElement(questionInsured);
  hideElement(qualificationComplete);
  hideElement(qualificationSummary);
  hideElement(reviewWorkbench);
  updateProgress(1);
  renderProgressAnswers();
  if (quickStartButton && quickStartModal) {
    quickStartButton.addEventListener("click", function () {
      quickStartModal.hidden = false;
    });
  }
  if (closeQuickStart && quickStartModal) {
    closeQuickStart.addEventListener("click", function () {
      quickStartModal.hidden = true;
    });
  }
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && quickStartModal && !quickStartModal.hidden) {
      quickStartModal.hidden = true;
    }
  });
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
        caseProfile.state = null;
        setHiddenValue("selectedState", "");
        renderProgressAnswers();
        return;
      }
      caseProfile.state = stateDropdown.value;
      setHiddenValue("selectedState", caseProfile.state);
      renderProgressAnswers();
      configureNewYorkDashboard();
      if (!quickStartIsLaunching) {
        updateProgress(3);
        revealSection(questionBot);
      }
    });
  }
  document.querySelectorAll("[data-bot]").forEach(function (button) {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", function () {
      caseProfile.bot = button.dataset.bot;
      setHiddenValue("selectedBOT", caseProfile.bot);
      selectOption(button, "[data-bot]");
      renderProgressAnswers();
      configureNewYorkDashboard();
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
      configureReplacementWorkflow();
      updateNYReplacementStatus();
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
  document
    .querySelectorAll('input[name="reviewReplacementStatus"]')
    .forEach(function (radio) {
      radio.addEventListener("change", function () {
        if (!this.checked) {
          return;
        }
        caseProfile.replacement = this.value;
        setHiddenValue("selectedReplacement", caseProfile.replacement);
        renderProgressAnswers();
        populateWorkbenchProfile();
        configureReplacementWorkflow();
        updateNYReplacementStatus();
        if (stateDropdown && stateDropdown.value) {
          stateDropdown.dispatchEvent(
            new CustomEvent("caseProfileUpdated", { bubbles: true }),
          );
        }
      });
    });
  if (launchQuickStart) {
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
        console.error("One or more Quick Start fields are missing.");
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
      quickStartIsLaunching = true;
      try {
        if (stateDropdown) {
          stateDropdown.value = caseProfile.state;
          stateDropdown.dispatchEvent(new Event("change", { bubbles: true }));
        }
      } finally {
        quickStartIsLaunching = false;
      }
      renderProgressAnswers();
      synchronizeWorkbench();
      if (quickStartModal) {
        quickStartModal.hidden = true;
      }
      openWorkbench({ hideQuestions: true, smoothScroll: false });
    });
  }
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
      synchronizeWorkbench();
      window.setTimeout(function () {
        openWorkbench({ hideQuestions: true, smoothScroll: false });
      }, 900);
    });
  }
  if (returnToSetup) {
    returnToSetup.addEventListener("click", function () {
      returnToOnboarding();
    });
  }
});
