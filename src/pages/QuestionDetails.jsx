import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API_URL from "../services/api";

function QuestionDetails() {
  // id של השאלה מתוך הכתובת
  const { id } = useParams();

  // המשתמש המחובר
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // id של המשתמש המחובר
  const userId =
    currentUser?.user?._id ||
    currentUser?.user?.id ||
    currentUser?._id ||
    currentUser?.id;

  // השאלה הנוכחית
  const [post, setPost] = useState(null);

  // רשימת תגובות
  const [comments, setComments] = useState([]);

  // תגובה חדשה
  const [newComment, setNewComment] = useState("");

  // שמירת התגובה שנמצאת כרגע בעריכה
  const [editingCommentId, setEditingCommentId] = useState(null);

  // הטקסט של התגובה בזמן עריכה
  const [editCommentBody, setEditCommentBody] = useState("");

  // הודעות
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // טעינה בכניסה לעמוד
  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  // הבאת פרטי השאלה
  const fetchPost = async () => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/posts/${id}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load question");
        return;
      }

      setPost(data);
    } catch (err) {
      console.error("Fetch post error:", err);
      setError("Cannot connect to server");
    }
  };

  // הבאת תגובות של השאלה
  const fetchComments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/comments?postId=${id}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load comments");
        return;
      }

      setComments(data);
    } catch (err) {
      console.error("Fetch comments error:", err);
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  // הוספת תגובה חדשה
  const addComment = async (event) => {
    event.preventDefault();

    // לא מאפשרים תגובה ריקה
    if (!newComment.trim()) {
      setError("Comment body is required");
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          postId: id,
          userId,
          body: newComment
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to add comment");
        return;
      }

      // ניקוי השדה וטעינה מחדש
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error("Add comment error:", err);
      setError("Cannot connect to server");
    }
  };

  // בדיקה אם תגובה שייכת למשתמש המחובר
  const isMyComment = (comment) => {
    const commentUserId = comment.userId?._id || comment.userId;
    return String(commentUserId) === String(userId);
  };

  // התחלת עריכה של תגובה
  const startEditComment = (comment) => {
    const commentId = comment._id || comment.id;

    setEditingCommentId(commentId);
    setEditCommentBody(comment.body);
  };

  // ביטול עריכת תגובה
  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentBody("");
  };

  // שמירת עריכת תגובה
  const saveEditComment = async (commentId) => {
    // לא מאפשרים לשמור תגובה ריקה
    if (!editCommentBody.trim()) {
      setError("Comment body is required");
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId,
          body: editCommentBody
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update comment");
        return;
      }

      // סיום מצב עריכה וטעינת תגובות מחדש
      cancelEditComment();
      fetchComments();
    } catch (err) {
      console.error("Update comment error:", err);
      setError("Cannot connect to server");
    }
  };

  // מחיקת תגובה
  const deleteComment = async (commentId) => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/comments/${commentId}?userId=${userId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to delete comment");
        return;
      }

      fetchComments();
    } catch (err) {
      console.error("Delete comment error:", err);
      setError("Cannot connect to server");
    }
  };

  return (
    <div className="questions-page">
      <div className="questions-container">
        <div className="questions-top">
          <div>
            <h1>Question Details</h1>
            <p>Read the question and join the discussion</p>
          </div>

          <Link to="/questions" className="back-home-link">
            Back to Questions
          </Link>
        </div>

        {error && <p className="error-message">{error}</p>}

        {post && (
          <div className="question-details-card">
            <span className="task-number">Question</span>

            <h2>{post.title}</h2>

            {post.courseName && (
              <p className="question-course">Course: {post.courseName}</p>
            )}

            <p>{post.body}</p>

            <p className="question-author">
              By: {post.userId?.fullName || post.userId?.username || "Student"}
            </p>
          </div>
        )}

        {/* טופס הוספת תגובה */}
        <form className="comment-form" onSubmit={addComment}>
          <textarea
            placeholder="Write your answer..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />

          <button type="submit">Add Comment</button>
        </form>

        <h2 className="comments-title">Comments</h2>

        {loading ? (
          <p className="empty-message">Loading comments...</p>
        ) : (
          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="empty-message">No comments yet</p>
            ) : (
              comments.map((comment, index) => {
                const commentId = comment._id || comment.id;

                return (
                  <div className="comment-item" key={commentId}>
                    <div className="comment-content">
                      <span className="task-number">
                        Comment #{index + 1}
                      </span>

                      {editingCommentId === commentId ? (
                        <div className="edit-post-box">
                          <textarea
                            value={editCommentBody}
                            onChange={(e) => setEditCommentBody(e.target.value)}
                          />

                          <div className="edit-buttons">
                            <button
                              type="button"
                              onClick={() => saveEditComment(commentId)}
                            >
                              Save
                            </button>

                            <button
                              type="button"
                              onClick={cancelEditComment}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p>{comment.body}</p>
                      )}

                      <p className="question-author">
                        By: {comment.userId?.fullName || comment.userId?.username || "Student"}
                      </p>
                    </div>

                    {isMyComment(comment) && (
                      <div className="question-actions">
                        <button
                          className="edit-btn"
                          onClick={() => startEditComment(comment)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-task-btn"
                          onClick={() => deleteComment(commentId)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionDetails;