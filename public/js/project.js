// -------------------------
// PROJECT PAGE
// -------------------------

const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get("id");

// -------------------------
// ELEMENTS
// -------------------------

const projectTitle = document.getElementById("project-title");
const tasksList = document.getElementById("tasks-list");

const addTaskBtn = document.getElementById("create-task-btn");
const editTasksBtn = document.getElementById("task-scores-btn");
const projectDetailsBtn = document.getElementById("project-details-btn");
const completedTasksBtn = document.getElementById("completed-tasks-btn");

// -------------------------
// LOAD PROJECT
// -------------------------

async function loadProject() {
  try {
    const response = await fetch(`/api/projects/${projectId}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Could not load project");
    }

    const project = await response.json();

    renderProject(project);
    await loadTasks();
  } catch (err) {
    console.error(err);
    projectTitle.textContent = "Error loading project";
  }
}

// -------------------------
// LOAD TASKS
// -------------------------

async function loadTasks() {
  try {
    const response = await fetch(`/api/projects/${projectId}/tasks`, {
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
// RENDER PROJECT
// -------------------------

function renderProject(project) {
  projectTitle.textContent = project.title;
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
// ADD TASK
// -------------------------

addTaskBtn.addEventListener("click", () => {
  window.location.href = `/html/create-task.html?projectId=${projectId}`;
});

// -------------------------
// EDIT TASKS
// -------------------------

editTasksBtn.addEventListener("click", () => {
  window.location.href = `/html/task-scores.html?projectId=${projectId}`;
});

// -------------------------
// PROJECT DETAILS
// -------------------------

projectDetailsBtn.addEventListener("click", () => {
  window.location.href = `/html/project-details.html?id=${projectId}`;
});

// -------------------------
// COMPLETED TASKS
// -------------------------

completedTasksBtn.addEventListener("click", () => {
  window.location.href = `/html/completed-tasks.html?projectId=${projectId}`;
});

// -------------------------
// START
// -------------------------

if (!projectId) {
  projectTitle.textContent = "No project selected";
} else {
  loadProject();
}
