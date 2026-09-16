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
const editProjectBtn = document.getElementById("edit-project-btn");

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

  projectDetails.innerHTML = "";

  const description = document.createElement("p");
  description.textContent = project.description || "No description.";

  const container = document.createElement("p");
  container.textContent = `Container: ${project.container ? project.container.name : "None"}`;

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
// EDIT PROJECT
// -------------------------

editProjectBtn.addEventListener("click", () => {
  window.location.href = `/html/edit-project.html?id=${projectId}`;
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
