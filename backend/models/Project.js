const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
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

    projectPriorityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 99,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "completed"],
      default: "active",
    },

    container: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Container",
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "projects",
  },
);

module.exports = mongoose.model("Project", ProjectSchema);
