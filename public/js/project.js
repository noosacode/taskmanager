// -------------------------
// PROJECT PAGE LOGIC
// -------------------------

// Get project ID from URL
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get("id");

// Elements
const projectTitle = document.getElementById("project-title");
const projectDescription = document.getElementById("project-description");
const projectScore = document.getElementById("project-score");
const tasksList = document.getElementById("tasks-list");

const addTaskBtn = document.getElementById("add-task-btn");
const completeProjectBtn = document.getElementById("complete-project-btn");
const deleteProjectBtn = document.getElementById("delete-project-btn");

// -------------------------
// LOAD PROJECT
// -------------------------

async function loadProject() {
  try {
    const response = await fetch(`/api/projects/${projectId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const project = await response.json();

    renderProject(project);
    renderTasks(project.tasks);
  } catch (err) {
    console.error(err);
    alert("Error loading project");
  }
}

// -------------------------
// RENDER PROJECT
// -------------------------

function renderProject(project) {
  projectTitle.textContent = project.title;
  projectDescription.textContent = project.description;
  projectScore.textContent = `Project Score: ${project.projectScore}`;
}

// -------------------------
// RENDER TASKS
// -------------------------

function renderTasks(tasks) {
  tasksList.innerHTML = "";

  tasks.forEach((task) => {
    const div = document.createElement("div");
    div.className = "card";
    div.style.marginBottom = "15px";

    div.innerHTML = `
            <h3>${task.name}</h3>
            <p>${task.details}</p>
            <p>Sequence Score: ${task.sequenceScore}</p>
            <p>Focus Score: ${task.focusScore}</p>

            <button class="btn-primary" onclick="completeTask('${task._id}')">
                Complete Task
            </button>

            <button class="btn-secondary" onclick="deleteTask('${task._id}')">
                Delete Task
            </button>
        `;

    tasksList.appendChild(div);
  });
}

// -------------------------
// ADD TASK
// -------------------------

addTaskBtn.addEventListener("click", async () => {
  const name = document.getElementById("task-name").value;
  const details = document.getElementById("task-details").value;

  if (!name.trim()) {
    alert("Task name required");
    return;
  }

  try {
    const response = await fetch(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ name, details }),
    });

    if (response.ok) {
      loadProject();
      document.getElementById("task-name").value = "";
      document.getElementById("task-details").value = "";
    } else {
      alert("Error adding task");
    }
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
});

// -------------------------
// COMPLETE TASK
// -------------------------

async function completeTask(taskId) {
  try {
    const response = await fetch(`/api/tasks/${taskId}/complete`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.ok) {
      loadProject();
    } else {
      alert("Error completing task");
    }
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}

// -------------------------
// DELETE TASK
// -------------------------

async function deleteTask(taskId) {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.ok) {
      loadProject();
    } else {
      alert("Error deleting task");
    }
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}

// -------------------------
// COMPLETE PROJECT
// -------------------------

completeProjectBtn.addEventListener("click", async () => {
  if (!confirm("Complete entire project?")) return;

  try {
    const response = await fetch(`/api/projects/${projectId}/complete`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.ok) {
      alert("Project completed!");
      window.location.href = "projects.html";
    } else {
      alert("Error completing project");
    }
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
});

// -------------------------
// DELETE PROJECT
// -------------------------

deleteProjectBtn.addEventListener("click", async () => {
  if (!confirm("Delete this project?")) return;

  try {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.ok) {
      alert("Project deleted");
      window.location.href = "projects.html";
    } else {
      alert("Error deleting project");
    }
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
});

// -------------------------
// INIT
// -------------------------

loadProject();
