const urlParams = new URLSearchParams(window.location.search);
const taskId = urlParams.get("id");

const taskTitle = document.getElementById("task-title");
const form = document.getElementById("edit-task-form");

const nameInput = document.getElementById("name");
const descriptionInput = document.getElementById("description");
const notesInput = document.getElementById("notes");

const sessionSelect = document.getElementById("session");
const statusSelect = document.getElementById("status");

const backBtn = document.getElementById("back-btn");

async function loadSessions() {
  try {
    const response = await fetch("/api/sessions", {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Could not load sessions");
    }

    const sessions = await response.json();

    sessions.forEach((session) => {
      const option = document.createElement("option");
      option.value = session._id;
      option.textContent = session.name;
      sessionSelect.appendChild(option);
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

    if (task.session) {
      sessionSelect.value = task.session._id;
    } else {
      sessionSelect.value = "";
    }

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
        session: sessionSelect.value || null,
      }),
    });

    if (!response.ok) {
      throw new Error("Could not update task");
    }

    window.location.href = `/html/task-details.html?id=${taskId}`;
  } catch (err) {
    console.error(err);
    alert("Error updating task");
  }
});

backBtn.addEventListener("click", () => {
  window.history.back();
});

if (!taskId) {
  taskTitle.textContent = "No task selected";
} else {
  loadSessions();
  loadTask();
}
