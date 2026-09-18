// -------------------------
// TASK PAGE
// -------------------------

const urlParams = new URLSearchParams(window.location.search);
const taskId = urlParams.get("id");

const taskTitle = document.getElementById("task-title");
const taskDescription = document.getElementById("task-description");
const taskInfo = document.getElementById("task-info");
const taskNotes = document.getElementById("task-notes");

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

  taskDescription.textContent =
    task.description || "No description.";

  taskNotes.textContent =
    task.notes || "No notes.";

  // Store the project ID for the This Project button.
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

  const categoryLine = document.createElement("p");
  const categoryLabel = document.createElement("strong");
  categoryLabel.textContent = "Category: ";

  categoryLine.appendChild(categoryLabel);

  if (task.category) {
    const categoryLink = document.createElement("a");
    categoryLink.href = `/html/category.html?id=${task.category._id}`;
    categoryLink.textContent = task.category.name;
    categoryLine.appendChild(categoryLink);
  } else {
    categoryLine.appendChild(document.createTextNode("None"));
  }

  const createdLine = document.createElement("p");
  const createdLabel = document.createElement("strong");
  createdLabel.textContent = "Created: ";

  createdLine.appendChild(createdLabel);
  createdLine.appendChild(
    document.createTextNode(
      new Date(task.createdAt).toLocaleString()
    )
  );

  const updatedLine = document.createElement("p");
  const updatedLabel = document.createElement("strong");
  updatedLabel.textContent = "Last modified: ";

  updatedLine.appendChild(updatedLabel);
  updatedLine.appendChild(
    document.createTextNode(
      new Date(task.updatedAt).toLocaleString()
    )
  );

  const completedLine = document.createElement("p");
  const completedLabel = document.createElement("strong");
  completedLabel.textContent = "Completed: ";

  completedLine.appendChild(completedLabel);

  if (task.completedAt) {
    completedLine.appendChild(
      document.createTextNode(
        new Date(task.completedAt).toLocaleString()
      )
    );
  } else {
    completedLine.appendChild(
      document.createTextNode("No")
    );
  }

  taskInfo.appendChild(projectLine);
  taskInfo.appendChild(categoryLine);
  taskInfo.appendChild(createdLine);
  taskInfo.appendChild(updatedLine);
  taskInfo.appendChild(completedLine);
}

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
// THIS PROJECT BUTTON
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