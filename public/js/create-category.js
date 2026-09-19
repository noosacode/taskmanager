// -------------------------
// CREATE CATEGORY PAGE
// -------------------------

const form = document.getElementById("create-category-form");

// -------------------------
// CREATE CATEGORY
// -------------------------

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();

  try {
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({
        name,
      }),
    });

    if (!response.ok) {
      throw new Error("Could not create category");
    }

    window.location.href = "/html/sessions.html";
  } catch (err) {
    console.error(err);
    alert("Error creating category");
  }
});
