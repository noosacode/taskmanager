const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    collection: "sessions",
  },
);

module.exports = mongoose.model("Session", SessionSchema);
