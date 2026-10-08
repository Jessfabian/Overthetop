document.addEventListener("DOMContentLoaded", () => {
  updateProgress(1);

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

    if (!fill || !label) return;

    const percent = (step / 5) * 100;

    fill.style.width = `${percent}%`;

    label.textContent = `Question ${step} of 5`;
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

      updateProgress(3);

      revealSection(questionBot);
    });
  }

  document.querySelectorAll("[data-bot]").forEach((button) => {
    button.addEventListener("click", () => {
      caseProfile.bot = button.dataset.bot;

      document.getElementById("selectedBOT").value = button.dataset.bot;

      updateProgress(4);

      revealSection(questionReplacement);
    });
  });

  document.querySelectorAll("[data-replacement]").forEach((button) => {
    button.addEventListener("click", () => {
      caseProfile.replacement = button.dataset.replacement;

      document.getElementById("selectedReplacement").value =
        button.dataset.replacement;

      updateProgress(5);

      revealSection(questionInsured);
    });
  });

  document.querySelectorAll("[data-insured]").forEach((button) => {
    button.addEventListener("click", () => {
      caseProfile.insured = button.dataset.insured;

      document.getElementById("selectedInsuredType").value =
        button.dataset.insured;

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
