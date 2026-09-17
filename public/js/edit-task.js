const urlParams = new URLSearchParams(window.location.search);
const taskId = urlParams.get("id");

const taskTitle = document.getElementById("task-title");
const form = document.getElementById("edit-task-form");

const nameInput = document.getElementById("name");
const descriptionInput = document.getElementById("description");
const notesInput = document.getElementById("notes");

const categorySelect = document.getElementById("category");
const statusSelect = document.getElementById("status");

const backBtn = document.getElementById("back-btn");
const deleteTaskBtn = document.getElementById("delete-task-btn");

async function loadCategories() {
  try {
    const response = await fetch("/api/categories", {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Could not load categories");
    }

    const categories = await response.json();

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category._id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  } catch (err) {
    console.error(err);
  }
}

async function loadTask() {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Could not load task");
    }

    const task = await response.json();

    taskTitle.textContent = `Edit Task: ${task.name}`;

    nameInput.value = task.name || "";
    descriptionInput.value = task.description || "";
    notesInput.value = task.notes || "";

    if (task.category) {
      categorySelect.value = task.category._id;
    } else {
      categorySelect.value = "";
    }

    statusSelect.value = task.completed ? "completed" : "active";
  } catch (err) {
    console.error(err);
    taskTitle.textContent = "Error loading task";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const description = descriptionInput.value.trim();
  const notes = notesInput.value.trim();

  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({
        name,
        description,
        notes,
        category: categorySelect.value || null,
        completed: statusSelect.value === "completed",
      }),
    });

    if (!response.ok) {
      throw new Error("Could not update task");
    }

    window.location.href = `/html/task.html?id=${taskId}`;
  } catch (err) {
    console.error(err);
    alert("Error updating task");
  }
});

backBtn.addEventListener("click", () => {
  window.history.back();
});

deleteTaskBtn.addEventListener("click", async () => {
  if (!confirm("Delete this task? This cannot be undone.")) {
    return;
  }

  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Could not delete task");
    }

    window.history.back();
  } catch (err) {
    console.error(err);
    alert("Error deleting task");
  }
});

if (!taskId) {
  taskTitle.textContent = "No task selected";
} else {
  loadCategories();
  loadTask();
}
