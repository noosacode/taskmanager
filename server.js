require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("./backend/models/User");
const CrudDocument = require("./backend/models/Project");
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
// CRUD DOCUMENT ROUTES
// -------------------------

// Get all documents
app.get("/api/documents", auth, async (req, res) => {
  try {
    const documents = await CrudDocument.find().sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get one document
app.get("/api/documents/:id", auth, async (req, res) => {
  try {
    const document = await CrudDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        message: "Document not found.",
      });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create document
app.post("/api/documents", auth, async (req, res) => {
  try {
    const document = new CrudDocument(req.body);

    await document.save();

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update document
app.put("/api/documents/:id", auth, async (req, res) => {
  try {
    const document = await CrudDocument.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!document) {
      return res.status(404).json({
        message: "Document not found.",
      });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete document
app.delete("/api/documents/:id", auth, async (req, res) => {
  try {
    const document = await CrudDocument.findByIdAndDelete(req.params.id);

    if (!document) {
      return res.status(404).json({
        message: "Document not found.",
      });
    }

    res.json({
      message: "Document deleted.",
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
