const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get("id");

const projectTitle = document.getElementById("project-title");
const form = document.getElementById("edit-project-form");

const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const notesInput = document.getElementById("notes");
const containerSelect = document.getElementById("container");

const backBtn = document.getElementById("back-btn");

async function loadContainers() {
  try {
    const response = await fetch("/api/containers", {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Could not load containers");
    }

    const containers = await response.json();

    containers.forEach((container) => {
      const option = document.createElement("option");
      option.value = container._id;
      option.textContent = container.name;
      containerSelect.appendChild(option);
    });
  } catch (err) {
    console.error(err);
  }
}

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

    projectTitle.textContent = `Edit Project: ${project.title}`;

    titleInput.value = project.title || "";
    descriptionInput.value = project.description || "";
    notesInput.value = project.notes || "";

    if (project.container) {
      containerSelect.value = project.container._id;
    } else {
      containerSelect.value = "";
    }
  } catch (err) {
    console.error(err);
    projectTitle.textContent = "Error loading project";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const notes = notesInput.value.trim();
  const container = containerSelect.value || null;

  try {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({
        title,
        description,
        notes,
        container,
      }),
    });

    if (!response.ok) {
      throw new Error("Could not update project");
    }

    window.location.href = `/html/project-details.html?id=${projectId}`;
  } catch (err) {
    console.error(err);
    alert("Error updating project");
  }
});

backBtn.addEventListener("click", () => {
  window.history.back();
});

if (!projectId) {
  projectTitle.textContent = "No project selected";
} else {
  loadContainers();
  loadProject();
}
