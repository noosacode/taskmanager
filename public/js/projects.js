// -------------------------
// PROJECTS PAGE
// -------------------------

const projectsList = document.getElementById("projects-list");

const addProjectBtn = document.getElementById("add-project-btn");
const editProjectsBtn = document.getElementById("project-scores-btn");
const inactiveProjectsBtn = document.getElementById("inactive-projects-btn");
const completedProjectsBtn = document.getElementById("completed-projects-btn");

// -------------------------
// LOAD PROJECTS
// -------------------------

async function loadProjects() {
  try {
    const response = await fetch("/api/projects", {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Could not load projects");
    }

    const projects = await response.json();

    renderProjects(projects);
  } catch (err) {
    console.error(err);
    projectsList.textContent = "Error loading projects";
  }
}

// -------------------------
// RENDER PROJECTS
// -------------------------

function renderProjects(projects) {
  projectsList.innerHTML = "";

  if (projects.length === 0) {
    projectsList.textContent = "No active projects.";
    return;
  }

  projects.forEach((project) => {
    const row = document.createElement("div");

    row.className = "item-row";

    const projectLink = document.createElement("a");
    projectLink.href = `/html/project.html?id=${project._id}`;
    projectLink.textContent = project.title;
    projectLink.className = "item-name";

    const score = document.createElement("span");
    score.textContent = project.projectPriorityScore;
    score.className = "item-score";

    row.appendChild(projectLink);
    row.appendChild(score);

    projectsList.appendChild(row);
  });
}

// -------------------------
// ADD PROJECT
// -------------------------

addProjectBtn.addEventListener("click", () => {
  window.location.href = "/html/create-project.html";
});

// -------------------------
// EDIT PROJECTS
// -------------------------

editProjectsBtn.addEventListener("click", () => {
  window.location.href = "/html/project-scores.html";
});

// -------------------------
// INACTIVE PROJECTS
// -------------------------

inactiveProjectsBtn.addEventListener("click", () => {
  window.location.href = "/html/inactive-projects.html";
});

// -------------------------
// COMPLETED PROJECTS
// -------------------------

completedProjectsBtn.addEventListener("click", () => {
  window.location.href = "/html/completed-projects.html";
});

// -------------------------
// START
// -------------------------

loadProjects();
