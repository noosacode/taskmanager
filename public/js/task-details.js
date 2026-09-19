// -------------------------
// TASK DETAILS PAGE
// -------------------------

const urlParams = new URLSearchParams(window.location.search);
const taskId = urlParams.get("id");

const taskTitle = document.getElementById("task-title");
const taskDescription = document.getElementById("task-description");
const taskInfo = document.getElementById("task-info");
const taskNotes = document.getElementById("task-notes");

const completeTaskBtn = document.getElementById("complete-task-btn");
const deleteTaskBtn = document.getElementById("delete-task-btn");
const backBtn = document.getElementById("back-btn");
const editTaskBtn = document.getElementById("edit-task-btn");
const projectBtn = document.getElementById("project-btn");

// -------------------------
// LOAD TASK
// -------------------------

async function loadTask() {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Could not load task");
    }

    const task = await response.json();

    renderTask(task);
  } catch (err) {
    console.error(err);
    taskTitle.textContent = "Error loading task";
    taskDescription.textContent = "";
    taskInfo.textContent = "";
    taskNotes.textContent = "";
  }
}

// -------------------------
// RENDER TASK
// -------------------------

function renderTask(task) {
  taskTitle.textContent = task.name;

  taskDescription.textContent = task.description || "No description.";

  taskNotes.textContent = task.notes || "No notes.";

  projectBtn.dataset.projectId = task.projectId._id;

  taskInfo.innerHTML = "";

  const projectLine = document.createElement("p");
  const projectLabel = document.createElement("strong");
  projectLabel.textContent = "Project: ";

  const projectLink = document.createElement("a");
  projectLink.href = `/html/project.html?id=${task.projectId._id}`;
  projectLink.textContent = task.projectId.title;

  projectLine.appendChild(projectLabel);
  projectLine.appendChild(projectLink);

  const sessionLine = document.createElement("p");
  const sessionLabel = document.createElement("strong");
  sessionLabel.textContent = "Session: ";

  sessionLine.appendChild(sessionLabel);

  if (task.session) {
    const sessionLink = document.createElement("a");
    sessionLink.href = `/html/session.html?id=${task.session._id}`;
    sessionLink.textContent = task.session.name;
    sessionLine.appendChild(sessionLink);
  } else {
    sessionLine.appendChild(document.createTextNode("None"));
  }

  const createdLine = document.createElement("p");
  const createdLabel = document.createElement("strong");
  createdLabel.textContent = "Created: ";

  createdLine.appendChild(createdLabel);
  createdLine.appendChild(
    document.createTextNode(new Date(task.createdAt).toLocaleString()),
  );

  const updatedLine = document.createElement("p");
  const updatedLabel = document.createElement("strong");
  updatedLabel.textContent = "Last modified: ";

  updatedLine.appendChild(updatedLabel);
  updatedLine.appendChild(
    document.createTextNode(new Date(task.updatedAt).toLocaleString()),
  );

  if (task.completedAt) {
    const completedLine = document.createElement("p");
    completedLine.textContent = `Completed: ${new Date(task.completedAt).toLocaleString()}`;

    taskInfo.appendChild(completedLine);
  }

  taskInfo.appendChild(projectLine);
  taskInfo.appendChild(sessionLine);
  taskInfo.appendChild(createdLine);
  taskInfo.appendChild(updatedLine);
}

// -------------------------
// COMPLETE TASK
// -------------------------

completeTaskBtn.addEventListener("click", async () => {
  if (!confirm("Mark this task as completed?")) {
    return;
  }

  try {
    const response = await fetch(`/api/tasks/${taskId}/complete`, {
      method: "POST",
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Could not complete task");
    }

    window.location.href = `/html/project.html?id=${projectBtn.dataset.projectId}`;
  } catch (err) {
    console.error(err);
    alert("Error completing task");
  }
});

// -------------------------
// DELETE TASK
// -------------------------

deleteTaskBtn.addEventListener("click", async () => {
  if (!confirm("Delete this task? This cannot be undone.")) {
    return;
  }

  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Could not delete task");
    }

    window.location.href = `/html/project.html?id=${projectBtn.dataset.projectId}`;
  } catch (err) {
    console.error(err);
    alert("Error deleting task");
  }
});

// -------------------------
// BACK BUTTON
// -------------------------

backBtn.addEventListener("click", () => {
  window.history.back();
});

// -------------------------
// EDIT TASK BUTTON
// -------------------------

editTaskBtn.addEventListener("click", () => {
  window.location.href = `/html/edit-task.html?id=${taskId}`;
});

// -------------------------
// TASKS BUTTON
// -------------------------

projectBtn.addEventListener("click", () => {
  const projectId = projectBtn.dataset.projectId;

  window.location.href = `/html/project.html?id=${projectId}`;
});

// -------------------------
// START
// -------------------------

if (!taskId) {
  taskTitle.textContent = "No task selected";
  taskDescription.textContent = "";
  taskInfo.textContent = "";
  taskNotes.textContent = "";
} else {
  loadTask();
}
