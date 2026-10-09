document.getElementById("profileProduct").textContent = caseProfile.product;

document.getElementById("profileState").textContent = caseProfile.state;

document.getElementById("profileBOT").textContent = caseProfile.bot;

document.getElementById("profileReplacement").textContent =
  caseProfile.replacement;

document.getElementById("profileInsured").textContent = caseProfile.insured;


timerStatusBadge.innerHTML =
  '<span class="timer-status-dot paused"></span>Paused';