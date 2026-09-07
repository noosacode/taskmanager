async function loadDocuments() {
  try {
    const response = await fetch("/api/documents", {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    const documents = await response.json();

    const container = document.getElementById("documents");

    container.innerHTML = "";

    documents.forEach((item) => {
      const div = document.createElement("div");

      div.innerHTML = `
            <h3>${item.title || "(No title)"}</h3>
            <p>${item.description || ""}</p>
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
            <hr>
      `;

      div.querySelector(".edit-btn").addEventListener("click", () => {
        editDocument(item);
      });

      div.querySelector(".delete-btn").addEventListener("click", () => {
        deleteDocument(item._id);
      });

      container.appendChild(div);
    });
  } catch (error) {
    console.error("Error loading documents:", error);
  }
}

async function createDocument() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;

  try {
    const response = await fetch("/api/documents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({
        title,
        description,
      }),
    });

    const newDocument = await response.json();

    if (!response.ok) {
      console.error(newDocument);
      return;
    }

    console.log("Created:", newDocument);

    document.getElementById("title").value = "";
    document.getElementById("description").value = "";

    loadDocuments();
  } catch (error) {
    console.error("Error creating document:", error);
  }
}

document.getElementById("create-btn").addEventListener("click", createDocument);

async function editDocument(item) {
  const title = prompt("Title:", item.title || "");
  const description = prompt("Description:", item.description || "");

  if (title === null || description === null) {
    return;
  }

  try {
    const response = await fetch(`/api/documents/${item._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({
        title,
        description,
      }),
    });

    const updatedDocument = await response.json();

    if (!response.ok) {
      console.error(updatedDocument);
      return;
    }

    console.log("Updated:", updatedDocument);

    loadDocuments();
  } catch (error) {
    console.error("Error updating document:", error);
  }
}

async function deleteDocument(id) {
  try {
    const response = await fetch(`/api/documents/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(result);
      return;
    }

    console.log("Deleted:", result);

    loadDocuments();
  } catch (error) {
    console.error("Error deleting document:", error);
  }
}