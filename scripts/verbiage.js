const $ = id => document.getElementById(id), L = window.requirementLibrary, A = window.amendmentLibrary; let R = [], M = []; function categories() { category.innerHTML = Object.keys(L).map(x => `<option>${x}</option>`).join(""); issues(); amendType.innerHTML = A.map((x, i) => `<option value="${i}">${x[0]}</option>`).join("") } function issues() { issue.innerHTML = L[category.value].map((x, i) => `<option value="${i}">${x[0]}</option>`).join("") } function values() { return { item: item.value, value1: value1.value, value2: value2.value, detail: detail.value } } function render() { count.textContent = R.length; reqList.innerHTML = R.length ? R.map(x => `<li>${x}</li>`).join("") : '<li class="empty">No requirements added yet.</li>' } function build() {
  let intro = comm.value === "Initial Review" ? "Thank you for submitting the above referenced life application. The initial review has been completed." : comm.value === "Interim Review" ? "The interim review has been completed. The following items remain outstanding:" : comm.value === "Contractual Follow-Up" ? "Please provide the following outstanding contractual requirements:" : "Contractual Requirements:"; let req = R.length ? R.map(x => `• ${x}`).join("

"):"• No requirements added.";let am=M.length?`

Amendments Applied:
    ${
    M.map(x => `• ${x}`).join("

")}`:"";output.value=`${insured.value||"[Insured Name]"} | ${policy.value||"[Policy Number]"}

${ intro }

Contractual Requirements:
      ${ req }${ am }`}category.onchange=issues;addReq.onclick=()=>{R.push(fillTemplate(L[category.value][+issue.value][1],values()));render()};removeReq.onclick=()=>{R.pop();render()};clearReq.onclick=()=>{R=[];render()};addAmend.onclick=()=>{M.push(fillTemplate(A[+amendType.value][1],{item:amendItem.value,value2:amendValue.value}));build()};removeAmend.onclick=()=>{M.pop();build()};clearAmend.onclick=()=>{M=[];build()};generate.onclick=build;clearOutput.onclick=()=>output.value="";copy.onclick=async()=>{await navigator.clipboard.writeText(output.value);copyStatus.textContent="Email copied."};categories();render();