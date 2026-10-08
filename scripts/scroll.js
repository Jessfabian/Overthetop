document.addEventListener("DOMContentLoaded", function () {
  const beginButton = document.getElementById("beginReviewButton");
  const questionOne = document.getElementById("questionProduct");

  if (beginButton && questionOne) {
    beginButton.addEventListener("click", function () {
      window.scrollTo({
        top: questionOne.offsetTop - 100,
        behavior: "smooth",
      });
    });
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    },
    {
      threshold: 0.25,
    },
  );

  document.querySelectorAll(".question-panel").forEach(function (panel) {
    observer.observe(panel);
  });
});
