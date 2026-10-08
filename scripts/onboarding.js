document.addEventListener("DOMContentLoaded", () => {
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

  /*
   * INITIAL PAGE STATE
   * Ensures only Question 1 is visible on load.
   */

  if (questionState) {
    questionState.hidden = true;
  }

  if (questionBot) {
    questionBot.hidden = true;
  }

  if (questionReplacement) {
    questionReplacement.hidden = true;
  }

  if (questionInsured) {
    questionInsured.hidden = true;
  }

  if (qualificationComplete) {
    qualificationComplete.hidden = true;
  }

  if (qualificationSummary) {
    qualificationSummary.hidden = true;
  }

  if (reviewWorkbench) {
    reviewWorkbench.hidden = true;
  }

  /*
   * HELPER: safely store a hidden-field value
   */

  function setHiddenValue(elementId, value) {
    const field = document.getElementById(elementId);

    if (field) {
      field.value = value;
    }
  }

  /*
   * HELPER: visually mark an option as selected
   */

  function selectOption(button, selector) {
    document.querySelectorAll(selector).forEach((option) => {
      option.classList.remove("selected");
      option.setAttribute("aria-pressed", "false");
    });

    button.classList.add("selected");

    button.setAttribute("aria-pressed", "true");
  }

  /*
   * UPDATE STICKY PROGRESS PILL
   */

  function updateProgress(step) {
    const fill = document.getElementById("wizardProgressFill");

    const label = document.getElementById("wizardProgressLabel");

    const percentLabel = document.getElementById("wizardProgressPercent");

    const normalizedStep = Math.min(5, Math.max(1, step));

    const percent = (normalizedStep / 5) * 100;

    if (fill) {
      fill.style.width = `${percent}%`;
    }

    if (label) {
      label.textContent = `Question ${normalizedStep} of 5`;
    }

    if (percentLabel) {
      percentLabel.textContent = `${Math.round(percent)}%`;
    }
  }

  /*
   * UPDATE ANSWER CHIPS
   */

  function renderProgressAnswers() {
    const summary = document.getElementById("wizardAnswerSummary");

    if (!summary) return;

    const answers = [];

    if (caseProfile.product) {
      answers.push(caseProfile.product === "perm" ? "Permanent" : "Term");
    }

    if (caseProfile.state) {
      answers.push(caseProfile.state);
    }

    if (caseProfile.bot) {
      answers.push(`BOT: ${caseProfile.bot === "yes" ? "Yes" : "No"}`);
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

    summary.innerHTML = "";

    if (answers.length === 0) {
      summary.innerHTML = `
            <span class="wizard-answer-empty">
                Your selections will appear here.
            </span>
            `;

      return;
    }

    summary.innerHTML = `
        <span class="wizard-answer-inline">
            ${answers.join(" • ")}
        </span>
        `;
  }

  /*
   * GENTLY REVEAL AND SCROLL TO NEXT SECTION
   */

  function revealSection(section) {
    if (!section) {
      return;
    }

    section.hidden = false;

    requestAnimationFrame(() => {
      section.classList.add("in-view");
    });

    window.setTimeout(() => {
      gentleScrollTo(section, 1100);
    }, 150);
  }

  /*
   * CUSTOM GENTLE SCROLL
   */

  function gentleScrollTo(element, duration) {
    const startPosition = window.scrollY;

    const targetPosition = element.getBoundingClientRect().top + window.scrollY;

    const stickyOffset = 95;

    const distance = targetPosition - stickyOffset - startPosition;

    let startTime = null;

    function easeInOutCubic(progress) {
      if (progress < 0.5) {
        return 4 * progress * progress * progress;
      }

      return 1 - Math.pow(-2 * progress + 2, 3) / 2;
    }

    function animateScroll(timestamp) {
      if (startTime === null) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime;

      const progress = Math.min(elapsed / duration, 1);

      const easedProgress = easeInOutCubic(progress);

      window.scrollTo(0, startPosition + distance * easedProgress);

      if (progress < 1) {
        window.requestAnimationFrame(animateScroll);
      }
    }

    window.requestAnimationFrame(animateScroll);
  }

  /*
   * BUILD FINAL PROFILE SUMMARY
   */

  function buildSummary() {
    const summaryContainer = document.getElementById(
      "qualificationSummaryContent",
    );

    if (!summaryContainer) {
      return;
    }

    const selectedStateName =
      stateDropdown?.options[stateDropdown.selectedIndex]?.textContent.trim() ||
      caseProfile.state ||
      "Not selected";

    const productLabel = caseProfile.product === "perm" ? "Permanent" : "Term";

    const botLabel = caseProfile.bot === "yes" ? "Yes" : "No";

    const replacementLabels = {
      none: "No Replacement",
      internal: "Internal Replacement",
      external: "External Replacement",
    };

    const insuredLabel = caseProfile.insured === "single" ? "Single" : "Joint";

    summaryContainer.innerHTML = `
      <div class="profile-summary-item">
        <strong>Product</strong>
        <span>${productLabel}</span>
      </div>

      <div class="profile-summary-item">
        <strong>State</strong>
        <span>${selectedStateName}</span>
      </div>

      <div class="profile-summary-item">
        <strong>BOT</strong>
        <span>${botLabel}</span>
      </div>

      <div class="profile-summary-item">
        <strong>Replacement</strong>
        <span>
          ${replacementLabels[caseProfile.replacement] || "Not selected"}
        </span>
      </div>

      <div class="profile-summary-item">
        <strong>Insured</strong>
        <span>${insuredLabel}</span>
      </div>
    `;

    if (qualificationSummary) {
      qualificationSummary.hidden = false;
    }
  }

  /*
   * QUESTION 1: PRODUCT
   */

  document.querySelectorAll("[data-product]").forEach((button) => {
    button.setAttribute("aria-pressed", "false");

    button.addEventListener("click", () => {
      caseProfile.product = button.dataset.product;

      setHiddenValue("selectedProduct", caseProfile.product);

      selectOption(button, "[data-product]");

      renderProgressAnswers();
      updateProgress(2);
      revealSection(questionState);
    });
  });

  /*
   * QUESTION 2: STATE
   */

  if (stateDropdown) {
    stateDropdown.addEventListener("change", () => {
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

  /*
   * QUESTION 3: BOT
   */

  document.querySelectorAll("[data-bot]").forEach((button) => {
    button.setAttribute("aria-pressed", "false");

    button.addEventListener("click", () => {
      caseProfile.bot = button.dataset.bot;

      setHiddenValue("selectedBOT", caseProfile.bot);

      selectOption(button, "[data-bot]");

      renderProgressAnswers();
      updateProgress(4);

      revealSection(questionReplacement);
    });
  });

  /*
   * QUESTION 4: REPLACEMENT
   */

  document.querySelectorAll("[data-replacement]").forEach((button) => {
    button.setAttribute("aria-pressed", "false");

    button.addEventListener("click", () => {
      caseProfile.replacement = button.dataset.replacement;

      setHiddenValue("selectedReplacement", caseProfile.replacement);

      selectOption(button, "[data-replacement]");

      renderProgressAnswers();
      updateProgress(5);
      revealSection(questionInsured);
    });
  });

  /*
   * QUESTION 5: INSURED
   */

  document.querySelectorAll("[data-insured]").forEach((button) => {
    button.setAttribute("aria-pressed", "false");

    button.addEventListener("click", () => {
      caseProfile.insured = button.dataset.insured;

      setHiddenValue("selectedInsuredType", caseProfile.insured);

      selectOption(button, "[data-insured]");

      renderProgressAnswers();

      const progressWrapper = document.getElementById("wizardProgressWrapper");

      if (progressWrapper) {
        progressWrapper.classList.add("fade-out");

        setTimeout(() => {
          progressWrapper.style.display = "none";
        }, 400);
      }

      buildSummary();

      revealSection(qualificationComplete);
    });
  });

  /*
   * BEGIN REVIEW BUTTON
   */

  if (launchWorkbench && reviewWorkbench) {
    launchWorkbench.addEventListener("click", () => {
      reviewWorkbench.hidden = false;

      requestAnimationFrame(() => {
        reviewWorkbench.classList.add("in-view");
      });

      window.setTimeout(() => {
        gentleScrollTo(reviewWorkbench, 1200);
      }, 100);
    });
  }

  /*
   * INITIALIZE
   */

  updateProgress(1);
  renderProgressAnswers();
});
document
  .getElementById("wizardProgressWrapper")
  .classList.add("progress-complete");
