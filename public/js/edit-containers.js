const form = document.getElementById("create-container-form");
const nameInput = document.getElementById("name");
const containersList = document.getElementById("containers-list");

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

    containersList.innerHTML = "";

    if (containers.length === 0) {
      containersList.textContent = "No containers.";
      return;
    }

    containers.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    containers.forEach((container) => {
      const row = document.createElement("div");
      row.className = "item-row";

      const name = document.createElement("div");
      name.className = "item-name";
      name.textContent = container.name;

      const editButton = document.createElement("button");
      editButton.textContent = "Rename";
      editButton.addEventListener("click", () => {
        renameContainer(container);
      });

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => {
        deleteContainer(container);
      });

      row.appendChild(name);
      row.appendChild(editButton);
      row.appendChild(deleteButton);

      containersList.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    containersList.textContent = "Error loading containers.";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();

  if (!name) {
    return;
  }

  try {
    const response = await fetch("/api/containers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error("Could not create container");
    }

    nameInput.value = "";

    loadContainers();
  } catch (err) {
    console.error(err);
    alert("Error creating container");
  }
});

async function renameContainer(container) {
  const newName = prompt("New container name:", container.name);

  if (newName === null) {
    return;
  }

  const name = newName.trim();

  if (!name) {
    return;
  }

  try {
    const response = await fetch(`/api/containers/${container._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error("Could not rename container");
    }

    loadContainers();
  } catch (err) {
    console.error(err);
    alert("Error renaming container");
  }
}

async function deleteContainer(container) {
  if (!confirm(`Delete "${container.name}"?`)) {
    return;
  }

  try {
    const response = await fetch(`/api/containers/${container._id}`, {
      method: "DELETE",
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Could not delete container");
    }

    loadContainers();
  } catch (err) {
    console.error(err);
    alert("Error deleting container");
  }
}

loadContainers();
