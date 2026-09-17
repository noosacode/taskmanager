const containersList = document.getElementById("containers-list");
const editContainersBtn = document.getElementById("edit-containers-btn");

async function loadContainersPage() {
  try {
    const [containersResponse, projectsResponse] = await Promise.all([
      fetch("/api/containers", {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }),
      fetch("/api/projects", {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }),
    ]);

    if (!containersResponse.ok || !projectsResponse.ok) {
      throw new Error("Could not load containers or projects");
    }

    const containers = await containersResponse.json();
    const projects = await projectsResponse.json();

    containersList.innerHTML = "";

    containers.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    projects.sort((a, b) =>
      a.title.localeCompare(b.title)
    );

    containers.forEach((container) => {
      const containerProjects = projects.filter(
        (project) =>
          project.container &&
          project.container._id === container._id
      );

      const heading = document.createElement("h2");
      heading.textContent = container.name;

      containersList.appendChild(heading);

      if (containerProjects.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "No projects.";
        containersList.appendChild(emptyMessage);
        return;
      }

      containerProjects.forEach((project) => {
        addProjectRow(project);
      });
    });

    const unassignedProjects = projects.filter(
      (project) => !project.container
    );

    const unassignedHeading = document.createElement("h2");
    unassignedHeading.textContent = "Unassigned";

    containersList.appendChild(unassignedHeading);

    if (unassignedProjects.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.textContent = "No projects.";
      containersList.appendChild(emptyMessage);
    } else {
      unassignedProjects.forEach((project) => {
        addProjectRow(project);
      });
    }
  } catch (err) {
    console.error(err);
    containersList.textContent = "Error loading containers.";
  }
}

function addProjectRow(project) {
  const row = document.createElement("div");
  row.className = "item-row";

  const name = document.createElement("div");
  name.className = "item-name";

  const link = document.createElement("a");
  link.href = `/html/project.html?id=${project._id}`;
  link.textContent = project.title;

  name.appendChild(link);
  row.appendChild(name);

  containersList.appendChild(row);
}

editContainersBtn.addEventListener("click", () => {
  window.location.href = "/html/edit-containers.html";
});

loadContainersPage();