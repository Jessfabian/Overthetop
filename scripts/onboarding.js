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

  function revealSection(section) {
    if (!section) return;

    section.hidden = false;

    setTimeout(() => {
      section.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 200);
  }

  function buildSummary() {
    let summary = `
        <div class="profile-summary">

            <div>
                <strong>Product:</strong>
                ${caseProfile.product}
            </div>

            <div>
                <strong>State:</strong>
                ${caseProfile.state}
            </div>

            <div>
                <strong>BOT:</strong>
                ${caseProfile.bot}
            </div>

            <div>
                <strong>Replacement:</strong>
                ${caseProfile.replacement}
            </div>

            <div>
                <strong>Insured Type:</strong>
                ${caseProfile.insured}
            </div>

        </div>
        `;

    let summaryContainer = document.getElementById(
      "qualificationSummaryContent",
    );

    if (summaryContainer) {
      summaryContainer.innerHTML = summary;
    }

    const summaryWrapper = document.getElementById("qualificationSummary");

    if (summaryWrapper) {
      summaryWrapper.hidden = false;
    }
  }

  document.querySelectorAll("[data-product]").forEach((button) => {
    button.addEventListener("click", () => {
      caseProfile.product = button.dataset.product;

      document
        .getElementById("selectedProduct")
        ?.setAttribute("value", button.dataset.product);

      revealSection(questionState);
    });
  });

  const stateDropdown = document.getElementById("contractState");

  if (stateDropdown) {
    stateDropdown.addEventListener("change", () => {
      if (stateDropdown.value === "") return;

      caseProfile.state = stateDropdown.value;

      revealSection(questionBot);
    });
  }

  document.querySelectorAll("[data-bot]").forEach((button) => {
    button.addEventListener("click", () => {
      caseProfile.bot = button.dataset.bot;

      document
        .getElementById("selectedBOT")
        ?.setAttribute("value", button.dataset.bot);

      revealSection(questionReplacement);
    });
  });

  document.querySelectorAll("[data-replacement]").forEach((button) => {
    button.addEventListener("click", () => {
      caseProfile.replacement = button.dataset.replacement;

      document
        .getElementById("selectedReplacement")
        ?.setAttribute("value", button.dataset.replacement);

      revealSection(questionInsured);
    });
  });

  document.querySelectorAll("[data-insured]").forEach((button) => {
    button.addEventListener("click", () => {
      caseProfile.insured = button.dataset.insured;

      document
        .getElementById("selectedInsuredType")
        ?.setAttribute("value", button.dataset.insured);

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

selectedState.value = contractState.value;

const caseProfile = {
  product: null,

  state: null,

  bot: null,

  replacement: null,

  insured: null,
};

function updateProgress(step) {
  const fill = document.getElementById("wizardProgressFill");

  const label = document.getElementById("wizardProgressLabel");

  const percent = (step / 5) * 100;

  fill.style.width = `${percent}%`;

  label.textContent = `Question ${step} of 5`;
}
``;

updateProgress(2);
updateProgress(3);
updateProgress(4);
updateProgress(5);