const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    details: {
      type: String,
      default: "",
      trim: true,
    },

    sequenceScore: {
      type: Number,
      default: 0, // 0–99
      min: 0,
      max: 99,
    },

    focusScore: {
      type: Number,
      default: 0, // 0–99 (category-based sorting)
      min: 0,
      max: 99,
    },

    categories: {
      type: [String], // multi-select categories
      default: [],
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "tasks" },
);

module.exports = mongoose.model("Task", TaskSchema);
