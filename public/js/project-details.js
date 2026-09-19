// -------------------------
// PROJECT DETAILS PAGE
// -------------------------

const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get("id");

// -------------------------
// ELEMENTS
// -------------------------

const projectTitle = document.getElementById("project-title");
const projectDetails = document.getElementById("project-details");
const projectNotes = document.getElementById("project-notes");

const completeProjectBtn = document.getElementById("complete-project-btn");
const deleteProjectBtn = document.getElementById("delete-project-btn");
const backBtn = document.getElementById("back-btn");
const editProjectBtn = document.getElementById("edit-project-btn");
const projectBtn = document.getElementById("project-btn");

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
  } catch (err) {
    console.error(err);
    projectTitle.textContent = "Error loading project";
    projectDetails.textContent = "";
  }
}

// -------------------------
// RENDER PROJECT
// -------------------------

function renderProject(project) {
  projectTitle.textContent = project.title;
  projectNotes.textContent = project.notes || "No notes.";

  projectDetails.innerHTML = "";

  const description = document.createElement("p");
  description.textContent = project.description || "No description.";

  const container = document.createElement("p");

  const containerLabel = document.createElement("strong");
  containerLabel.textContent = "Container: ";

  container.appendChild(containerLabel);

  if (project.container) {
    const containerLink = document.createElement("a");
    containerLink.href = `/html/containers.html`;
    containerLink.textContent = project.container.name;
    container.appendChild(containerLink);
  } else {
    container.appendChild(document.createTextNode("None"));
  }

  const created = document.createElement("p");
  created.textContent = `Created: ${new Date(project.createdAt).toLocaleString()}`;

  const updated = document.createElement("p");
  updated.textContent = `Last modified: ${new Date(project.updatedAt).toLocaleString()}`;

  projectDetails.appendChild(description);
  projectDetails.appendChild(container);
  projectDetails.appendChild(created);
  projectDetails.appendChild(updated);

  if (project.completedAt) {
    const completed = document.createElement("p");
    completed.textContent = `Completed: ${new Date(project.completedAt).toLocaleString()}`;

    projectDetails.appendChild(completed);
  }
}

// -------------------------
// COMPLETE PROJECT
// -------------------------

completeProjectBtn.addEventListener("click", async () => {
  if (!confirm("Mark this project as completed?")) {
    return;
  }

  try {
    const response = await fetch(`/api/projects/${projectId}/complete`, {
      method: "POST",
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Could not complete project");
    }

    window.location.href = "/html/projects.html";
  } catch (err) {
    console.error(err);
    alert("Error completing project");
  }
});

// -------------------------
// DELETE PROJECT
// -------------------------

deleteProjectBtn.addEventListener("click", async () => {
  if (
    !confirm("Delete this project and all its tasks? This cannot be undone.")
  ) {
    return;
  }

  try {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Could not delete project");
    }

    window.location.href = "/html/projects.html";
  } catch (err) {
    console.error(err);
    alert("Error deleting project");
  }
});

// -------------------------
// BACK
// -------------------------

backBtn.addEventListener("click", () => {
  window.history.back();
});

// -------------------------
// EDIT PROJECT
// -------------------------

editProjectBtn.addEventListener("click", () => {
  window.location.href = `/html/edit-project.html?id=${projectId}`;
});

// -------------------------
// TASKS
// -------------------------

projectBtn.addEventListener("click", () => {
  window.location.href = `/html/project.html?id=${projectId}`;
});

// -------------------------
// START
// -------------------------

if (!projectId) {
  projectTitle.textContent = "No project selected";
  projectDetails.textContent = "";
} else {
  loadProject();
}
