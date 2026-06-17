const express = require("express");
const mongoose = require("mongoose");
const Album = require("../models/Album");
const Photo = require("../models/Photo");

const router = express.Router();// יוצר router נפרד לקובץ האלבומים

/*
GET /albums?userId=...

מחזיר אלבומים של משתמש.
הסינון מתבצע בשרת מול MongoDB לפי userId.
*/
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query; // מקבל את ה-userId מה-URL

    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    const albums = await Album.find({ userId }).sort({
      createdAt: -1
    });

    res.json(albums); // מחזיר את האלבומים של המשתמש
  } catch (error) {
    console.error("Get albums error:", error.message);

    res.status(500).json({
      message: "Server error while getting albums"
    });
  }
});

/*
POST /albums

יוצר אלבום חדש.
*/
router.post("/", async (req, res) => {
  try {
    const { userId, title, description } = req.body; // מקבל את הנתונים מהבקשה

    if (!userId || !title) {
      return res.status(400).json({
        message: "userId and title are required"
      });
    }

    const newAlbum = await Album.create({
      userId,
      title,
      description
    });

    res.status(201).json(newAlbum);
  } catch (error) {
    console.error("Create album error:", error.message);

    res.status(500).json({
      message: "Server error while creating album"
    });
  }
});
/*
DELETE /albums/:id?userId=...

מוחק אלבום של המשתמש.
קודם מוחק את כל התמונות ששייכות לאלבום,
ורק אחר כך מוחק את האלבום עצמו.
*/
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params; // מקבל את ה-id של האלבום מה-URL
    const { userId } = req.query;  // מקבל את ה-userId מה-URL

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid album id"
      });
    }

    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    // קודם בודקים שהאלבום קיים ושייך למשתמש
    const album = await Album.findOne({
      _id: id,
      userId: userId
    });

    if (!album) {
      return res.status(404).json({
        message: "Album not found or not yours"
      });
    }

    // קודם מוחקים את כל התמונות ששייכות לאלבום
    const deletedPhotosResult = await Photo.deleteMany({
      albumId: id
    });

    // אחרי שהתמונות נמחקו, מוחקים את האלבום עצמו
    const deletedAlbum = await Album.findByIdAndDelete(id);

    res.json({
      message: "Album and its photos deleted successfully",
      deletedAlbum,
      deletedPhotosCount: deletedPhotosResult.deletedCount
    });
  } catch (error) {
    console.error("Delete album error:", error.message);

    res.status(500).json({
      message: "Server error while deleting album"
    });
  }
});

module.exports = router;