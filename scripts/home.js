
document.addEventListener("DOMContentLoaded", () => {
  const beginButton = document.getElementById("beginButton");

  const launcherSection = document.getElementById("launcherSection");

  if (beginButton && launcherSection) {
    beginButton.addEventListener("click", () => {
      launcherSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }
});