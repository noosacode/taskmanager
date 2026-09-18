const projectsList = document.getElementById("projects-list");

async function loadCompletedProjects() {
  try {
    const response = await fetch("/api/projects/completed", {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Could not load completed projects");
    }

    const projects = await response.json();

    projectsList.innerHTML = "";

    if (projects.length === 0) {
      projectsList.textContent = "No completed projects.";
      return;
    }

    projects.sort((a, b) => {
      const dateA = new Date(a.completedAt);
      const dateB = new Date(b.completedAt);
      return dateB - dateA;
    });

    projects.forEach((project) => {
      const row = document.createElement("div");
      row.className = "item-row";

      const name = document.createElement("div");
      name.className = "item-name";

      const projectLink = document.createElement("a");
      projectLink.href = `/html/project.html?id=${project._id}`;
      projectLink.textContent = project.title;

      name.appendChild(projectLink);

      const completedDate = document.createElement("div");
      completedDate.textContent = project.completedAt
        ? new Date(project.completedAt).toLocaleString()
        : "No date";

      const statusButton = document.createElement("button");
      statusButton.textContent = "Change Status";
      statusButton.addEventListener("click", () => {
        changeStatus(project);
      });

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => {
        deleteProject(project);
      });

      row.appendChild(name);
      row.appendChild(completedDate);
      row.appendChild(statusButton);
      row.appendChild(deleteButton);

      projectsList.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    projectsList.textContent = "Error loading completed projects.";
  }
}

async function changeStatus(project) {
  try {
    const response = await fetch(`/api/projects/${project._id}/activate`, {
      method: "POST",
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Could not activate project");
    }

    window.location.href = "/html/projects.html";
  } catch (err) {
    console.error(err);
    alert("Error changing project status.");
  }
}

async function deleteProject(project) {
  if (
    !confirm(
      `Delete "${project.title}" and all its tasks? This cannot be undone.`
    )
  ) {
    return;
  }

  try {
    const response = await fetch(`/api/projects/${project._id}`, {
      method: "DELETE",
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Could not delete project");
    }

    loadCompletedProjects();
  } catch (err) {
    console.error(err);
    alert("Error deleting project.");
  }
}

loadCompletedProjects();