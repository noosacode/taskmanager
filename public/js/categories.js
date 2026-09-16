// -------------------------
// CATEGORIES PAGE
// -------------------------

const categoriesList = document.getElementById("categories-list");
const addCategoryBtn = document.getElementById("add-category-btn");

// -------------------------
// LOAD CATEGORIES
// -------------------------

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

    categories.sort((a, b) => a.name.localeCompare(b.name));

    await renderCategories(categories);
  } catch (err) {
    console.error(err);
    categoriesList.textContent = "Error loading categories";
  }
}

// -------------------------
// RENDER CATEGORIES
// -------------------------

async function renderCategories(categories) {
  categoriesList.innerHTML = "";

  if (categories.length === 0) {
    categoriesList.textContent = "No categories yet.";
    return;
  }

  for (const category of categories) {
    const response = await fetch(`/api/categories/${category._id}/tasks`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Could not load category tasks");
    }

    const tasks = await response.json();

    const activeTaskCount = tasks.filter((task) => !task.completed).length;

    const row = document.createElement("div");

    row.className = "item-row";

    const categoryLink = document.createElement("a");
    categoryLink.href = `/html/category.html?id=${category._id}`;
    categoryLink.textContent = category.name;
    categoryLink.className = "item-name";

    const taskCount = document.createElement("span");
    taskCount.textContent = activeTaskCount;
    taskCount.className = "item-score";

    row.appendChild(categoryLink);
    row.appendChild(taskCount);

    categoriesList.appendChild(row);
  }
}

// -------------------------
// ADD CATEGORY
// -------------------------

addCategoryBtn.addEventListener("click", () => {
  window.location.href = "/html/create-category.html";
});

// -------------------------
// START
// -------------------------

loadCategories();
