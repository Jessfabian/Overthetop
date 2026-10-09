window.requirementLibrary = {
  "Application / Part 1": [
    ["Part 1 missing", "Please submit the applicable Part 1 application."],
    [
      "Pages missing or illegible",
      "Please resubmit all pages of the applicable form. The submitted copy is incomplete or not fully legible.",
    ],
    ["Question unanswered", "Please provide a response to Question {item}."],
    [
      "Information inconsistent",
      "Please clarify the inconsistent information for {item}. Application/current value: {value1}. Correct value: {value2}.",
    ],
  ],
  "Part 2 / Medical": [
    [
      "Part 2 or CMI missing",
      "Please submit the applicable Part 2 or medical application.",
    ],
    [
      "Medical question unanswered",
      "Please provide a response to Question {item} of the Part 2 or medical application.",
    ],
    [
      "Yes response lacks details",
      "Please provide complete details for the Yes response to Question {item}. {detail}",
    ],
  ],
  "HIPAA / Authorizations": [
    ["HIPAA missing", "Please submit a completed HIPAA Authorization."],
    [
      "HIPAA incomplete or NIGO",
      "Please submit a corrected HIPAA Authorization. The submitted form is incomplete or not in good order.",
    ],
    ["Other authorization", "Please submit or correct {item}. {detail}"],
  ],
  "Producer Statement": [
    [
      "Producer Statement missing",
      "Please submit a completed Producer Statement.",
    ],
    [
      "Replacement answer inconsistent",
      "Please submit an updated Producer Statement with the replacement question corrected, initialed, and dated by the advisor.",
    ],
    [
      "Premium financing incomplete",
      "Please submit an updated Producer Statement with the premium-financing question answered and initialed.",
    ],
  ],
  "Owner / Beneficiary": [
    [
      "Owner Designation F5248",
      "Please submit or correct the Owner Designation Form (F5248).",
    ],
    [
      "Trust documentation",
      "Please provide the applicable trust documentation or Trust Certificate.",
    ],
    [
      "Beneficiary Designation F5159",
      "Please submit or correct the Beneficiary Designation Form (F5159).",
    ],
    [
      "Beneficiary information incomplete",
      "Please provide complete beneficiary information. {detail}",
    ],
  ],
  "Replacement / 1035": [
    [
      "Replacement status inconsistent",
      "Please resolve the replacement-status inconsistency among the application, Producer Statement, and replacement documentation.",
    ],
    [
      "State replacement form",
      "Please submit or correct the applicable state replacement form: {item}.",
    ],
    [
      "1035 information missing",
      "Please submit the applicable 1035 exchange form and provide the missing exchange information.",
    ],
  ],
  "Payment / Illustration": [
    [
      "Save Age clarification",
      "Please confirm whether the policy should be backdated to save age or issued with a current policy date. {detail}",
    ],
    [
      "Signed illustration required",
      "Please submit the signed sales illustration or presentation used at the time of application.",
    ],
    [
      "Application/illustration mismatch",
      "Please clarify the discrepancy for {item}. Application: {value1}. Illustration: {value2}.",
    ],
  ],
  "Supplemental / State Form": [
    ["Foreign Supplement", "Please submit or correct the Foreign Supplement."],
    [
      "Source of Funds Questionnaire",
      "Please submit or correct the Source of Funds Questionnaire.",
    ],
    ["Other form", "Please submit or correct {item}. {detail}"],
  ],
  "Signatures / Delivery": [
    [
      "Insured signature",
      "Please submit the application or form with the required insured signature.",
    ],
    [
      "Owner signature",
      "Please submit the application or form with the required owner signature.",
    ],
    [
      "City/state signed",
      "Please provide the city and state where {item} signed.",
    ],
    ["Other delivery requirement", "Please submit {item}. {detail}"],
  ],
  Custom: [["Custom requirement", "{detail}"]],
};
window.amendmentLibrary = [
  ["Question amendment", "Question {item} of the Part 1 is {value2}."],
  [
    "Insured name",
    "The insured’s name reflected on all forms in the application should read {value2}.",
  ],
  [
    "Owner name",
    "The owner’s name reflected on all forms in the application should read {value2}.",
  ],
  [
    "Address",
    "The insured’s or owner’s address reflected on all forms in the application should read {value2}.",
  ],
  ["Custom", "{value2}"],
];
window.reviewGuide = [
  {
    title: "Case and System Setup",
    items: [
      "Confirm policy and insured information",
      "Confirm WinRisk or TPP",
      "Confirm eSigned or wet-signed workflow",
      "Confirm contract state and product",
      "Review companion-case information",
    ],
  },
  {
    title: "TreX Images and Application Package",
    items: [
      "Review every image in TreX",
      "Confirm all Part 1 pages are present and legible",
      "Confirm correct state-specific version",
      "Confirm images are properly indexed",
      "Review cover letters, emails, and Misc. Contractual images",
    ],
  },
  {
    title: "Application Review",
    items: [
      "Review Part 1 required questions",
      "Review Part 2 or medical application",
      "Review HIPAA and authorizations",
      "Review Producer Statement",
      "Compare application and illustration",
    ],
  },
  {
    title: "Ownership and Special Processing",
    items: [
      "Review owner and beneficiary arrangements",
      "Review trust or entity documents",
      "Review replacement and 1035 information",
      "Review payment, billing, and policy dating",
      "Review state-specific and supplemental forms",
    ],
  },
  {
    title: "Initial Review Completion",
    items: [
      "Add contractual requirements",
      "Prepare permitted Case Manager amendments",
      "Document clarifications",
      "Complete General Note information",
      "Complete BINGO and case status",
      "Prepare Initial Review email",
    ],
  },
];
window.fillTemplate = (t, v) =>
  String(t)
    .replaceAll("{item}", v.item || "[question/form/item]")
    .replaceAll("{value1}", v.value1 || "[current value]")
    .replaceAll("{value2}", v.value2 || "[correct value]")
    .replaceAll("{detail}", v.detail || "")
    .trim();
