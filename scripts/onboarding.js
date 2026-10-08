document.addEventListener("DOMContentLoaded", () => {

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

  const reviewWorkbench = document.getElementById("reviewWorkbench");

  const launchWorkbench = document.getElementById("launchWorkbench");

function updateProgress(step) {
  const fill = document.getElementById("wizardProgressFill");

  const label = document.getElementById("wizardProgressLabel");

  const percentLabel = document.getElementById("wizardProgressPercent");

  const percent = Math.min(100, Math.max(0, (step / 5) * 100));

  if (fill) {
    fill.style.width = `${percent}%`;
  }

  if (label) {
    label.textContent = `Question ${step} of 5`;
  }

  if (percentLabel) {
    percentLabel.textContent = `${Math.round(percent)}%`;
  }
}

  function revealSection(section) {
    if (!section) return;

    section.hidden = false;

    setTimeout(() => {
      section.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 250);
  }

  function buildSummary() {
    const summaryContainer = document.getElementById(
      "qualificationSummaryContent",
    );

    const summaryWrapper = document.getElementById("qualificationSummary");

    if (!summaryContainer) return;

    summaryContainer.innerHTML = `

            <div class="profile-summary-item">
                <strong>Product</strong>
                <span>${caseProfile.product}</span>
            </div>

            <div class="profile-summary-item">
                <strong>State</strong>
                <span>${caseProfile.state}</span>
            </div>

            <div class="profile-summary-item">
                <strong>BOT</strong>
                <span>${caseProfile.bot}</span>
            </div>

            <div class="profile-summary-item">
                <strong>Replacement</strong>
                <span>${caseProfile.replacement}</span>
            </div>

            <div class="profile-summary-item">
                <strong>Insured</strong>
                <span>${caseProfile.insured}</span>
            </div>

        `;

    if (summaryWrapper) {
      summaryWrapper.hidden = false;
    }
  }

  document.querySelectorAll("[data-product]").forEach((button) => {
    button.addEventListener("click", () => {
     caseProfile.product = button.dataset.product;

     document.getElementById("selectedProduct").value = button.dataset.product;

     renderProgressAnswers();
     updateProgress(2);
     revealSection(questionState);
    });
  });

  const stateDropdown = document.getElementById("contractState");

  if (stateDropdown) {
    stateDropdown.addEventListener("change", () => {
      if (!stateDropdown.value) return;

    caseProfile.state = stateDropdown.value;

    const selectedState = document.getElementById("selectedState");

    if (selectedState) {
      selectedState.value = stateDropdown.value;
    }

    renderProgressAnswers();
    updateProgress(3);
    revealSection(questionBot);
    });
  }

  document.querySelectorAll("[data-bot]").forEach((button) => {
    button.addEventListener("click", () => {
      caseProfile.bot = button.dataset.bot;

      document.getElementById("selectedBOT").value = button.dataset.bot;

      renderProgressAnswers();
      updateProgress(4);
      revealSection(questionReplacement);
    });
  });

  document.querySelectorAll("[data-replacement]").forEach((button) => {
    button.addEventListener("click", () => {
      caseProfile.replacement = button.dataset.replacement;

      document.getElementById("selectedReplacement").value =
        button.dataset.replacement;

      renderProgressAnswers();
      updateProgress(5);
      revealSection(questionInsured);
    });
  });

  document.querySelectorAll("[data-insured]").forEach((button) => {
    button.addEventListener("click", () => {
      caseProfile.insured = button.dataset.insured;

      document.getElementById("selectedInsuredType").value =
        button.dataset.insured;

      renderProgressAnswers();
      buildSummary();
      revealSection(qualificationComplete);
    });
  });

  if (launchWorkbench) {
    launchWorkbench.addEventListener("click", () => {
      reviewWorkbench.hidden = false;

      reviewWorkbench.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }
});
function renderProgressAnswers() {
  const summary = document.getElementById("wizardAnswerSummary");

  if (!summary) return;

  summary.replaceChildren();

  const answers = [];

  if (caseProfile.product) {
    answers.push({
      label: "Product",
      value: caseProfile.product === "perm" ? "Permanent" : "Term",
    });
  }

  if (caseProfile.state) {
    answers.push({
      label: "State",
      value: caseProfile.state,
    });
  }

  if (caseProfile.bot) {
    answers.push({
      label: "BOT",
      value: caseProfile.bot === "yes" ? "Yes" : "No",
    });
  }

  if (caseProfile.replacement) {
    const replacementLabels = {
      none: "No Replacement",
      internal: "Internal",
      external: "External",
    };

    answers.push({
      label: "Replacement",
      value:
        replacementLabels[caseProfile.replacement] || caseProfile.replacement,
    });
  }

  if (caseProfile.insured) {
    answers.push({
      label: "Insured",
      value: caseProfile.insured === "single" ? "Single" : "Joint",
    });
  }

  if (answers.length === 0) {
    const emptyMessage = document.createElement("span");

    emptyMessage.className = "wizard-answer-empty";

    emptyMessage.textContent = "Your selections will appear here.";

    summary.appendChild(emptyMessage);

    return;
  }

  answers.forEach((answer) => {
    const chip = document.createElement("span");

    chip.className = "wizard-answer-chip";

    const label = document.createElement("strong");

    label.textContent = `${answer.label}:`;

    const value = document.createElement("span");

    value.textContent = answer.value;

    chip.append(label, value);
    summary.appendChild(chip);
  });
  updateProgress(1);
  renderProgressAnswers();
}