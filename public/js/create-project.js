// -------------------------
// CREATE PROJECT PAGE
// -------------------------

const form = document.getElementById("create-project-form");
const containerSelect = document.getElementById("container");

// -------------------------
// LOAD CONTAINERS
// -------------------------

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

// -------------------------
// CREATE PROJECT
// -------------------------

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const container = containerSelect.value || null;

  try {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({
        title,
        description,
        container,
      }),
    });

    if (!response.ok) {
      throw new Error("Could not create project");
    }

    window.location.href = "/html/projects.html";
  } catch (err) {
    console.error(err);
    alert("Error creating project");
  }
});

// -------------------------
// START
// -------------------------

loadContainers();
