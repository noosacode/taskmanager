// -------------------------
// SESSIONS PAGE
// -------------------------

const sessionsList = document.getElementById("sessions-list");
const addSessionBtn = document.getElementById("add-session-btn");

// -------------------------
// LOAD SESSIONS
// -------------------------

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

    sessions.sort((a, b) => a.name.localeCompare(b.name));

    await renderSessions(sessions);
  } catch (err) {
    console.error(err);
    sessionsList.textContent = "Error loading sessions";
  }
}

// -------------------------
// RENDER SESSIONS
// -------------------------

async function renderSessions(sessions) {
  sessionsList.innerHTML = "";

  if (sessions.length === 0) {
    sessionsList.textContent = "No sessions yet.";
    return;
  }

  for (const session of sessions) {
    const response = await fetch(`/api/sessions/${session._id}/tasks`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      throw new Error("Could not load session tasks");
    }

    const tasks = await response.json();

    const activeTaskCount = tasks.filter((task) => !task.completed).length;

    const row = document.createElement("div");

    row.className = "item-row";

    const sessionLink = document.createElement("a");
    sessionLink.href = `/html/session.html?id=${session._id}`;
    sessionLink.textContent = session.name;
    sessionLink.className = "item-name";

    const taskCount = document.createElement("span");
    taskCount.textContent = activeTaskCount;
    taskCount.className = "item-score";

    row.appendChild(sessionLink);
    row.appendChild(taskCount);

    sessionsList.appendChild(row);
  }
}

// -------------------------
// ADD SESSION
// -------------------------

addSessionBtn.addEventListener("click", () => {
  window.location.href = "/html/create-session.html";
});

// -------------------------
// START
// -------------------------

loadSessions();
