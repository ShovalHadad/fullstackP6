const express = require("express");
const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Post = require("../models/Post");

const router = express.Router();

/*
GET /comments?postId=...
מחזיר את כל התגובות לפוסט/שאלה מסוימת.
Returns all comments for a specific post/question.
*/
router.get("/", async (req, res) => {
  try {
    const { postId } = req.query;

    if (!postId) {
      return res.status(400).json({
        message: "postId is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        message: "Invalid post id"
      });
    }

    const comments = await Comment.find({ postId })
      .populate("userId", "fullName username email department studyYear")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    console.error("Get comments error:", error.message);

    res.status(500).json({
      message: "Server error while getting comments"
    });
  }
});

/*
POST /comments
יוצר תגובה/תשובה חדשה לפוסט.
Creates a new comment/answer for a post.

Body:
{
  "postId": "...",
  "userId": "...",
  "body": "Use app.use('/posts', postRoutes)"
}
*/
router.post("/", async (req, res) => {
  try {
    const { postId, userId, body } = req.body;

    if (!postId || !userId || !body) {
      return res.status(400).json({
        message: "postId, userId and body are required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        message: "Invalid post id"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user id"
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    const newComment = await Comment.create({
      postId,
      userId,
      body
    });

    const commentWithUser = await Comment.findById(newComment._id).populate(
      "userId",
      "fullName username email department studyYear"
    );

    res.status(201).json(commentWithUser);
  } catch (error) {
    console.error("Create comment error:", error.message);

    res.status(500).json({
      message: "Server error while creating comment"
    });
  }
});

/*
PUT /comments/:id
מעדכן תגובה.
משתמש יכול לעדכן רק את התגובה שלו.
Updates a comment.
User can update only his own comment.
*/
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, body } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid comment id"
      });
    }

    if (!userId || !body) {
      return res.status(400).json({
        message: "userId and body are required"
      });
    }

    const comment = await Comment.findOne({
      _id: id,
      userId: userId
    });

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found or not yours"
      });
    }

    comment.body = body;

    const updatedComment = await comment.save();

    const commentWithUser = await Comment.findById(updatedComment._id).populate(
      "userId",
      "fullName username email department studyYear"
    );

    res.json(commentWithUser);
  } catch (error) {
    console.error("Update comment error:", error.message);

    res.status(500).json({
      message: "Server error while updating comment"
    });
  }
});

/*
DELETE /comments/:id?userId=...
מחיק תגובה.
משתמש יכול למחוק רק את התגובה שלו.
Deletes a comment.
User can delete only his own comment.
*/
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid comment id"
      });
    }

    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    const deletedComment = await Comment.findOneAndDelete({
      _id: id,
      userId: userId
    });

    if (!deletedComment) {
      return res.status(404).json({
        message: "Comment not found or not yours"
      });
    }

    res.json({
      message: "Comment deleted successfully",
      deletedComment
    });
  } catch (error) {
    console.error("Delete comment error:", error.message);

    res.status(500).json({
      message: "Server error while deleting comment"
    });
  }
});

module.exports = router;