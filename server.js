require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("./backend/models/User");
const Project = require("./backend/models/Project");
const Task = require("./backend/models/Task");
const Session = require("./backend/models/Session");
const Container = require("./backend/models/Container");
const auth = require("./backend/middleware/auth");

const app = express();

app.use(express.json());
app.use(express.static("public"));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Mongoose connected");
  })
  .catch((error) => {
    console.log("MongoDB connection failed");
    console.log(error.message);
  });

// --------------------------------------------------
// AUTHENTICATION
// --------------------------------------------------

// Register
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
    });

    await user.save();

    res.send("User registered");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).send("Invalid username or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send("Invalid username or password");
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "5h",
      },
    );

    res.json({ token });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// --------------------------------------------------
// HOME PAGE
// --------------------------------------------------

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

// --------------------------------------------------
// PROJECT ROUTES
// --------------------------------------------------

// Get active projects
// Sorted by project priority, highest first.
app.get("/api/projects", auth, async (req, res) => {
  try {
    const projects = await Project.find({
      status: "active",
    })
      .populate("container")
      .sort({ projectPriorityScore: -1, title: 1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Get completed projects
// Most recently completed first.
app.get("/api/projects/completed", auth, async (req, res) => {
  try {
    const projects = await Project.find({
      status: "completed",
    }).sort({
      completedAt: -1,
    });

    res.json(projects);
  } catch (error) {
    console.error("Completed projects error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// Get inactive projects
app.get("/api/projects/inactive", auth, async (req, res) => {
  try {
    const projects = await Project.find({
      status: "inactive",
    })
      .populate("container")
      .sort({ title: 1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Get completed tasks
// Most recently completed first.
app.get("/api/tasks/completed", auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      projectId: req.query.projectId,
      completed: true,
    })
      .populate("projectId", "title")
      .sort({ completedAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error("Completed tasks error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// Get one project
app.get("/api/projects/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("container");

    if (!project) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Create project
app.post("/api/projects", auth, async (req, res) => {
  try {
    const project = new Project({
      title: req.body.title,
      description: req.body.description,
      projectPriorityScore: req.body.projectPriorityScore,
      container: req.body.container || null,
    });

    await project.save();

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Update general project information
//
// Notice that projectPriorityScore is deliberately NOT updated here.
// Project priority is a comparative value and has its own route.
app.put("/api/projects/:id", auth, async (req, res) => {
  try {
    const updates = {};

    if (req.body.title !== undefined) {
      updates.title = req.body.title;
    }

    if (req.body.description !== undefined) {
      updates.description = req.body.description;
    }

    if (req.body.notes !== undefined) {
      updates.notes = req.body.notes;
    }

    if (req.body.container !== undefined) {
      updates.container = req.body.container || null;
    }

    const project = await Project.findByIdAndUpdate(req.params.id, updates, {
      returnDocument: "after",
      runValidators: true,
    }).populate("container");

    if (!project) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Change project priority
//
// This is intentionally a separate route because project priority
// is only changed from the Projects page.
app.put("/api/projects/:id/priority", auth, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        projectPriorityScore: req.body.projectPriorityScore,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Make project inactive
app.post("/api/projects/:id/inactivate", auth, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        status: "inactive",
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Make project active
app.post("/api/projects/:id/activate", auth, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        status: "active",
        completedAt: null,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Mark project completed
//
// The project stays in the projects collection.
app.post("/api/projects/:id/complete", auth, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        status: "completed",
        completedAt: new Date(),
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Delete project
//
// Deleting a project also deletes its tasks.
app.delete("/api/projects/:id", auth, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    await Task.deleteMany({
      projectId: req.params.id,
    });

    res.json({
      message: "Project deleted.",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// --------------------------------------------------
// TASK ROUTES
// --------------------------------------------------

// Get all tasks for a project
//
// Get active tasks for a project
app.get("/api/projects/:projectId/tasks", auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      projectId: req.params.projectId,
      completed: false,
    }).sort({
      priorityScore: -1,
      name: 1,
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Create task inside a project
app.post("/api/projects/:projectId/tasks", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    const task = new Task({
      projectId: req.params.projectId,
      name: req.body.name,
      description: req.body.description,
      notes: req.body.notes,
      session: req.body.session || null,
    });

    await task.save();

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Get one task
app.get("/api/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("projectId", "title")
      .populate("session");

    if (!task) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Update task
app.put("/api/tasks/:id", auth, async (req, res) => {
  try {
    const updates = {};

    if (req.body.name !== undefined) {
      updates.name = req.body.name;
    }

    if (req.body.description !== undefined) {
      updates.description = req.body.description;
    }

    if (req.body.notes !== undefined) {
      updates.notes = req.body.notes;
    }

    if (req.body.priorityScore !== undefined) {
      updates.priorityScore = req.body.priorityScore;
    }

    if (req.body.session !== undefined) {
      updates.session = req.body.session || null;
    }

    if (req.body.completed !== undefined) {
      updates.completed = req.body.completed;

      if (req.body.completed === true) {
        updates.completedAt = new Date();
      } else {
        updates.completedAt = null;
      }
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      returnDocument: "after",
      runValidators: true,
    })
      .populate("projectId", "title")
      .populate("session");

    if (!task) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Mark task completed
//
// The task stays in the tasks collection.
app.post("/api/tasks/:id/complete", auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        completed: true,
        completedAt: new Date(),
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Reopen a completed task
app.post("/api/tasks/:id/reopen", auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        completed: false,
        completedAt: null,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Delete task
app.delete("/api/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    res.json({
      message: "Task deleted.",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// --------------------------------------------------
// PRIORITY TASK ROUTES
// --------------------------------------------------

// Get all current Priority Tasks.
//
// 50–99 = Priority Task
// Completed tasks are excluded.
app.get("/api/priority-tasks", auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      priorityScore: {
        $gte: 50,
        $lte: 99,
      },
      completed: false,
    })
      .populate("projectId", "title")
      .populate("session", "name")
      .sort({ priorityScore: -1, name: 1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Get Priority Tasks that have no session.
//
// Useful for the Priority Tasks checkpoint.
app.get("/api/priority-tasks/nosession", auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      priorityScore: {
        $gte: 50,
        $lte: 99,
      },
      completed: false,
      session: null,
    })
      .populate("projectId", "title")
      .sort({ priorityScore: -1, name: 1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// --------------------------------------------------
// SESSION ROUTES
// --------------------------------------------------

// Get all sessions
app.get("/api/sessions", auth, async (req, res) => {
  try {
    const sessions = await Session.find().sort({
      name: 1,
    });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Create session
app.post("/api/sessions", auth, async (req, res) => {
  try {
    const name = req.body.name?.trim();

    if (!name) {
      return res.status(400).json({
        message: "Session name required.",
      });
    }

    const session = new Session({
      name,
    });

    await session.save();

    res.status(201).json(session);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Session already exists.",
      });
    }

    res.status(500).json({
      error: error.message,
    });
  }
});

// Get one session
app.get("/api/sessions/:id", auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        message: "Session not found.",
      });
    }

    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error loading session.",
    });
  }
});

// Delete session
//
// Tasks using this session are not deleted.
// Their session is simply cleared.
app.delete("/api/sessions/:id", auth, async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);

    if (!session) {
      return res.status(404).json({
        message: "Session not found.",
      });
    }

    await Task.updateMany(
      {
        session: req.params.id,
      },
      {
        $set: {
          session: null,
        },
      },
    );

    res.json({
      message: "Session deleted.",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Get tasks in a session
//
// This is where tasks from different projects can be compared.
app.get("/api/sessions/:id/tasks", auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        message: "Session not found.",
      });
    }

    const tasks = await Task.find({
      session: req.params.id,
      completed: false,
      priorityScore: {
        $gte: 50,
        $lte: 99,
      },
    })
      .populate("projectId", "title")
      .sort({
        priorityScore: -1,
        name: 1,
      });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// --------------------------------------------------
// CONTAINER ROUTES
// --------------------------------------------------

// Get all containers
app.get("/api/containers", auth, async (req, res) => {
  try {
    const containers = await Container.find().sort({
      name: 1,
    });

    res.json(containers);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Create container
app.post("/api/containers", auth, async (req, res) => {
  try {
    const name = req.body.name?.trim();

    if (!name) {
      return res.status(400).json({
        message: "Container name required.",
      });
    }

    const container = new Container({
      name,
    });

    await container.save();

    res.status(201).json(container);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Container already exists.",
      });
    }

    res.status(500).json({
      error: error.message,
    });
  }
});

// Rename container
app.put("/api/containers/:id", auth, async (req, res) => {
  try {
    const name = req.body.name?.trim();

    if (!name) {
      return res.status(400).json({
        message: "Container name required.",
      });
    }

    const container = await Container.findByIdAndUpdate(
      req.params.id,
      {
        name,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!container) {
      return res.status(404).json({
        message: "Container not found.",
      });
    }

    res.json(container);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Container already exists.",
      });
    }

    res.status(500).json({
      error: error.message,
    });
  }
});

// Delete container
//
// Projects using this container are not deleted.
// Their container is simply cleared.
app.delete("/api/containers/:id", auth, async (req, res) => {
  try {
    const container = await Container.findByIdAndDelete(req.params.id);

    if (!container) {
      return res.status(404).json({
        message: "Container not found.",
      });
    }

    await Project.updateMany(
      {
        container: req.params.id,
      },
      {
        $set: {
          container: null,
        },
      },
    );

    res.json({
      message: "Container deleted.",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

if (require.main === module) {
  app.listen(3000, function () {
    console.log("Server running on http://localhost:3000");
  });
}

module.exports = app;
