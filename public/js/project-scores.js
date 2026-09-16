// -------------------------
// PROJECT SCORES PAGE
// -------------------------

const projectsList = document.getElementById("projects-list");
const saveScoresBtn = document.getElementById("save-scores-btn");

let projects = [];

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

    projects = await response.json();

    renderProjects();
  } catch (err) {
    console.error(err);
    projectsList.textContent = "Error loading projects";
  }
}

// -------------------------
// RENDER PROJECTS
// -------------------------

function renderProjects() {
  projectsList.innerHTML = "";

  if (projects.length === 0) {
    projectsList.textContent = "No active projects.";
    return;
  }

  projects.forEach((project) => {
    const row = document.createElement("div");

    row.className = "item-row";

    const projectName = document.createElement("span");
    projectName.textContent = project.title;
    projectName.className = "item-name";

    const scoreInput = document.createElement("input");
    scoreInput.type = "number";
    scoreInput.min = "0";
    scoreInput.max = "99";
    scoreInput.value = project.projectPriorityScore;
    scoreInput.dataset.projectId = project._id;

    row.appendChild(projectName);
    row.appendChild(scoreInput);

    projectsList.appendChild(row);
  });
}

// -------------------------
// SAVE SCORES
// -------------------------

saveScoresBtn.addEventListener("click", async () => {
  try {
    const inputs = projectsList.querySelectorAll("input");

    for (const input of inputs) {
      const projectId = input.dataset.projectId;
      const score = Number(input.value);

      const response = await fetch(`/api/projects/${projectId}/priority`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          projectPriorityScore: score,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not save project score");
      }
    }

    window.location.href = "/html/projects.html";
  } catch (err) {
    console.error(err);
    alert("Error saving scores");
  }
});

// -------------------------
// START
// -------------------------

loadProjects();
