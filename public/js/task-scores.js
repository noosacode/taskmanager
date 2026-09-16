// -------------------------
// TASK SCORES PAGE
// -------------------------

const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get("projectId");

const projectTitle = document.getElementById("project-title");
const tasksList = document.getElementById("tasks-list");
const saveScoresBtn = document.getElementById("save-scores-btn");

let tasks = [];

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

    projectTitle.textContent = `${project.title} — Task Scores`;

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

    tasks = await response.json();

    renderTasks();
  } catch (err) {
    console.error(err);
    tasksList.textContent = "Error loading tasks";
  }
}

// -------------------------
// RENDER TASKS
// -------------------------

function renderTasks() {
  tasksList.innerHTML = "";

  if (tasks.length === 0) {
    tasksList.textContent = "No tasks added yet.";
    return;
  }

  tasks.forEach((task) => {
    const row = document.createElement("div");

    row.className = "item-row";

    const taskName = document.createElement("span");
    taskName.textContent = task.name;
    taskName.className = "item-name";

    const scoreInput = document.createElement("input");
    scoreInput.type = "number";
    scoreInput.min = "0";
    scoreInput.max = "99";
    scoreInput.value = task.priorityScore;
    scoreInput.dataset.taskId = task._id;

    row.appendChild(taskName);
    row.appendChild(scoreInput);

    tasksList.appendChild(row);
  });
}

// -------------------------
// SAVE SCORES
// -------------------------

saveScoresBtn.addEventListener("click", async () => {
  try {
    const inputs = tasksList.querySelectorAll("input");

    for (const input of inputs) {
      const taskId = input.dataset.taskId;
      const score = Number(input.value);

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          priorityScore: score,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not save task score");
      }
    }

    window.location.href = `/html/project.html?id=${projectId}`;
  } catch (err) {
    console.error(err);
    alert("Error saving scores");
  }
});

// -------------------------
// START
// -------------------------

if (!projectId) {
  projectTitle.textContent = "No project selected";
} else {
  loadProject();
}
