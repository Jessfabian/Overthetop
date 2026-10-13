(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const files = { app: null, ill: null };
  const labels = {
    insuredName: "Insured name", plan: "Plan", faceAmount: "Face amount",
    apl: "Automatic Premium Loan", loanRate: "Loan rate",
    dividend: "Dividend option", waiver: "Waiver of Premium", gir: "GIR",
    rtr: "RTR", lisr: "LISR", lisrTfa: "LISR Target Face Amount",
    lisrModal: "LISR Modal Payment", lisrLumpSum: "LISR Unscheduled Lump Sum",
    alirModal: "ALIR Modal Payment", alirDuration: "ALIR Payment Duration",
    alirUnscheduled: "ALIR Unscheduled", frequency: "Payment frequency",
    signedDate: "Signature date", signatureEvidence: "Signature evidence"
  };

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[char]);
  }

  function showError(message = "") {
    $("errorBox").textContent = message;
    $("errorBox").style.display = message ? "block" : "none";
  }

  function updateButtons() {
    $("extractBtn").disabled = !(files.app && files.ill);
    $("runStatus").textContent = files.app && files.ill ? "Ready for Python extraction" : "Waiting for two PDFs";
    $("runStatus").className = `status ${files.app && files.ill ? "good" : "pending"}`;
  }

  function setFile(kind, file) {
    if (!file || !/\.pdf$/i.test(file.name)) {
      showError("Please select a PDF file.");
      return;
    }
    showError();
    files[kind] = file;
    $(`${kind}Meta`).textContent = `${file.name} • ${(file.size / 1048576).toFixed(2)} MB`;
    updateButtons();
  }

  function setupDrop(kind) {
    const zone = $(`${kind}Drop`);
    const input = $(`${kind}File`);
    input.addEventListener("change", () => setFile(kind, input.files[0]));
    ["dragenter", "dragover"].forEach((name) => zone.addEventListener(name, (event) => {
      event.preventDefault();
      zone.classList.add("drag");
    }));
    ["dragleave", "drop"].forEach((name) => zone.addEventListener(name, (event) => {
      event.preventDefault();
      zone.classList.remove("drag");
    }));
    zone.addEventListener("drop", (event) => setFile(kind, event.dataTransfer.files[0]));
  }

  function pythonFieldToUi(entry = {}) {
    return {
      v: entry.value || "",
      c: Number(entry.confidence) || 0,
      pageNumber: entry.page_number || "",
      source: entry.source || "",
      matchedLabel: entry.matched_label || "",
      excluded: Boolean(entry.excluded),
      warnings: entry.warnings || []
    };
  }

  function renderFields(kind, documentResult) {
    const host = $(`${kind}Fields`);
    host.innerHTML = "";
    const fields = documentResult.fields || {};
    Object.keys(labels).forEach((key) => {
      const entry = pythonFieldToUi(fields[key]);
      const card = document.createElement("article");
      const confidenceClass = entry.excluded ? "excluded" : entry.c >= 85 ? "high" : entry.c < 50 ? "low" : "medium";
      card.className = `field ${confidenceClass}`;
      card.innerHTML = `
        <div class="field-heading">
          <strong>${escapeHtml(labels[key])}</strong>
          <span class="confidence">${entry.excluded ? "N/A" : `${entry.c}%`}</span>
        </div>
        <input data-kind="${kind}" data-key="${key}" value="${escapeHtml(entry.v)}" aria-label="${escapeHtml(labels[key])}">
        <small>${entry.pageNumber ? `Page ${entry.pageNumber} • ` : ""}${escapeHtml(entry.source || "No source identified")}</small>
      `;
      host.appendChild(card);
    });
  }

  function extractedText(documentResult) {
    return (documentResult.pages || []).map((page) => `PAGE ${page.page_number} [${page.source}]\n${page.text || ""}`).join("\n\n");
  }

  function renderResults(report) {
    const summary = report.summary || {};
    $("summaryCards").hidden = false;
    $("matchCount").textContent = summary.matches || 0;
    $("mismatchCount").textContent = summary.mismatches || 0;
    $("reviewCount").textContent = summary.reviews || 0;
    $("excludedCount").textContent = summary.excluded || 0;

    const rows = report.comparison || [];
    $("results").className = "table-wrap";
    $("results").innerHTML = `
      <table>
        <thead><tr><th>Field</th><th>Part 1</th><th>Illustration</th><th>Result</th><th>Note</th></tr></thead>
        <tbody>${rows.map((row) => {
          const cls = row.status === "Match" ? "good" : row.status === "Mismatch" || row.status === "Failed" ? "bad" : "warn";
          return `<tr>
            <td>${escapeHtml(row.label)}</td>
            <td>${escapeHtml(row.application)}</td>
            <td>${escapeHtml(row.illustration)}</td>
            <td><span class="status ${cls}">${escapeHtml(row.status)}</span></td>
            <td>${escapeHtml(row.note)}</td>
          </tr>`;
        }).join("")}</tbody>
      </table>`;
  }

  async function validate() {
    showError();
    $("extractBtn").disabled = true;
    $("runStatus").textContent = "Python is extracting PDFs and running OCR…";
    $("runStatus").className = "status warn";
    $("appProgress").style.width = "45%";
    $("illProgress").style.width = "45%";

    const form = new FormData();
    form.append("application", files.app);
    form.append("illustration", files.ill);
    form.append("state", $("state").value);

    try {
      const response = await fetch("/api/validate", { method: "POST", body: form });
      const report = await response.json();
      if (!response.ok) throw new Error(report.error || "Validation failed.");

      if (report.application.errors?.length || report.illustration.errors?.length) {
        throw new Error([...report.application.errors, ...report.illustration.errors].join(" "));
      }

      renderFields("app", report.application);
      renderFields("ill", report.illustration);
      $("appText").value = extractedText(report.application);
      $("illText").value = extractedText(report.illustration);
      renderResults(report);
      $("appProgress").style.width = "100%";
      $("illProgress").style.width = "100%";
      $("runStatus").textContent = "Extraction and validation complete";
      $("runStatus").className = "status good";
    } catch (error) {
      console.error(error);
      showError(error.message || "The Python validation service could not process the PDFs.");
      $("runStatus").textContent = "Validation failed";
      $("runStatus").className = "status bad";
    } finally {
      $("extractBtn").disabled = false;
    }
  }

  async function healthCheck() {
    try {
      const response = await fetch("/api/health");
      if (!response.ok) throw new Error();
      $("serverBadge").textContent = "Python service ready";
      $("serverBadge").className = "status good";
    } catch {
      $("serverBadge").textContent = "Python service unavailable";
      $("serverBadge").className = "status bad";
      showError("Start the site with: python app.py. Do not open index.html directly.");
    }
  }

  $("state").addEventListener("change", () => {
    const ny = $("state").value === "NY";
    $("ruleBadge").textContent = ny ? "NY Reg 74 checks enabled" : "Standard rules";
    $("ruleBadge").className = `status ${ny ? "warn" : "pending"}`;
  });
  $("extractBtn").addEventListener("click", validate);
  $("resetBtn").addEventListener("click", () => window.location.reload());
  setupDrop("app");
  setupDrop("ill");
  updateButtons();
  healthCheck();
})();
