document.addEventListener("DOMContentLoaded", () => {
  /*
   * ====================================================
   * ELEMENT REFERENCES
   * ====================================================
   */

  const progressFill = document.getElementById("progressFill");

  const progressText = document.getElementById("progressText");

  const reviewWorkspace = document.querySelector(".review-workspace");

  const stepButtons = document.querySelectorAll(".step-btn");

  const requiredFormsContainer = document.getElementById("requiredForms");

  const reviewChecklistContainer = document.getElementById("reviewChecklist");

  const applicationReview = document.getElementById("applicationReview");

  const generateEmailButton = document.getElementById("generateEmail");

  const copyEmailButton = document.getElementById("copyEmail");

  const emailOutput = document.getElementById("emailOutput");

  const notesField = document.getElementById("initialReviewNotes");

  const copyNotesButton = document.getElementById("copyInitialReviewNotes");

  const notesStatus = document.getElementById("initialReviewNotesStatus");

  const saveAgeFields = document.getElementById("saveAgeFields");

  const specificDateFields = document.getElementById("specificDateFields");

  /*
   * ====================================================
   * SIDEBAR NAVIGATION
   * ====================================================
   */

  const sectionMap = [
    "caseSetupSection",
    "stateRequirements",
    "trexReview",
    "applicationReview",
    "requirementsSection",
    "amendmentsSection",
    "bingoSection",
    "emailSection",
  ];

  stepButtons.forEach((button, index) => {
    const sectionId = button.dataset.target || sectionMap[index];

    if (!sectionId) {
      return;
    }

    button.dataset.target = sectionId;

    button.addEventListener("click", () => {
      const targetSection = document.getElementById(sectionId);

      if (!targetSection) {
        console.warn(`Section not found: ${sectionId}`);

        return;
      }

      stepButtons.forEach((item) => {
        item.classList.remove("active");
      });

      button.classList.add("active");

      targetSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  });

  /*
   * ====================================================
   * PROGRESS TRACKING
   * ====================================================
   */

  function getTrackableCheckboxes() {
    if (!reviewWorkspace) {
      return [];
    }

    return Array.from(
      reviewWorkspace.querySelectorAll(
        'input[type="checkbox"][data-track-progress="true"]',
      ),
    );
  }

  function getReviewedStateFormCount() {
    return document.querySelectorAll(
      '.required-form-row[data-form-status="igo"], ' +
        '.required-form-row[data-form-status="nigo"]',
    ).length;
  }

  function getApplicationReviewCount() {
    return document.querySelectorAll(
      "#applicationReview .review-card[data-status]",
    ).length;
  }

  function getApplicationReviewTotal() {
    return document.querySelectorAll("#applicationReview .review-card").length;
  }

  function getStateFormTotal() {
    return document.querySelectorAll(".required-form-row").length;
  }

  function updateProgress() {
    const checkboxes = getTrackableCheckboxes();

    const completedCheckboxes = checkboxes.filter((checkbox) => {
      return checkbox.checked;
    }).length;

    const reviewedStateForms = getReviewedStateFormCount();

    const reviewedApplicationItems = getApplicationReviewCount();

    const total =
      checkboxes.length + getStateFormTotal() + getApplicationReviewTotal();

    const completed =
      completedCheckboxes + reviewedStateForms + reviewedApplicationItems;

    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    if (progressFill) {
      progressFill.style.width = `${percentage}%`;
    }

    if (progressText) {
      progressText.textContent = `${completed} of ${total} steps complete`;
    }
  }

  function registerProgressCheckboxes() {
    if (!reviewWorkspace) {
      return;
    }

    const checkboxes = reviewWorkspace.querySelectorAll(
      'input[type="checkbox"]',
    );

    checkboxes.forEach((checkbox) => {
      checkbox.dataset.trackProgress = "true";

      if (checkbox.dataset.progressListenerAdded !== "true") {
        checkbox.addEventListener("change", updateProgress);

        checkbox.dataset.progressListenerAdded = "true";
      }
    });

    updateProgress();
  }

  const progressObserver = new MutationObserver(() => {
    registerProgressCheckboxes();
    updateProgress();
  });

  if (requiredFormsContainer) {
    progressObserver.observe(requiredFormsContainer, {
      childList: true,
      subtree: true,
    });
  }

  if (reviewChecklistContainer) {
    progressObserver.observe(reviewChecklistContainer, {
      childList: true,
      subtree: true,
    });
  }

  document.addEventListener("stateFormsUpdated", updateProgress);

  registerProgressCheckboxes();

  /*
   * ====================================================
   * APPLICATION REVIEW
   * ====================================================
   */

  if (
    applicationReview &&
    !applicationReview.querySelector(".application-review-grid")
  ) {
    applicationReview.innerHTML = `
      <h2>Application Review</h2>

      <div class="application-review-grid">

        <div
          class="review-card"
          data-review-item="Part 1"
        >
          <h3>Part 1</h3>

          <div class="review-status-buttons">
            <button
              type="button"
              class="review-status-button"
              data-status="IGO"
            >
              IGO
            </button>

            <button
              type="button"
              class="review-status-button"
              data-status="NIGO"
            >
              NIGO
            </button>

            <button
              type="button"
              class="review-status-button"
              data-status="Issue Found"
            >
              Issue Found
            </button>
          </div>
        </div>

        <div
          class="review-card"
          data-review-item="HIPAA"
        >
          <h3>HIPAA</h3>

          <div class="review-status-buttons">
            <button
              type="button"
              class="review-status-button"
              data-status="IGO"
            >
              IGO
            </button>

            <button
              type="button"
              class="review-status-button"
              data-status="NIGO"
            >
              NIGO
            </button>

            <button
              type="button"
              class="review-status-button"
              data-status="Issue Found"
            >
              Issue Found
            </button>
          </div>
        </div>

        <div
          class="review-card"
          data-review-item="Producer Statement"
        >
          <h3>Producer Statement</h3>

          <div class="review-status-buttons">
            <button
              type="button"
              class="review-status-button"
              data-status="IGO"
            >
              IGO
            </button>

            <button
              type="button"
              class="review-status-button"
              data-status="NIGO"
            >
              NIGO
            </button>

            <button
              type="button"
              class="review-status-button"
              data-status="Issue Found"
            >
              Issue Found
            </button>
          </div>
        </div>

      </div>
    `;
  }

  if (applicationReview) {
    applicationReview.addEventListener("click", (event) => {
      const selectedButton = event.target.closest(".review-status-button");

      if (!selectedButton) {
        return;
      }

      const reviewCard = selectedButton.closest(".review-card");

      if (!reviewCard) {
        return;
      }

      reviewCard.querySelectorAll(".review-status-button").forEach((button) => {
        button.classList.remove(
          "selected",
          "selected-igo",
          "selected-nigo",
          "selected-issue",
        );
      });

      selectedButton.classList.add("selected");

      const selectedStatus = selectedButton.dataset.status;

      if (selectedStatus === "IGO") {
        selectedButton.classList.add("selected-igo");
      }

      if (selectedStatus === "NIGO") {
        selectedButton.classList.add("selected-nigo");
      }

      if (selectedStatus === "Issue Found") {
        selectedButton.classList.add("selected-issue");
      }

      reviewCard.dataset.status = selectedStatus;

      updateProgress();
    });
  }

  /*
   * ====================================================
   * CASE SETUP HELPERS
   * ====================================================
   */

  function getCaseFieldValue(fieldId) {
    const field = document.getElementById(fieldId);

    return field ? String(field.value).trim() : "";
  }

  function getSelectedText(fieldId) {
    const field = document.getElementById(fieldId);

    if (!field || field.selectedIndex < 0) {
      return "";
    }

    return field.options[field.selectedIndex].text.trim();
  }

  function yesNo(value) {
    if (value === "yes") {
      return "Yes";
    }

    if (value === "no") {
      return "No";
    }

    return "Not selected";
  }

  /*
   * ====================================================
   * POLICY DATING DISPLAY
   * ====================================================
   */

  function handlePolicyDatingDisplay() {
    const policyDating = getCaseFieldValue("policyDating");

    if (saveAgeFields) {
      saveAgeFields.hidden = policyDating !== "saveAge";
    }

    if (specificDateFields) {
      specificDateFields.hidden = policyDating !== "specificDate";
    }

    if (policyDating === "saveAge") {
      calculateSaveAgeDate();
    }
  }

  /*
   * ====================================================
   * SAVE AGE HELPERS
   * ====================================================
   */

  function clearSaveAgeResults() {
    const saveAgeDate = document.getElementById("saveAgeDate");

    const eligibility = document.getElementById("saveAgeEligibility");

    const ageChangeDate = document.getElementById("ageChangeDate");

    const duration = document.getElementById("saveAgeDuration");

    const guidance = document.getElementById("saveAgeGuidance");

    const warning = document.getElementById("saveAgeEligibilityWarning");

    if (saveAgeDate) {
      saveAgeDate.value = "";
    }

    if (eligibility) {
      eligibility.value = "";

      eligibility.classList.remove(
        "save-age-eligible",
        "save-age-not-eligible",
      );
    }

    if (ageChangeDate) {
      ageChangeDate.textContent = "--";
    }

    if (duration) {
      duration.textContent = "--";
    }

    if (guidance) {
      guidance.textContent = "Enter the Save Age information.";
    }

    if (warning) {
      warning.hidden = true;
      warning.textContent = "";
    }
  }

  function isValidMonthDay(month, day) {
    if (month < 1 || month > 12 || day < 1) {
      return false;
    }

    const validationDate = new Date(2024, month - 1, day);

    return (
      validationDate.getMonth() === month - 1 &&
      validationDate.getDate() === day
    );
  }

  function parseLocalDate(value) {
    if (!value) {
      return null;
    }

    const parts = value.split("-").map(Number);

    if (parts.length !== 3) {
      return null;
    }

    const [year, month, day] = parts;

    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  function isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }

  function createSafeLocalDate(year, month, day) {
    if (month === 2 && day === 29 && !isLeapYear(year)) {
      return new Date(year, 1, 28);
    }

    return new Date(year, month - 1, day);
  }

  function addDays(date, numberOfDays) {
    const result = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    result.setDate(result.getDate() + numberOfDays);

    return result;
  }

  function stripTime(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function formatDisplayDate(date) {
    return new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }).format(date);
  }

  function getReferenceBirthYear(birthMonth, birthDay, part1Date) {
    let referenceYear = part1Date.getFullYear();

    const testBirthDate = createSafeLocalDate(
      referenceYear,
      birthMonth,
      birthDay,
    );

    const testAgeChangeDate = addDays(testBirthDate, 183);

    if (testAgeChangeDate > addDays(part1Date, 183)) {
      referenceYear -= 1;
    }

    return referenceYear;
  }

  function calculateCalendarDuration(startDate, endDate) {
    let start = stripTime(startDate);

    let end = stripTime(endDate);

    if (end < start) {
      const temporary = start;
      start = end;
      end = temporary;
    }

    let months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months -= 1;

      const previousMonthDays = new Date(
        end.getFullYear(),
        end.getMonth(),
        0,
      ).getDate();

      days += previousMonthDays;
    }

    return {
      totalMonths: months,
      days,
    };
  }

  function moveToPriorBusinessDay(date) {
    let adjustedDate = stripTime(date);

    if (adjustedDate.getDay() === 6) {
      adjustedDate = addDays(adjustedDate, -1);
    }

    if (adjustedDate.getDay() === 0) {
      adjustedDate = addDays(adjustedDate, -2);
    }

    return adjustedDate;
  }

  function buildEligibleGuidance(productType, exchange1035, saveAgeDate) {
    const formattedDate = formatDisplayDate(saveAgeDate);

    const parts = [`Eligible to save age using ${formattedDate}.`];

    if (exchange1035) {
      parts.push(
        "The calculation is within the four-month 1035 backdating limit.",
      );
    } else {
      parts.push("The calculation is within the six-month backdating limit.");
    }

    const saveAgeRules = {
      wholeLife: {
        offsetDays: 2,
        checkNYSE: false,
      },

      ulGuard: {
        offsetDays: 2,
        checkNYSE: false,
      },

      sulGuard: {
        offsetDays: 2,
        checkNYSE: false,
      },

      tradVantage: {
        offsetDays: 2,
        checkNYSE: false,
        additionalSubtraction: 2,
      },

      apexVul: {
        offsetDays: 2,
        checkNYSE: true,
      },

      term: {
        handledByTPP: true,
      },
    };
    const rule = saveAgeRules[productType];
    return parts.join(" ");
  }

  /*
   * ====================================================
   * SAVE AGE CALCULATION
   * ====================================================
   */

  function calculateSaveAgeDate() {
    const month = Number(getCaseFieldValue("birthMonth"));

    const day = Number(getCaseFieldValue("birthDay"));

    const part1SignDateValue = getCaseFieldValue("part1SignDate");

    const productType = getCaseFieldValue("productType");

    const caseType = getCaseFieldValue("caseType");

    const exchange1035 = getCaseFieldValue("saveAge1035") === "yes";

    const alternateAdditional = getCaseFieldValue("alternateAdditional");

    const saveAgeDateField = document.getElementById("saveAgeDate");

    const eligibilityField = document.getElementById("saveAgeEligibility");

    const ageChangeDateField = document.getElementById("ageChangeDate");

    const durationField = document.getElementById("saveAgeDuration");

    const guidanceField = document.getElementById("saveAgeGuidance");

    const messageField = document.getElementById("saveAgeMessage");

    const warningField = document.getElementById("saveAgeEligibilityWarning");

    clearSaveAgeResults();

    if (!month || !day || !part1SignDateValue) {
      if (messageField) {
        messageField.textContent =
          "Enter the insured's birth month and day and the Part 1 signature date.";
      }

      return;
    }

    if (!isValidMonthDay(month, day)) {
      if (eligibilityField) {
        eligibilityField.value = "Invalid Birth Date";
      }

      if (messageField) {
        messageField.textContent = "Enter a valid birth month and day.";
      }

      return;
    }

    if (
      alternateAdditional === "alternate" ||
      alternateAdditional === "additional" ||
      alternateAdditional === "both"
    ) {
      if (eligibilityField) {
        eligibilityField.value = "Manual Review Required";
      }

      if (warningField) {
        warningField.hidden = false;

        warningField.textContent =
          "Do not use the calculator when an alternate or additional policy is involved. Review the Save Age procedure and ensure all policies use the same policy date.";
      }

      if (guidanceField) {
        guidanceField.textContent = "Refer for manual Save Age review.";
      }

      generateInitialReviewNotes();
      return;
    }

    if (productType === "term") {
      if (eligibilityField) {
        eligibilityField.value = "Use TPP";
      }

      if (guidanceField) {
        guidanceField.textContent =
          "Select the Save Age option in TPP. TPP will generate the required date.";
      }

      if (messageField) {
        messageField.textContent =
          "The manual Save Age date is not calculated for Term.";
      }

      generateInitialReviewNotes();
      return;
    }

    const part1SignDate = parseLocalDate(part1SignDateValue);

    if (!part1SignDate) {
      if (eligibilityField) {
        eligibilityField.value = "Invalid Date";
      }

      if (messageField) {
        messageField.textContent = "Enter a valid Part 1 signature date.";
      }

      return;
    }

    const birthReferenceYear = getReferenceBirthYear(month, day, part1SignDate);

    const birthReferenceDate = createSafeLocalDate(
      birthReferenceYear,
      month,
      day,
    );

    const ageChangeDate = addDays(birthReferenceDate, 183);

    const baseDaysToSubtract = caseType === "conversion" ? 1 : 2;

    let saveAgeDate = addDays(ageChangeDate, -baseDaysToSubtract);

    if (productType === "apexVul") {
      saveAgeDate = moveToPriorBusinessDay(saveAgeDate);
    }

    const originalSaveAgeDay = saveAgeDate.getDate();

    let premiumDateCorrected = false;

    if (originalSaveAgeDay > 28) {
      saveAgeDate.setDate(28);

      premiumDateCorrected = true;
    }

    const duration = calculateCalendarDuration(saveAgeDate, part1SignDate);

    const maximumMonths = exchange1035 ? 4 : 6;

    const withinBackdateLimit =
      duration.totalMonths < maximumMonths ||
      (duration.totalMonths === maximumMonths && duration.days === 0);

    const saveAgeIsFuture = stripTime(saveAgeDate) > stripTime(new Date());

    const eligible = withinBackdateLimit && !saveAgeIsFuture;

    if (saveAgeDateField) {
      saveAgeDateField.value = formatDisplayDate(saveAgeDate);
    }

    if (ageChangeDateField) {
      ageChangeDateField.textContent = formatDisplayDate(ageChangeDate);
    }

    if (durationField) {
      durationField.textContent =
        `${duration.totalMonths} month` +
        `${duration.totalMonths === 1 ? "" : "s"} and ` +
        `${duration.days} day` +
        `${duration.days === 1 ? "" : "s"}`;
    }

    if (eligible) {
      if (eligibilityField) {
        eligibilityField.value = "YES";

        eligibilityField.classList.remove("save-age-not-eligible");

        eligibilityField.classList.add("save-age-eligible");
      }

      if (guidanceField) {
        guidanceField.textContent = buildEligibleGuidance(
          productType,
          exchange1035,
          saveAgeDate,
        );
      }
    } else {
      if (eligibilityField) {
        eligibilityField.value = "NO, Agency confirmation Required";

        eligibilityField.classList.remove("save-age-eligible");

        eligibilityField.classList.add("save-age-not-eligible");
      }

      if (guidanceField) {
        if (saveAgeIsFuture) {
          guidanceField.textContent =
            "Save Age should not be used because the calculated date is in the future.";
        } else if (exchange1035) {
          guidanceField.textContent =
            "The backdating period exceeds the four-month limit for a 1035 exchange.";
        } else {
          guidanceField.textContent =
            "The backdating period exceeds six months. Clarification, exception review, or management approval may be required.";
        }
      }
    }

    const messages = [];

    if (premiumDateCorrected) {
      messages.push(
        "The calculated date fell on the 29th, 30th, or 31st. The premium due date was adjusted to the 28th.",
      );
    }

    if (productType === "apexVul") {
      messages.push(
        "Apex VUL dates falling on a weekend were moved to the prior business day. Confirm the adjusted date is not an NYSE-closed date.",
      );
    }

    if (productType === "ulGuard") {
      messages.push("Use the resulting Save Age date for UL Guard.");
    }

    if (productType === "sulGuard") {
      messages.push("Use the resulting Save Age date for SUL Guard.");
    }

    if (productType === "tradVantage") {
      messages.push(
        caseType === "conversion"
          ? "The Conversion Save Age calculation uses the applicable one-day adjustment."
          : "The New Business Save Age calculation uses the applicable two-day adjustment.",
      );
    }

    if (messageField) {
      messageField.textContent =
        messages.length > 0
          ? messages.join(" ")
          : "Save Age calculation completed.";
    }

    generateInitialReviewNotes();
  }

  /*
   * ====================================================
   * POLICY DATING TEXT
   * ====================================================
   */

  function getPolicyDatingText() {
    const policyDating = getCaseFieldValue("policyDating");

    if (policyDating === "saveAge") {
      const calculatedDate = getCaseFieldValue("saveAgeDate");

      return calculatedDate ? `Save Age, ${calculatedDate}` : "Save Age";
    }

    if (policyDating === "currentDate") {
      return "Current Date";
    }

    if (policyDating === "specificDate") {
      const specificDate = getCaseFieldValue("specificPolicyDate");

      return specificDate ? `Specific Date, ${specificDate}` : "Specific Date";
    }

    return "Not selected";
  }

  /*
   * ====================================================
   * ILLUSTRATION
   * ====================================================
   */

  function getIllustrationText() {
    const state = getCaseFieldValue("contractState");

    const status = getCaseFieldValue("illustrationStatus");

    const requirementText =
      state === "NY"
        ? "Required for New York"
        : "Nice to have for this contract state";

    let statusText = "Not selected";

    if (status === "yes") {
      statusText = "Signed illustration received as applied for";
    }

    if (status === "no") {
      statusText = "Signed illustration does not match the application";
    }

    if (status === "notReceived") {
      statusText = "Signed illustration not received";
    }

    return `${statusText}. ` + `${requirementText}.`;
  }

  function updateIllustrationGuidance() {
    const illustrationValidationSection = document.getElementById(
      "Illustration-Validation",
    );

    const illustrationStatus = getCaseFieldValue("illustrationStatus");

    if (illustrationValidationSection) {
      illustrationValidationSection.hidden = illustrationStatus !== "yes";
    }
    const guidance = document.getElementById("illustrationGuidance");

    if (!guidance) {
      return;
    }

    const state = getCaseFieldValue("contractState");

    if (state === "NY") {
      guidance.textContent =
        "A signed matching illustration is required for New York policies.";

      guidance.classList.add("required-guidance");
    } else if (state) {
      guidance.textContent =
        "A signed illustration is recommended for this contract state.";

      guidance.classList.remove("required-guidance");
    } else {
      guidance.textContent = "";

      guidance.classList.remove("required-guidance");
    }
  }

  /*
   * ====================================================
   * INITIAL REVIEW NOTES
   * ====================================================
   */

  function generateInitialReviewNotes() {
    if (!notesField) {
      return;
    }

    const insured = getCaseFieldValue("insuredName") || "[Insured Name]";

    const purpose =
      getCaseFieldValue("purposeOfInsurance") || "[Purpose of Insurance]";

    const riskClass = getCaseFieldValue("riskClass") || "[Risk Class]";

    const replacement = yesNo(getCaseFieldValue("replacement"));

    const owner = getSelectedText("ownerType") || "Not selected";

    const beneficiary = getSelectedText("beneficiaryOther") || "Not selected";

    const tlir = yesNo(getCaseFieldValue("tlirRequested"));

    const product = getSelectedText("productType") || "Not selected";

    const alternateAdditional =
      getSelectedText("alternateAdditional") || "None";

    const polaris = getSelectedText("polarisCheck") || "Not selected";

    const caseType = getSelectedText("caseType") || "Not selected";

    const sourceOfFunds =
      getCaseFieldValue("sourceOfFundsRequired") === "yes"
        ? "Source of Funds Questionnaire required"
        : "Source of Funds Questionnaire not required";

    const saveAgeEligibility = getCaseFieldValue("saveAgeEligibility");

    const saveAgeDate = getCaseFieldValue("saveAgeDate");

    const saveAgeDuration =
      document.getElementById("saveAgeDuration")?.textContent?.trim() || "";

    const saveAgeGuidance =
      document.getElementById("saveAgeGuidance")?.textContent?.trim() || "";

    const notes = [
      `Insured: ${insured}`,
      `Purpose of Insurance: ${purpose}`,
      `Applied Risk Class: ${riskClass}`,
      `Policy Dating: ${getPolicyDatingText()}`,
      `Illustration Info: ${getIllustrationText()}`,
      "",
      `Replacement: ${replacement}`,
      `Owner: ${owner}`,
      `Beneficiary: ${beneficiary}`,
      `TLIR Requested: ${tlir}`,
      `Product: ${product}`,
      `Case Type: ${caseType}`,
      `Alternate Cases: ${alternateAdditional}`,
      `Polaris Check: ${polaris}`,
      sourceOfFunds,
    ];

    if (getCaseFieldValue("policyDating") === "saveAge") {
      notes.push("");
      notes.push("Save Age Information:");

      notes.push(`Save Age Date: ${saveAgeDate || "Not calculated"}`);

      notes.push(
        `Save Age Eligibility: ${saveAgeEligibility || "Not calculated"}`,
      );

      notes.push(
        `Backdating Duration: ${
          saveAgeDuration && saveAgeDuration !== "--"
            ? saveAgeDuration
            : "Not calculated"
        }`,
      );

      if (
        saveAgeGuidance &&
        saveAgeGuidance !== "Enter the Save Age information."
      ) {
        notes.push(`Save Age Guidance: ${saveAgeGuidance}`);
      }
    }

    notesField.value = notes.join("\n");
  }

  /*
   * ====================================================
   * CASE SETUP FIELD LISTENERS
   * ====================================================
   */

  const caseSetupFieldIds = [
    "policyNumber",
    "insuredName",
    "contractState",
    "replacement",
    "ownerType",
    "beneficiaryOther",
    "tlirRequested",
    "productType",
    "caseType",
    "purposeOfInsurance",
    "riskClass",
    "policyDating",
    "illustrationStatus",
    "alternateAdditional",
    "polarisCheck",
    "additionalInsured",
    "foreignActivity",
    "internalTermReplacement",
    "billingType",
    "paperPart2Required",
    "sourceOfFundsRequired",
    "suitabilityQuestionnaireRequired",
    "birthMonth",
    "birthDay",
    "specificPolicyDate",
    "part1SignDate",
    "saveAge1035",
  ];

  function handleCaseSetupChange() {
    handlePolicyDatingDisplay();
    updateIllustrationGuidance();
    generateInitialReviewNotes();
    generateInitialReviewEmail();
  }

  caseSetupFieldIds.forEach((fieldId) => {
    const field = document.getElementById(fieldId);

    if (!field) {
      return;
    }

    field.addEventListener("input", handleCaseSetupChange);

    field.addEventListener("change", handleCaseSetupChange);
  });

  /*
   * ====================================================
   * COPY INITIAL REVIEW NOTES
   * ====================================================
   */

  if (copyNotesButton) {
    copyNotesButton.addEventListener("click", async () => {
      if (!notesField || !notesField.value.trim()) {
        return;
      }

      try {
        await navigator.clipboard.writeText(notesField.value);

        if (notesStatus) {
          notesStatus.textContent = "Initial Review Notes copied.";
        }
      } catch (error) {
        notesField.select();
        document.execCommand("copy");

        if (notesStatus) {
          notesStatus.textContent = "Initial Review Notes copied.";
        }
      }
    });
  }

  /*
   * ====================================================
   * REVIEWED STATE FORMS
   * ====================================================
   */

  function getReviewedStateForms() {
    const reviewedRows = document.querySelectorAll(
      '.required-form-row[data-form-status="igo"], ' +
        '.required-form-row[data-form-status="nigo"]',
    );

    return Array.from(reviewedRows).map((row) => {
      const formId =
        row.dataset.formId ||
        row.querySelector(".state-form-id")?.textContent?.trim() ||
        "Reviewed form";

      const status = row.dataset.formStatus?.toUpperCase() || "REVIEWED";

      return `${formId}: ${status}`;
    });
  }

  /*
   * ====================================================
   * APPLICATION REVIEW RESULTS
   * ====================================================
   */

  function getApplicationReviewResults() {
    const cards = document.querySelectorAll("#applicationReview .review-card");

    return Array.from(cards)
      .filter((card) => {
        return card.dataset.status;
      })
      .map((card) => {
        const item = card.dataset.reviewItem || "Review item";

        return `${item}: ` + `${card.dataset.status}`;
      });
  }

  /*
   * ====================================================
   * BINGO
   * ====================================================
   */

  function getSelectedBingoStatus() {
    const selectedStatus = document.querySelector(
      'input[name="bingo"]:checked',
    );

    return selectedStatus ? selectedStatus.value : "";
  }

  /*
   * ====================================================
   * EMAIL GENERATOR
   * ====================================================
   */
  const mmsd = `
<img src="data:image/png;base64,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" alt="Base64 Image" />
`;
  function escapeEmailHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getCompiledRequirements() {
    return document.getElementById("compiledRequirements")?.value?.trim() || "";
  }

  function formatRequirementsForEmail(requirementsText) {
    return requirementsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const cleanLine = line.replace(/^[•*-]\s*/, "");

        return `
        <li style="
          margin: 0 0 8px;
          text-align: start;
        ">
          ${escapeEmailHtml(cleanLine)}
        </li>
      `;
      })
      .join("");
  }

  function generateInitialReviewEmail() {
    if (!emailOutput) {
      return;
    }

    const insuredName = getCaseFieldValue("insuredName") || "[Insured Name]";

    const insuredLastName =
      insuredName === "[Insured Name]"
        ? "[Insured Last Name]"
        : insuredName.trim().split(/\s+/).pop();

    const policyNumber = getCaseFieldValue("policyNumber") || "[Policy Number]";

    const financialProfessional =
      getCaseFieldValue("financialProfessional") || "[Financial Professional]";

    const accountManager =
      getCaseFieldValue("accountManager") || "[Account Manager]";

    const underwriter = getCaseFieldValue("underwriter") || "[Underwriter]";

    const policyLookup =
      typeof getProductAndSystemFromPolicy === "function"
        ? getProductAndSystemFromPolicy(policyNumber)
        : {
            product: "",
            system: "",
          };

    const dashboardProduct =
      document.getElementById("dashboardProduct")?.textContent?.trim() || "";

    const product =
      policyLookup.product ||
      (dashboardProduct && dashboardProduct !== "--" ? dashboardProduct : "") ||
      "[Product Applied For]";

    const compiledRequirements = getCompiledRequirements();

    const hasRequirements = compiledRequirements.length > 0;

    const formattedRequirements = hasRequirements
      ? formatRequirementsForEmail(compiledRequirements)
      : "";

    const safeInsuredLastName = escapeEmailHtml(insuredLastName);

    const safePolicyNumber = escapeEmailHtml(policyNumber);

    const safeFinancialProfessional = escapeEmailHtml(financialProfessional);

    const safeAccountManager = escapeEmailHtml(accountManager);

    const safeUnderwriter = escapeEmailHtml(underwriter);

    const safeProduct = escapeEmailHtml(product);

    if (hasRequirements) {
      emailOutput.innerHTML = `
      <div style="
        color: #000000;
        font-family:
          'Century Gothic',
          CenturyGothic,
          AppleGothic,
          sans-serif;
        font-size: 11pt;
        line-height: 1.4;
      ">

        <p style="margin: 0 0 10px;">
          Insured: ${insuredName}
        </p>

        <p style="margin: 0 0 10px;">
          Financial Professional:
        </p>

        <div style="
          display: block;
          margin: 0 0 15px;
        ">
          ${mmsd}
        </div>

        <p style="margin: 0 0 18px;">
          Thank you for submitting the above
          referenced life application. We understand
          that you are placing your client's trust in
          MassMutual to provide the appropriate
          financial products that meet their needs.
        </p>

        <p style="margin: 0 0 18px;">
          The Case Manager initial review has been
          completed and found that contractual
          requirements are needed.
        </p>

        <p style="margin: 0 0 18px;"><strong>
          We await the following requirements:
        </strong></p>

        <ul style="
          margin: 0 0 22px;
          padding-left: 25px;
          color: #000000;
          font-family:
            'Century Gothic',
            CenturyGothic,
            AppleGothic,
            sans-serif;
          font-size: 11pt;
        ">
          ${formattedRequirements}
        </ul>

        <p style="margin: 0 0 22px;">
          <strong>
            Please note, a separate email referencing
            any underwriting requirements will be
            sent upon completion of the initial
            underwriting review.
          </strong>
        </p>

        <p style="margin: 0 0 8px;">
          Account Manager:
        </p>

        <p style="margin: 0 0 8px;">
          Underwriter:
        </p>

        <p style="margin: 0 0 22px;">
          Product applied for:
        </p>

        <p style="margin: 0 0 18px;">
          Please forward all documents, forms, exams,
          authorizations, etc. to
          <a
            href="mailto:MMSD_Requirements@MassMutual.com"
            style="color: #000000;"
          >
            MMSD_Requirements@MassMutual.com
          </a>.
        </p>

        <p style="margin: 0 0 18px;">
          A hold for issue will be placed on the
          policy at the time of underwriting approval
          awaiting the firm confirmation of the final
          case design. When you are ready to proceed
          with the issuance of this policy, please let
          your assigned Case Manager know to release
          the hold to place the case in line for
          issue. If you do not want to hold at issue,
          please let your assigned Case Manager know
          and they will release the hold issue
          requirement.
        </p>

        <p style="margin: 0;">
          Thank you in advance for your support and
          business.
        </p>
      </div>
    `;

      return;
    }

    /*
     * ================================================
     * NO-REQUIREMENTS EMAIL TEMPLATE
     * ================================================
     */

    emailOutput.innerHTML = `
    <div style="
      color: #000000;
      font-family:
        'Century Gothic',
        CenturyGothic,
        AppleGothic,
        sans-serif;
      font-size: 11pt;
      line-height: 1.4;
    ">
 <p style="margin: 0 0 10px;">
          Insured: ${insuredName}
        </p>

      <p style="margin: 0 0 15px;">
        Financial Professional:
      </p>

      <div style="
        display: block;
        margin: 0 0 15px;
      ">
        ${mmsd}
      </div>

      <p style="margin: 0 0 18px;">
        Thank you for submitting the above referenced
        life application. We understand that you are
        placing your client's trust in MassMutual to
        provide the appropriate financial products
        that meet their needs.
      </p>


 <p style="margin: 0 0 22px;">
        <strong>The Case Manager initial review has been completed and there are no contractual requirements outstanding at this time.</strong>
      </p>


      <ul style="
          margin: 0 0 22px;
          padding-left: 25px;
          color: #000000;
          font-family:
            'Century Gothic',
            CenturyGothic,
            AppleGothic,
            sans-serif;
          font-size: 11pt;">
        <li> <em><strong>Please note:</strong> a separate email referencing
          any underwriting requirements will be sent
          upon completion of the initial underwriting
          review.</em>
        </li>
        </ul>

      <p style="margin: 0 0 8px;">
        Account Manager:
      </p>

      <p style="margin: 0 0 8px;">
        Underwriter:
      </p>

      <p style="margin: 0 0 22px;">
        Product applied for:
      </p>
 <p style="margin: 0 0 18px;">
          Please forward all documents, forms, exams,
          authorizations, etc. to
          <strong> <a
            href="mailto:MMSD_Requirements@MassMutual.com"
            style="color: #060479;"
          >
            MMSD_Requirements@MassMutual.com
          </a></strong>.
        </p>
      <p style="margin: 0 0 18px;">
        A hold for issue will be placed on the policy
        at the time of underwriting approval awaiting
        the firm confirmation of the final case
        design. When you are ready to proceed with
        the issuance of this policy, please let your
        assigned Case Manager know to release the
        hold to place the case in line for issue. If
        you do not want to hold at issue, please let
        your assigned Case Manager know and they will
        release the hold issue requirement.
      </p>

      <p style="margin: 0;">
        Thank you in advance for your support and
        business.
      </p>
    </div>
  `;
  }

  document.addEventListener(
    "compiledRequirementsUpdated",
    generateInitialReviewEmail,
  );

  const compiledRequirementsField = document.getElementById(
    "compiledRequirements",
  );

  if (compiledRequirementsField) {
    compiledRequirementsField.addEventListener(
      "input",
      generateInitialReviewEmail,
    );

    compiledRequirementsField.addEventListener(
      "change",
      generateInitialReviewEmail,
    );
  }
  if (generateEmailButton) {
    generateEmailButton.addEventListener("click", generateInitialReviewEmail);
  }

  if (copyEmailButton) {
    copyEmailButton.addEventListener("click", async function () {
      const plainText = emailOutput?.innerText?.trim() || "";

      const html = emailOutput?.innerHTML?.trim() || "";

      if (!emailOutput || !plainText) {
        console.warn("There is no email content to copy.");

        return;
      }

      const originalText = copyEmailButton.textContent;

      try {
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({
              "text/html": new Blob([html], {
                type: "text/html",
              }),

              "text/plain": new Blob([plainText], {
                type: "text/plain",
              }),
            }),
          ]);
        } else {
          await navigator.clipboard.writeText(plainText);
        }

        copyEmailButton.textContent = "Copied";

        window.setTimeout(function () {
          copyEmailButton.textContent = originalText;
        }, 1500);
      } catch (error) {
        const range = document.createRange();

        const selection = window.getSelection();

        range.selectNodeContents(emailOutput);

        selection.removeAllRanges();
        selection.addRange(range);

        document.execCommand("copy");

        selection.removeAllRanges();

        copyEmailButton.textContent = "Copied";

        window.setTimeout(function () {
          copyEmailButton.textContent = originalText;
        }, 1500);

        console.warn("Used the fallback email copy method.", error);
      }
    });
  }

  handlePolicyDatingDisplay();
  updateIllustrationGuidance();
  generateInitialReviewNotes();
  generateInitialReviewEmail();
  updateProgress();
});
function cleanGeneratedAmendment(text) {
  return text
    .replace(/\{[^}]+\}/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.])/g, "$1")
    .trim();
}
function getProductAndSystemFromPolicy(policyNumber) {
  const prefix = String(policyNumber || "")
    .replace(/\D/g, "")
    .substring(0, 2);

  switch (prefix) {
    // Whole Life
    case "21":
    case "32":
    case "34":
      return {
        product: "Whole Life",
        system: "WinRisk",
      };

    // Vantage Term
    case "38":
    case "42":
      return {
        product: "Vantage Term",
        system: "TPP",
      };

    // CareChoice
    case "22":
      return {
        product: "CareChoice",
        system: "WinRisk",
      };

    // UL Guard
    case "15":
    case "16":
      return {
        product: "UL Guard",
        system: "WinRisk",
      };

    default:
      return {
        product: "",
        system: "",
      };
  }
}
function updatePolicyLookup() {
  if (!policyNumberField) {
    return;
  }

  const policyNumber = String(policyNumberField.value || "").replace(/\D/g, "");

  const prefix = policyNumber.substring(0, 2);

  let product = "--";

  switch (prefix) {
    case "21":
    case "32":
    case "34":
      product = "Whole Life";
      break;

    case "38":
    case "42":
      product = "Vantage Term";
      break;

    case "22":
      product = "CareChoice";
      break;

    case "15":
    case "16":
      product = "UL Guard";
      break;
  }

  const dashboardProduct = document.getElementById("dashboardProduct");

  if (dashboardProduct) {
    dashboardProduct.textContent = product;
  }

  generateInitialReviewNotes();
}

const policyLookupField = document.getElementById("policyNumber");

function updatePolicyLookup() {
  if (!policyLookupField) {
    return;
  }

  const policyNumber = String(policyLookupField.value || "").replace(/\D/g, "");

  const prefix = policyNumber.substring(0, 2);

  let product = "--";

  switch (prefix) {
    case "21":
    case "32":
    case "34":
      product = "Whole Life";
      break;

    case "38":
    case "42":
      product = "Vantage Term";
      break;

    case "22":
      product = "CareChoice";
      break;

    case "15":
    case "16":
      product = "UL Guard";
      break;
  }

  const dashboardProduct = document.getElementById("dashboardProduct");

  if (dashboardProduct) {
    dashboardProduct.textContent = product;
  }
}

if (policyLookupField) {
  policyLookupField.addEventListener("input", updatePolicyLookup);
}
