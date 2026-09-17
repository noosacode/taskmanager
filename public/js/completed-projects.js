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

      const completedDate = document.createElement("div