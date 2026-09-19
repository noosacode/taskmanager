const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get("projectId");
const projectBtn = document.getElementById("project-btn");
const tasksList = document.getElementById("tasks-list");

async function loadCompletedTasks() {
  try {
    const response = await fetch(
      `/api/tasks/completed?projectId=${projectId}`,
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      },
    );

    if (!response.ok) {
      throw new Error("Could not load completed tasks");
    }

    const tasks = await response.json();

    tasksList.innerHTML = "";

    if (tasks.length === 0) {
      tasksList.textContent = "No completed tasks.";
      return;
    }

    tasks.sort((a, b) => {
      const dateA = new Date(a.completedAt);
      const dateB = new Date(b.completedAt);
      return dateB - dateA;
    });

    tasks.forEach((task) => {
      const row = document.createElement("div");
      row.className = "item-row";

      const name = document.createElement("div");
      name.className = "item-name";

      const taskLink = document.createElement("a");
      taskLink.href = `/html/task-details.html?id=${task._id}`;
      taskLink.textContent = task.name;

      name.appendChild(taskLink);

      const project = document.createElement("span");
      project.textContent = task.projectId ? ` — ${task.projectId.title}` : "";

      name.appendChild(project);

      const completedDate = document.createElement("div");
      completedDate.textContent = task.completedAt
        ? new Date(task.completedAt).toLocaleString()
        : "No date";

      const statusButton = document.createElement("button");
      statusButton.textContent = "Reopen Task";
      statusButton.addEventListener("click", () => {
        reopenTask(task);
      });

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => {
        deleteTask(task);
      });

      row.appendChild(name);
      row.appendChild(completedDate);
      row.appendChild(statusButton);
      row.appendChild(deleteButton);

      tasksList.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    tasksList.textContent = "Error loading completed tasks.";
  }
}

async function reopenTask(task) {
  try {
    const response = await fetch(`/api/tasks/${task._id}/reopen`, {
      method: "POST",
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Could not reopen task");
    }

    loadCompletedTasks();
  } catch (err) {
    console.error(err);
    alert("Error reopening task.");
  }
}

async function deleteTask(task) {
  if (!confirm(`Delete "${task.name}"? This cannot be undone.`)) {
    return;
  }

  try {
    const response = await fetch(`/api/tasks/${task._id}`, {
      method: "DELETE",
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Could not delete task");
    }

    loadCompletedTasks();
  } catch (err) {
    console.error(err);
    alert("Error deleting task.");
  }
}

projectBtn.addEventListener("click", () => {
  window.location.href = `/html/project.html?id=${projectId}`;
});      

loadCompletedTasks();
