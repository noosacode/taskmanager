// -------------------------
// CREATE TASK PAGE
// -------------------------

const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get("projectId");

// -------------------------
// ELEMENTS
// -------------------------

const projectTitle = document.getElementById("project-title");
const form = document.getElementById("create-task-form");

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

    projectTitle.textContent = `${project.title} — Create Task`;
  } catch (err) {
    console.error(err);
    projectTitle.textContent = "Error loading project";
  }
}

// -------------------------
// CREATE TASK
// -------------------------

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();

  try {
    const response = await fetch(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({
        name,
        description,
      }),
    });

    if (!response.ok) {
      throw new Error("Could not create task");
    }

    window.location.href = `/html/project.html?id=${projectId}`;
  } catch (err) {
    console.error(err);
    alert("Error creating task");
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
