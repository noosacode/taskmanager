const tasksList = document.getElementById("tasks-list");

async function loadPriorityTasks() {
  try {
    const response = await fetch("/api/priority-tasks", {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Could not load priority tasks");
    }

    const tasks = await response.json();

    tasksList.innerHTML = "";

    if (tasks.length === 0) {
      tasksList.textContent = "No priority tasks.";
      return;
    }

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
      project.textContent = ` — ${task.projectId.title}`;

      name.appendChild(project);

      const score = document.createElement("div");
      score.className = "item-score";
      score.textContent = task.priorityScore;

      row.appendChild(name);
      row.appendChild(score);

      tasksList.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    tasksList.textContent = "Error loading priority tasks.";
  }
}

loadPriorityTasks();
