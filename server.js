require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("./backend/models/User");
const Project = require("./backend/models/Project");
const Task = require("./backend/models/Task");
const CompletedProject = require("./backend/models/CompletedProject");
const CompletedTask = require("./backend/models/CompletedTask");
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
  } catch (err) {
    res.status(500).send(err.message);
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
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "5h" },
    );

    res.json({ token });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Home page
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

// -------------------------
// CRUD PROJECT ROUTES
// -------------------------

// Get all projects
app.get("/api/projects", auth, async (req, res) => {
  try {
    const projects = await Project.find().sort({ projectScore: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get one project
app.get("/api/projects/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("tasks");

    if (!project) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create project
app.post("/api/projects", auth, async (req, res) => {
  try {
    const project = new Project(req.body);

    await project.save();

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update project
app.put("/api/projects/:id", auth, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete project
app.delete("/api/projects/:id", auth, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    // Delete all tasks belonging to this project
    await Task.deleteMany({ projectId: req.params.id });

    res.json({
      message: "Project deleted.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------
// TASK ROUTES
// -------------------------

// Create task (belongs to a project)
app.post("/api/projects/:projectId/tasks", auth, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      projectId: req.params.projectId,
    });

    await task.save();

    // Add task to project.tasks array
    await Project.findByIdAndUpdate(req.params.projectId, {
      $push: { tasks: task._id },
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all tasks for a project
app.get("/api/projects/:projectId/tasks", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId })
      .sort({ sequenceScore: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get one task
app.get("/api/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task
app.put("/api/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete task
app.delete("/api/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    // Remove task from its project.tasks array
    await Project.findByIdAndUpdate(task.projectId, {
      $pull: { tasks: task._id },
    });

    res.json({ message: "Task deleted." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------
// CATEGORY ROUTES
// -------------------------

// Get all categories (unique list)
app.get("/api/categories", auth, async (req, res) => {
  try {
    const tasks = await Task.find({}, "categories");
    const categorySet = new Set();

    tasks.forEach(t => {
      t.categories.forEach(c => categorySet.add(c));
    });

    res.json([...categorySet]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new category (adds to all tasks? No — categories exist only when used)
app.post("/api/categories", auth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Category name required." });
    }

    res.status(201).json({ message: "Category created.", name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rename a category
app.put("/api/categories/:oldName", auth, async (req, res) => {
  try {
    const { newName } = req.body;

    if (!newName || newName.trim() === "") {
      return res.status(400).json({ message: "New category name required." });
    }

    await Task.updateMany(
      { categories: req.params.oldName },
      { $set: { "categories.$": newName } }
    );

    res.json({ message: "Category renamed." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a category (remove from all tasks)
app.delete("/api/categories/:name", auth, async (req, res) => {
  try {
    await Task.updateMany(
      { categories: req.params.name },
      { $pull: { categories: req.params.name } }
    );

    res.json({ message: "Category deleted." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tasks in a category (sorted by focusScore)
app.get("/api/categories/:name/tasks", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ categories: req.params.name })
      .sort({ focusScore: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------
// PROGRESS PAGE ROUTES
// -------------------------

// Get progress summary
app.get("/api/progress", auth, async (req, res) => {
  try {
    // Count totals
    const tasksAdded = await Task.countDocuments();
    const tasksCompleted = await CompletedTask.countDocuments();
    const projectsCompleted = await CompletedProject.countDocuments();

    // Streak: days with at least one completed task
    const streakData = await CompletedTask.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$completedAt" },
            month: { $month: "$completedAt" },
            day: { $dayOfMonth: "$completedAt" }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const streak = streakData.length;

    // Project activity ranking (last 10 days)
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const activity = await CompletedTask.aggregate([
      { $match: { completedAt: { $gte: tenDaysAgo } } },
      {
        $group: {
          _id: "$projectId",
          completedTasks: { $sum: 1 }
        }
      },
      { $sort: { completedTasks: -1 } }
    ]);

    res.json({
      tasksAdded,
      tasksCompleted,
      projectsCompleted,
      streak,
      activity
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------
// COMPLETION LOG ROUTES
// -------------------------

// Get completion log (tasks + projects)
app.get("/api/completion-log", auth, async (req, res) => {
  try {
    // Completed tasks
    const completedTasks = await CompletedTask.find()
      .sort({ completedAt: -1 });

    // Completed projects
    const completedProjects = await CompletedProject.find()
      .sort({ completedAt: -1 });

    res.json({
      completedTasks,
      completedProjects
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------
// TASK COMPLETION ROUTES
// -------------------------

// Complete a task
app.post("/api/tasks/:id/complete", auth, async (req, res) => {
  try {
    // 1. Find the active task
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    // 2. Create CompletedTask entry
    const completedTask = new CompletedTask({
      originalTaskId: task._id,
      projectId: task.projectId,
      name: task.name,
      details: task.details,
      sequenceScoreAtCompletion: task.sequenceScore,
      focusScoreAtCompletion: task.focusScore,
      categories: task.categories,
      completedAt: Date.now(),
    });

    await completedTask.save();

    // 3. Remove task from active tasks
    await Task.findByIdAndDelete(task._id);

    // 4. Remove task from its project.tasks array
    await Project.findByIdAndUpdate(task.projectId, {
      $pull: { tasks: task._id },
    });

    res.json({
      message: "Task completed.",
      completedTask,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------
// PROJECT COMPLETION ROUTES
// -------------------------

// Complete a project
app.post("/api/projects/:id/complete", auth, async (req, res) => {
  try {
    // 1. Find the active project
    const project = await Project.findById(req.params.id).populate("tasks");

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    // 2. Create CompletedProject entry
    const completedProject = new CompletedProject({
      originalProjectId: project._id,
      title: project.title,
      description: project.description,
      projectScoreAtCompletion: project.projectScore,
      completedAt: Date.now(),
    });

    await completedProject.save();

    // 3. Move all tasks to CompletedTask
    for (const task of project.tasks) {
      const completedTask = new CompletedTask({
        originalTaskId: task._id,
        projectId: project._id,
        name: task.name,
        details: task.details,
        sequenceScoreAtCompletion: task.sequenceScore,
        focusScoreAtCompletion: task.focusScore,
        categories: task.categories,
        completedAt: Date.now(),
      });

      await completedTask.save();

      // Delete active task
      await Task.findByIdAndDelete(task._id);
    }

    // 4. Delete the active project
    await Project.findByIdAndDelete(project._id);

    res.json({
      message: "Project completed.",
      completedProject,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server locally
if (require.main === module) {
  app.listen(3000, function () {
    console.log("Server running on http://localhost:3000");
  });
}

module.exports = app;
