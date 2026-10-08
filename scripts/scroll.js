document.getElementById("questionState").hidden = false;

document.getElementById("questionState").scrollIntoView({
  behavior: "smooth",
});




// Launch Workbench action button

document.getElementById("launchWorkbench").addEventListener("click", () => {
  document.getElementById("reviewWorkbench").hidden = false;

  document.getElementById("reviewWorkbench").scrollIntoView({
    behavior: "smooth",
  });
});


//Scrolling action

document.querySelectorAll("[data-product]").forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById("questionState").hidden = false;

    document.getElementById("questionState").scrollIntoView({
      behavior: "smooth",
    });
  });
});


wizardProgress.classList.add("visible");