// -------------------------
// CREATE SESSION PAGE
// -------------------------

const form = document.getElementById("create-session-form");

// -------------------------
// CREATE SESSION
// -------------------------

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();

  try {
    const response = await fetch("/api/sessions", {
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
      throw new Error("Could not create session");
    }

    window.location.href = "/html/sessions.html";
  } catch (err) {
    console.error(err);
    alert("Error creating session");
  }
});
