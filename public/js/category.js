// -------------------------
// CATEGORY PAGE
// -------------------------

const urlParams = new URLSearchParams(window.location.search);
const categoryId = urlParams.get("id");

// -------------------------
// ELEMENTS
// -------------------------

const categoryTitle = document.getElementById("category-title");
const tasksList = document.getElementById("tasks-list");

const editScoresBtn = document.getElementById("edit-scores-btn");
const completedTasksBtn = document.getElementById("completed-tasks-btn");

// -------------------------
// LOAD CATEGORY
// -------------------------

async function loadCategory() {
  try {
    const response = await fetch(`/api/categories/${categoryId}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Could not load category");
    }

    const category = await response.json();

    categoryTitle.textContent = category.name;

    await loadTasks();
  } catch (err) {
    console.error(err);
    categoryTitle.textContent = "Error loading category";
  }
}

// -------------------------
// LOAD TASKS
// -------------------------

async function loadTasks() {
  try {
    const response = await fetch(`/api/categories/${categoryId}/tasks`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Could not load tasks");
    }

    const tasks = await response.json();

    renderTasks(tasks);
  } catch (err) {
    console.error(err);
    tasksList.textContent = "Error loading tasks";
  }
}

// -------------------------
// RENDER TASKS
// -------------------------

function renderTasks(tasks) {
  tasksList.innerHTML = "";

  if (tasks.length === 0) {
    tasksList.textContent = "No tasks added yet.";
    return;
  }

  tasks.forEach((task) => {
    const row = document.createElement("div");

    row.className = "item-row";

    const taskLink = document.createElement("a");
    taskLink.href = `/html/task.html?id=${task._id}`;
    taskLink.textContent = task.name;
    taskLink.className = "item-name";

    const score = document.createElement("span");
    score.textContent = task.priorityScore;
    score.className = "item-score";

    row.appendChild(taskLink);
    row.appendChild(score);

    tasksList.appendChild(row);
  });
}

// -------------------------
// EDIT SCORES
// -------------------------

editScoresBtn.addEventListener("click", () => {
  window.location.href = `/html/category-scores.html?categoryId=${categoryId}`;
});

// -------------------------
// COMPLETED TASKS
// -------------------------

completedTasksBtn.addEventListener("click", () => {
  window.location.href = `/html/completed-tasks.html?categoryId=${categoryId}`;
});

// -------------------------
// START
// -------------------------

if (!categoryId) {
  categoryTitle.textContent = "No category selected";
} else {
  loadCategory();
}
