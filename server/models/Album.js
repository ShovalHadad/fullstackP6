const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema(
  {
    // המשתמש שיצר את האלבום
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // שם האלבום
    title: {
      type: String,
      required: true,
      trim: true
    },

    // תיאור האלבום
    description: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Album", albumSchema);