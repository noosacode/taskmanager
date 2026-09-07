// -------------------------
// PROJECTS PAGE LOGIC
// -------------------------

const projectsList = document.getElementById("projects-list");
const createProjectBtn = document.getElementById("create-project-btn");

// -------------------------
// LOAD ALL PROJECTS
// -------------------------

async function loadProjects() {
  try {
    const response = await fetch("/api/projects", {
      headers: {
        Authorization: localStorage.getItem("token"),
        //    Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const projects = await response.json();
    if (projects.length === 0) {
      projectsList.innerHTML = "<p>No projects yet. Create one above!</p>";
      return;
    }

    renderProjects(projects);

  } catch (err) {
    console.error(err);
    alert("Error loading projects");
  }
}

// -------------------------
// RENDER PROJECTS
// -------------------------

function renderProjects(projects) {
  projectsList.innerHTML = "";

  projects.forEach((project) => {
    const div = document.createElement("div");
    div.className = "card";
    div.style.marginBottom = "15px";

    div.innerHTML = `
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <p>Score: ${project.projectScore}</p>

            <a href="project.html?id=${project._id}" class="btn-primary" style="display:block;margin-top:10px;">
                Open Project
            </a>

            <button class="btn-secondary" style="margin-top:10px;" onclick="deleteProject('${project._id}')">
                Delete Project
            </button>
        `;

    projectsList.appendChild(div);
  });
}

// -------------------------
// CREATE PROJECT
// -------------------------

createProjectBtn.addEventListener("click", async () => {
  const title = document.getElementById("project-title-input").value;
  const description = document.getElementById(
    "project-description-input",
  ).value;

  if (!title.trim()) {
    alert("Project title required");
    return;
  }

  try {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
        //    Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ title, description }),
    });

    if (response.ok) {
      document.getElementById("project-title-input").value = "";
      document.getElementById("project-description-input").value = "";
      loadProjects();
    } else {
      alert("Error creating project");
    }
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
});

// -------------------------
// DELETE PROJECT
// -------------------------

async function deleteProject(projectId) {
  if (!confirm("Delete this project?")) return;

  try {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
      headers: {
        Authorization: localStorage.getItem("token"),
        //    Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.ok) {
      loadProjects();
    } else {
      alert("Error deleting project");
    }
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}

// -------------------------
// INIT
// -------------------------

loadProjects();
