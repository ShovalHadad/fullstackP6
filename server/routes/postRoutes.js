const express = require("express");
const mongoose = require("mongoose");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

const router = express.Router();

/*
GET /posts
GET /posts?userId=...
GET /posts?courseName=Full Stack
GET /posts?fromDate=2026-06-01
GET /posts?toDate=2026-06-30
GET /posts?dateSort=closest
GET /posts?dateSort=oldest

מחזיר פוסטים/שאלות.
תומך בסינון לפי:
1. userId
2. courseName
3. טווח תאריכים לפי createdAt
4. מיון לפי התאריך הקרוב ביותר / הישן ביותר

הסינון מתבצע מול MongoDB ולא בצד React,
כדי לצמצם גישות מיותרות לשרת ולבסיס הנתונים.
*/
router.get("/", async (req, res) => {
  try {
    const {
      userId,
      courseName,
      fromDate,
      toDate,
      dateSort
    } = req.query;

    const filter = {};

    // סינון לפי משתמש
    if (userId) {
      filter.userId = userId;
    }

    // סינון לפי שם קורס
    if (courseName) {
      filter.courseName = {
        $regex: courseName,
        $options: "i"
      };
    }

    // סינון לפי תאריך יצירת הפוסט
    if (fromDate || toDate) {
      filter.createdAt = {};

      // מתאריך מסוים
      if (fromDate) {
        filter.createdAt.$gte = new Date(fromDate);
      }

      // עד תאריך מסוים
      if (toDate) {
        const endDate = new Date(toDate);

        // מוסיפים יום אחד כדי לכלול את כל היום שנבחר
        endDate.setDate(endDate.getDate() + 1);

        filter.createdAt.$lt = endDate;
      }
    }

    /*
      מיון לפי תאריך:
      closest = הפוסטים החדשים ביותר קודם
      oldest = הפוסטים הישנים ביותר קודם

      ברירת מחדל: closest
    */
    let sortOption = { createdAt: -1 };

    if (dateSort === "oldest") {
      sortOption = { createdAt: 1 };
    }

    const posts = await Post.find(filter)
      .populate("userId", "fullName username email department studyYear role isBlocked")
      .sort(sortOption);

    res.json(posts);
  } catch (error) {
    console.error("Get posts error:", error.message);

    res.status(500).json({
      message: "Server error while getting posts"
    });
  }
});

/*
GET /posts/:id
מחזיר פוסט/שאלה אחת לפי id.
*/
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid post id"
      });
    }

    const post = await Post.findById(id).populate(
      "userId",
      "fullName username email department studyYear role isBlocked"
    );

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    res.json(post);
  } catch (error) {
    console.error("Get post error:", error.message);

    res.status(500).json({
      message: "Server error while getting post"
    });
  }
});

/*
POST /posts

יוצר פוסט/שאלה חדשה.
*/
router.post("/", async (req, res) => {
  try {
    const { userId, title, body, courseName } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({
        message: "userId, title and body are required"
      });
    }

    const newPost = await Post.create({
      userId,
      title,
      body,
      courseName
    });

    const postWithUser = await Post.findById(newPost._id).populate(
      "userId",
      "fullName username email department studyYear role isBlocked"
    );

    res.status(201).json(postWithUser);
  } catch (error) {
    console.error("Create post error:", error.message);

    res.status(500).json({
      message: "Server error while creating post"
    });
  }
});

/*
PUT /posts/:id

מעדכן פוסט/שאלה.
משתמש יכול לעדכן רק את הפוסט שלו.
*/
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, title, body, courseName } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid post id"
      });
    }

    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    const post = await Post.findOne({
      _id: id,
      userId: userId
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found or not yours"
      });
    }

    if (title !== undefined) {
      post.title = title;
    }

    if (body !== undefined) {
      post.body = body;
    }

    if (courseName !== undefined) {
      post.courseName = courseName;
    }

    const updatedPost = await post.save();

    const postWithUser = await Post.findById(updatedPost._id).populate(
      "userId",
      "fullName username email department studyYear role isBlocked"
    );

    res.json(postWithUser);
  } catch (error) {
    console.error("Update post error:", error.message);

    res.status(500).json({
      message: "Server error while updating post"
    });
  }
});

/*
DELETE /posts/:id?userId=...

מוחק פוסט/שאלה.
משתמש יכול למחוק רק את הפוסט שלו.
בנוסף מוחק גם את כל התגובות של אותו פוסט.
*/
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid post id"
      });
    }

    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    const deletedPost = await Post.findOneAndDelete({
      _id: id,
      userId: userId
    });

    if (!deletedPost) {
      return res.status(404).json({
        message: "Post not found or not yours"
      });
    }

    const deletedCommentsResult = await Comment.deleteMany({
      postId: id
    });

    res.json({
      message: "Post and its comments deleted successfully",
      deletedPost,
      deletedCommentsCount: deletedCommentsResult.deletedCount
    });
  } catch (error) {
    console.error("Delete post error:", error.message);

    res.status(500).json({
      message: "Server error while deleting post"
    });
  }
});

module.exports = router;