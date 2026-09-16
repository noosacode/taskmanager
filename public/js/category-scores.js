// -------------------------
// CATEGORY SCORES PAGE
// -------------------------

const urlParams = new URLSearchParams(window.location.search);
const categoryId = urlParams.get("categoryId");

const categoryTitle = document.getElementById("category-title");
const tasksList = document.getElementById("tasks-list");
const saveScoresBtn = document.getElementById("save-scores-btn");

let tasks = [];

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

    categoryTitle.textContent = `${category.name} — Category Scores`;

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

    tasks = await response.json();

    renderTasks();
  } catch (err) {
    console.error(err);
    tasksList.textContent = "Error loading tasks";
  }
}

// -------------------------
// RENDER TASKS
// -------------------------

function renderTasks() {
  tasksList.innerHTML = "";

  if (tasks.length === 0) {
    tasksList.textContent = "No tasks added yet.";
    return;
  }

  tasks.forEach((task) => {
    const row = document.createElement("div");

    row.className = "item-row";

    const taskName = document.createElement("span");
    taskName.textContent = task.name;
    taskName.className = "item-name";

    const scoreInput = document.createElement("input");
    scoreInput.type = "number";
    scoreInput.min = "0";
    scoreInput.max = "99";
    scoreInput.value = task.priorityScore;
    scoreInput.dataset.taskId = task._id;

    row.appendChild(taskName);
    row.appendChild(scoreInput);

    tasksList.appendChild(row);
  });
}

// -------------------------
// SAVE SCORES
// -------------------------

saveScoresBtn.addEventListener("click", async () => {
  try {
    const inputs = tasksList.querySelectorAll("input");

    for (const input of inputs) {
      const taskId = input.dataset.taskId;
      const score = Number(input.value);

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          priorityScore: score,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not save task score");
      }
    }

    window.location.href = `/html/category.html?id=${categoryId}`;
  } catch (err) {
    console.error(err);
    alert("Error saving scores");
  }
});

// -------------------------
// START
// -------------------------

if (!categoryId) {
  categoryTitle.textContent = "No category selected";
} else {
  loadCategory();
}
