require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("./backend/models/User");
const Project = require("./backend/models/Project");
const Task = require("./backend/models/Task");
const Category = require("./backend/models/Category");
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

// Get completed projects
// Most recently completed first.
app.get("/api/projects/completed", auth, async (req, res) => {
  try {
    const projects = await Project.find({
      status: "completed",
    }).sort({ completedAt: -1 });

    res.json(projects);
  } catch (error) {
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

    if (req.body.container !== undefined) {
      updates.container = req.body.container || null;
    }

    const project = await Project.findByIdAndUpdate(req.params.id, updates, {
      new: true,
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
        new: true,
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
        new: true,
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
        new: true,
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
        new: true,
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
// Completed tasks are included here because completed tasks
// remain attached to their project.
app.get("/api/projects/:projectId/tasks", auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      projectId: req.params.projectId,
    }).sort({
      completed: 1,
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
      details: req.body.details,
      priorityScore: req.body.priorityScore,
      category: req.body.category || null,
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
    const task = await Task.findById(req.params.id).populate("category");

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

    if (req.body.details !== undefined) {
      updates.details = req.body.details;
    }

    if (req.body.priorityScore !== undefined) {
      updates.priorityScore = req.body.priorityScore;
    }

    if (req.body.category !== undefined) {
      updates.category = req.body.category || null;
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
      new: true,
      runValidators: true,
    }).populate("category");

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
        new: true,
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
        new: true,
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

// Get completed tasks
// Most recently completed first.
app.get("/api/tasks/completed", auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      completed: true,
    })
      .populate("projectId", "title")
      .sort({ completedAt: -1 });

    res.json(tasks);
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
      .populate("category", "name")
      .sort({ priorityScore: -1, name: 1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Get Priority Tasks that have no category.
//
// Useful for the Priority Tasks checkpoint.
app.get("/api/priority-tasks/uncategorised", auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      priorityScore: {
        $gte: 50,
        $lte: 99,
      },
      completed: false,
      category: null,
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
// CATEGORY ROUTES
// --------------------------------------------------

// Get all categories
app.get("/api/categories", auth, async (req, res) => {
  try {
    const categories = await Category.find().sort({
      name: 1,
    });

    res.json(categories);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Create category
app.post("/api/categories", auth, async (req, res) => {
  try {
    const name = req.body.name?.trim();

    if (!name) {
      return res.status(400).json({
        message: "Category name required.",
      });
    }

    const category = new Category({
      name,
    });

    await category.save();

    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Category already exists.",
      });
    }

    res.status(500).json({
      error: error.message,
    });
  }
});

// Delete category
//
// Tasks using this category are not deleted.
// Their category is simply cleared.
app.delete("/api/categories/:id", auth, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found.",
      });
    }

    await Task.updateMany(
      {
        category: req.params.id,
      },
      {
        $set: {
          category: null,
        },
      },
    );

    res.json({
      message: "Category deleted.",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Get tasks in a category
//
// This is where tasks from different projects can be compared.
app.get("/api/categories/:id/tasks", auth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found.",
      });
    }

    const tasks = await Task.find({
      category: req.params.id,
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
        new: true,
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
