// -------------------------
// SESSION PAGE
// -------------------------

const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get("id");

// -------------------------
// ELEMENTS
// -------------------------

const sessionTitle = document.getElementById("session-title");
const tasksList = document.getElementById("tasks-list");

const editScoresBtn = document.getElementById("edit-scores-btn");
const completedTasksBtn = document.getElementById("completed-tasks-btn");

// -------------------------
// LOAD SESSION
// -------------------------

async function loadSession() {
  try {
    const response = await fetch(`/api/sessions/${sessionId}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Could not load session");
    }

    const session = await response.json();

    sessionTitle.textContent = session.name;

    await loadTasks();
  } catch (err) {
    console.error(err);
    sessionTitle.textContent = "Error loading session";
  }
}

// -------------------------
// LOAD TASKS
// -------------------------

async function loadTasks() {
  try {
    const response = await fetch(`/api/sessions/${sessionId}/tasks`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Could not load tasks");
    }

    const tasks = await response.json();

    renderTasks(tasks);
  } catch (err) {
    console.error(err);
    tasksList.textContent = "Error loading tasks";
  }
}

// -------------------------
// RENDER TASKS
// -------------------------

function renderTasks(tasks) {
  tasksList.innerHTML = "";

  if (tasks.length === 0) {
    tasksList.textContent = "No tasks added yet.";
    return;
  }

  tasks.forEach((task) => {
    const row = document.createElement("div");

    row.className = "item-row";

    const taskLink = document.createElement("a");
    taskLink.href = `/html/task-details.html?id=${task._id}`;
    taskLink.textContent = task.name;
    taskLink.className = "item-name";

    const score = document.createElement("span");
    score.textContent = task.priorityScore;
    score.className = "item-score";

    row.appendChild(taskLink);
    row.appendChild(score);

    tasksList.appendChild(row);
  });
}

// -------------------------
// EDIT SCORES
// -------------------------

editScoresBtn.addEventListener("click", () => {
  window.location.href = `/html/session-scores.html?sessionId=${sessionId}`;
});

// -------------------------
// COMPLETED TASKS
// -------------------------

completedTasksBtn.addEventListener("click", () => {
  window.location.href = `/html/completed-tasks.html?sessionId=${sessionId}`;
});

// -------------------------
// START
// -------------------------

if (!sessionId) {
  sessionTitle.textContent = "No session selected";
} else {
  loadSession();
}
