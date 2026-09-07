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

    projectScore: {
      type: Number,
      default: 0, // 0–99
      min: 0,
      max: 99,
    },

    // Array of Task ObjectIds
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "projects" },
);

module.exports = mongoose.model("Project", ProjectSchema);
