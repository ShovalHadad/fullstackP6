const express = require("express");
const mongoose = require("mongoose");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

const router = express.Router();

/*
GET /posts
GET /posts?userId=...
GET /posts?courseName=Full Stack
מחזיר פוסטים/שאלות.
תומך בסינון לפי userId ו courseName.
Returns posts/questions.
Supports filtering by userId and courseName.
*/
router.get("/", async (req, res) => {
  try {
    const { userId, courseName } = req.query;

    const filter = {};

    if (userId) {
      filter.userId = userId;
    }

    if (courseName) {
      filter.courseName = {
        $regex: courseName,
        $options: "i"
      };
    }

    const posts = await Post.find(filter)
      .populate("userId", "fullName username email department studyYear")
      .sort({ createdAt: -1 });

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
Returns one post/question by id.
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
      "fullName username email department studyYear"
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
Creates a new question/post.

Body:
{
  "userId": "...",
  "title": "How do I connect MongoDB to Express?",
  "body": "I need help with mongoose connection",
  "courseName": "Full Stack"
}
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
      "fullName username email department studyYear"
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
Updates a post/question.
User can update only his own post.
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
      "fullName username email department studyYear"
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
מחיק פוסט/שאלה.
משתמש יכול למחוק רק את הפוסט שלו.
Deletes a post/question.
User can delete only his own post.
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

    await Comment.deleteMany({ postId: id });

    res.json({
      message: "Post deleted successfully",
      deletedPost
    });
  } catch (error) {
    console.error("Delete post error:", error.message);

    res.status(500).json({
      message: "Server error while deleting post"
    });
  }
});

module.exports = router;