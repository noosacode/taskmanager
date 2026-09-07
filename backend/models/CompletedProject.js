const mongoose = require("mongoose");

const CompletedProjectSchema = new mongoose.Schema(
  {
    originalProjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    projectScoreAtCompletion: {
      type: Number,
      required: true,
    },

    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "completedProjects" },
);

module.exports = mongoose.model("CompletedProject", CompletedProjectSchema);
