const caseRecord = {
  caseId: Date.now().toString(),

  insuredName: document.getElementById("insuredName")?.value || "Unknown",

  product: caseProfile.product,

  state: caseProfile.state,

  bot: caseProfile.bot,

  replacement: caseProfile.replacement,

  insuredType: caseProfile.insured,

  status: "Initial Review",

  createdDate: new Date().toLocaleDateString(),

  notes: [],

  requirements: [],

  amendments: [],
};
