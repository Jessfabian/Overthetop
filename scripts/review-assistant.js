document.addEventListener("DOMContentLoaded", () => {
  console.log("Assistant Loaded");

  const response = document.getElementById("assistantResponse");

  document.querySelectorAll(".assistant-action").forEach((button) => {
    button.addEventListener("click", () => {
      response.innerHTML = "Button clicked: " + button.textContent;
    });
  });
});
