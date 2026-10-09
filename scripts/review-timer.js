document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "initialReviewTimerState";
  const HISTORY_KEY = "initialReviewTimerHistory";

  const timerCard = document.querySelector(".review-timer");

  const hoursDisplay = document.getElementById("timerHours");
  const minutesDisplay = document.getElementById("timerMinutes");
  const secondsDisplay = document.getElementById("timerSeconds");

  const timerStatus = document.getElementById("timerStatus");
  const timerMessage = document.getElementById("timerMessage");

  const startButton = document.getElementById("startReviewTimer");
  const pauseButton = document.getElementById("pauseReviewTimer");
  const completeButton = document.getElementById("completeReviewTimer");

  const sessionDetails = document.getElementById("timerSessionDetails");
  const timerStartedAt = document.getElementById("timerStartedAt");
  const timerPausedDuration = document.getElementById("timerPausedDuration");

  if (
    !timerCard ||
    !hoursDisplay ||
    !minutesDisplay ||
    !secondsDisplay ||
    !timerStatus ||
    !timerMessage ||
    !startButton ||
    !pauseButton ||
    !completeButton
  ) {
    return;
  }

  let timerInterval = null;

  let timerState = {
    status: "ready",
    startedAt: null,
    accumulatedMilliseconds: 0,
    pausedAt: null,
    totalPausedMilliseconds: 0,
  };

  function loadTimerState() {
    const savedState = localStorage.getItem(STORAGE_KEY);

    if (!savedState) {
      return;
    }

    try {
      timerState = {
        ...timerState,
        ...JSON.parse(savedState),
      };
    } catch (error) {
      console.error("Unable to restore timer state:", error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function saveTimerState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timerState));
  }

  function padNumber(value) {
    return String(value).padStart(2, "0");
  }

  function getElapsedMilliseconds() {
    if (timerState.status === "running" && timerState.startedAt) {
      return (
        timerState.accumulatedMilliseconds + (Date.now() - timerState.startedAt)
      );
    }

    return timerState.accumulatedMilliseconds;
  }

  function formatDuration(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours: padNumber(hours),
      minutes: padNumber(minutes),
      seconds: padNumber(seconds),
    };
  }

  function formatMinutesAndSeconds(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${padNumber(minutes)}:${padNumber(seconds)}`;
  }

  function renderTimer() {
    const elapsed = formatDuration(getElapsedMilliseconds());

    hoursDisplay.textContent = elapsed.hours;
    minutesDisplay.textContent = elapsed.minutes;
    secondsDisplay.textContent = elapsed.seconds;

    timerPausedDuration.textContent = formatMinutesAndSeconds(
      timerState.totalPausedMilliseconds,
    );
  }

  function setStatus(status) {
    timerStatus.className = "timer-status";

    timerCard.classList.toggle("is-running", status === "running");

    switch (status) {
      case "running":
        timerStatus.textContent = "Running";
        timerStatus.classList.add("timer-status-running");



        startButton.textContent = "Review in Progress";
        startButton.disabled = true;

        pauseButton.textContent = "Pause";
        pauseButton.disabled = false;

        completeButton.disabled = false;
        sessionDetails.hidden = false;
        break;

      case "paused":
        timerStatus.textContent = "Paused";
        timerStatus.classList.add("timer-status-paused");



        startButton.textContent = "Resume Review";
        startButton.disabled = false;

        pauseButton.textContent = "Paused";
        pauseButton.disabled = true;

        completeButton.disabled = false;
        sessionDetails.hidden = false;
        break;

      case "complete":
        timerStatus.textContent = "Complete";
        timerStatus.classList.add("timer-status-complete");



        startButton.textContent = "Start New Review";
        startButton.disabled = false;

        pauseButton.textContent = "Pause";
        pauseButton.disabled = true;

        completeButton.disabled = true;
        sessionDetails.hidden = false;
        break;

      default:
        timerStatus.textContent = "Ready";
        timerStatus.classList.add("timer-status-ready");

        timerMessage.textContent =
          "Start the timer when the initial review begins.";

        startButton.textContent = "Start Review";
        startButton.disabled = false;

        pauseButton.textContent = "Pause";
        pauseButton.disabled = true;

        completeButton.disabled = true;
        sessionDetails.hidden = true;
    }
  }

  function startInterval() {
    clearInterval(timerInterval);

    timerInterval = window.setInterval(() => {
      renderTimer();
      saveTimerState();
    }, 1000);
  }

  function startOrResumeTimer() {
    if (timerState.status === "ready" || timerState.status === "complete") {
      timerState = {
        status: "running",
        startedAt: Date.now(),
        accumulatedMilliseconds: 0,
        pausedAt: null,
        totalPausedMilliseconds: 0,
      };

      timerStartedAt.textContent = new Date(
        timerState.startedAt,
      ).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    } else if (timerState.status === "paused") {
      const resumeTime = Date.now();

      if (timerState.pausedAt) {
        timerState.totalPausedMilliseconds += resumeTime - timerState.pausedAt;
      }

      timerState.startedAt = resumeTime;
      timerState.pausedAt = null;
      timerState.status = "running";
    }

    saveTimerState();
    setStatus("running");
    startInterval();
    renderTimer();
  }

  function pauseTimer() {
    if (timerState.status !== "running") {
      return;
    }

    timerState.accumulatedMilliseconds = getElapsedMilliseconds();

    timerState.startedAt = null;
    timerState.pausedAt = Date.now();
    timerState.status = "paused";

    clearInterval(timerInterval);

    saveTimerState();
    setStatus("paused");
    renderTimer();
  }

  function getCurrentCaseSnapshot() {
    return {
      policyNumber: document.getElementById("policyNumber")?.value.trim() || "",

      contractState: document.getElementById("contractState")?.value || "",

      formCount: Number(
        document.getElementById("dashboardFormCount")?.textContent || 0,
      ),

      issueCount: Number(
        document.getElementById("dashboardIssueCount")?.textContent || 0,
      ),

      replacement: document.getElementById("replacement")?.checked || false,

      tlirRequested: document.getElementById("tlirRequested")?.checked || false,

      additionalInsured:
        document.getElementById("additionalInsured")?.checked || false,

      internalTermReplacement:
        document.getElementById("internalTermReplacement")?.checked || false,
    };
  }

  function saveCompletedReview(durationMilliseconds) {
    let history = [];

    try {
      history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch (error) {
      history = [];
    }

    const caseSnapshot = getCurrentCaseSnapshot();

    history.push({
      id: window.crypto?.randomUUID?.() || `review-${Date.now()}`,

      completedAt: new Date().toISOString(),

      activeDurationMilliseconds: durationMilliseconds,

      pausedDurationMilliseconds: timerState.totalPausedMilliseconds,

      activeDurationMinutes: Math.round(durationMilliseconds / 60000),

      ...caseSnapshot,
    });

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

    window.dispatchEvent(
      new CustomEvent("initialReviewTimerCompleted", {
        detail: history[history.length - 1],
      }),
    );
  }

  function completeTimer() {
    if (timerState.status !== "running" && timerState.status !== "paused") {
      return;
    }

    if (timerState.status === "running") {
      timerState.accumulatedMilliseconds = getElapsedMilliseconds();
    }

    const completedDuration = timerState.accumulatedMilliseconds;

    clearInterval(timerInterval);

    saveCompletedReview(completedDuration);

    timerState.status = "complete";
    timerState.startedAt = null;
    timerState.pausedAt = null;

    saveTimerState();
    setStatus("complete");
    renderTimer();
  }

  startButton.addEventListener("click", startOrResumeTimer);

  pauseButton.addEventListener("click", pauseTimer);

  completeButton.addEventListener("click", completeTimer);

  loadTimerState();
  setStatus(timerState.status);
  renderTimer();

  if (timerState.status === "running") {
    startInterval();
  }

  if (timerState.startedAt) {
    timerStartedAt.textContent = new Date(
      timerState.startedAt,
    ).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }
});
