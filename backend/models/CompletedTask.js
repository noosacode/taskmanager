const mongoose = require("mongoose");

const CompletedTaskSchema = new mongoose.Schema(
  {
    originalTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

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

    sequenceScoreAtCompletion: {
      type: Number,
      required: true,
    },

    focusScoreAtCompletion: {
      type: Number,
      required: true,
    },

    categories: {
      type: [String],
      default: [],
    },

    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "completedTasks" },
);

module.exports = mongoose.model("CompletedTask", CompletedTaskSchema);
