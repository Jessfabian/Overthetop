document.addEventListener("DOMContentLoaded", () => {
  const beginButton = document.getElementById("beginReviewButton");

  const questionOne = document.getElementById("questionProduct");

  if (beginButton && questionOne) {
    beginButton.addEventListener("click", () => {
     window.scrollTo({
       top: questionOne.offsetTop - 100,
       behavior: "smooth",
     });

    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    },
    {
      threshold: 0.25,
    },
  );

  document.querySelectorAll(".question-panel").forEach((panel) => {
    observer.observe(panel);
  });
});

wizardProgress.classList.add("visible");

