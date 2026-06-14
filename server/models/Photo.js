const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema(
  {
    // האלבום שאליו התמונה שייכת
    albumId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album",
      required: true
    },

    // המשתמש שהוסיף את התמונה
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // כותרת התמונה
    title: {
      type: String,
      required: true,
      trim: true
    },

    // כתובת URL של התמונה
    // כדי לא להסתבך עם העלאת קבצים, שומרים URL בלבד
    url: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Photo", photoSchema);