const express = require("express");
const mongoose = require("mongoose");
const Photo = require("../models/Photo");
const Album = require("../models/Album");

const router = express.Router(); //יוצר router נפרד לקובץ התמונות

/*
GET /photos?albumId=...

מחזיר תמונות לפי אלבום.
הסינון מתבצע בצד השרת מול MongoDB.
*/
router.get("/", async (req, res) => {
  try {
    const { albumId } = req.query; // מקבל את ה-albumId מה-URL

    if (!albumId) { //מוודא שה-albumId תקין 
      return res.status(400).json({
        message: "albumId is required"
      });
    }
    
    const photos = await Photo.find({ albumId }).sort({
      createdAt: -1
    });

    res.json(photos);  // מחזיר את התמונות של האלבום
  } catch (error) {
    console.error("Get photos error:", error.message);

    res.status(500).json({
      message: "Server error while getting photos"
    });
  }
});

/*
POST /photos

יוצר תמונה חדשה לפי URL.
*/
router.post("/", async (req, res) => {
  try {
    const { albumId, userId, title, url } = req.body;

    if (!albumId || !userId || !title || !url) {
      return res.status(400).json({
        message: "albumId, userId, title and url are required"
      });
    }

    const album = await Album.findOne({
      _id: albumId,
      userId
    });

    if (!album) {
      return res.status(404).json({
        message: "Album not found or not yours"
      });
    }

    const newPhoto = await Photo.create({
      albumId,
      userId,
      title,
      url
    });

    res.status(201).json(newPhoto);
  } catch (error) {
    console.error("Create photo error:", error.message);

    res.status(500).json({
      message: "Server error while creating photo"
    });
  }
});

/*
DELETE /photos/:id?userId=...

מוחק תמונה של המשתמש.
*/
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {//בודק שה־id תקין מבחינת MongoDB
      return res.status(400).json({
        message: "Invalid photo id"
      });
    }

    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    const deletedPhoto = await Photo.findOneAndDelete({
      _id: id,
      userId
    });

    if (!deletedPhoto) {
      return res.status(404).json({
        message: "Photo not found or not yours"
      });
    }

    res.json({
      message: "Photo deleted successfully",
      deletedPhoto
    });
  } catch (error) {
    console.error("Delete photo error:", error.message);

    res.status(500).json({
      message: "Server error while deleting photo"
    });
  }
});

module.exports = router;