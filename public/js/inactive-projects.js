const projectsList = document.getElementById("projects-list");

async function loadInactiveProjects() {
  try {
    const response = await fetch("/api/projects/inactive", {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Could not load inactive projects");
    }

    const projects = await response.json();

    projectsList.innerHTML = "";

    if (projects.length === 0) {
      projectsList.textContent = "No inactive projects.";
      return;
    }

    projects.sort((a, b) => {
      const dateA = new Date(a.updatedAt);
      const dateB = new Date(b.updatedAt);
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
      row.appendChild(statusButton);
      row.appendChild(deleteButton);

      projectsList.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    projectsList.textContent = "Error loading inactive projects.";
  }
}

async function changeStatus(project) {
  const newStatus = prompt(
    `Change status for "${project.title}" to:\n\nactive or completed`
  );

  if (newStatus === null) {
    return;
  }

  const status = newStatus.trim().toLowerCase();

  if (status !== "active" && status !== "completed") {
    alert("Please enter active or completed.");
    return;
  }

  try {
    let response;

    if (status === "active") {
      response = await fetch(`/api/projects/${project._id}/activate`, {
        method: "POST",
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
    } else {
      response = await fetch(`/api/projects/${project._id}/complete`, {
        method: "POST",
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
    }

    if (!response.ok) {
      throw new Error("Could not change project status");
    }

    loadInactiveProjects();
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

    loadInactiveProjects();
  } catch (err) {
    console.error(err);
    alert("Error deleting project.");
  }
}

loadInactiveProjects();
