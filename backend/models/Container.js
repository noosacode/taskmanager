const mongoose = require("mongoose");

const ContainerSchema = new mongoose.Schema(
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
    collection: "containers",
  },
);

module.exports = mongoose.model("Container", ContainerSchema);
