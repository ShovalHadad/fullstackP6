import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../services/api";

function Questions() {
  // המשתמש המחובר
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // שליפת id של המשתמש
  const userId =
    currentUser?.user?._id ||
    currentUser?.user?.id ||
    currentUser?._id ||
    currentUser?.id;

  // רשימת שאלות
  const [posts, setPosts] = useState([]);

  // שאלה חדשה
  const [newPost, setNewPost] = useState({
    title: "",
    body: "",
    courseName: ""
  });

  // סינון לפי קורס
  const [courseFilter, setCourseFilter] = useState("");

  // שמירת הפוסט שנמצא כרגע בעריכה
  const [editingPostId, setEditingPostId] = useState(null);

  // הנתונים של הפוסט בזמן עריכה
  const [editPostData, setEditPostData] = useState({
    title: "",
    body: "",
    courseName: ""
  });

  // הודעות
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // טעינת שאלות בכניסה לעמוד
  useEffect(() => {
    fetchPosts();
  }, []);

  // הבאת שאלות מהשרת
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");

      let url = `${API_URL}/posts`;

      if (courseFilter.trim()) {
        url += `?courseName=${courseFilter}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load questions");
        return;
      }

      setPosts(data);
    } catch (err) {
      console.error("Fetch posts error:", err);
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  // עדכון שדות של שאלה חדשה
  const handleChange = (event) => {
    const { name, value } = event.target;

    setNewPost({
      ...newPost,
      [name]: value
    });
  };

  // הוספת שאלה חדשה
  const addPost = async (event) => {
    event.preventDefault();

    if (!newPost.title.trim()) {
      setError("Question title is required");
      return;
    }

    if (!newPost.body.trim()) {
      setError("Question body is required");
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId,
          title: newPost.title,
          body: newPost.body,
          courseName: newPost.courseName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to add question");
        return;
      }

      setNewPost({
        title: "",
        body: "",
        courseName: ""
      });

      fetchPosts();
    } catch (err) {
      console.error("Add post error:", err);
      setError("Cannot connect to server");
    }
  };

  // בדיקה אם הפוסט שייך למשתמש המחובר
  const isMyPost = (post) => {
    const postUserId = post.userId?._id || post.userId;
    return String(postUserId) === String(userId);
  };

  // מחיקת שאלה
  const deletePost = async (postId) => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/posts/${postId}?userId=${userId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to delete question");
        return;
      }

      fetchPosts();
    } catch (err) {
      console.error("Delete post error:", err);
      setError("Cannot connect to server");
    }
  };

  // התחלת עריכה של שאלה
  const startEditPost = (post) => {
    const postId = post._id || post.id;

    setEditingPostId(postId);

    setEditPostData({
      title: post.title,
      body: post.body,
      courseName: post.courseName || ""
    });
  };

  // ביטול עריכה
  const cancelEditPost = () => {
    setEditingPostId(null);

    setEditPostData({
      title: "",
      body: "",
      courseName: ""
    });
  };

  // עדכון שדות בזמן עריכה
  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditPostData({
      ...editPostData,
      [name]: value
    });
  };

  // שמירת עריכת שאלה
  const saveEditPost = async (postId) => {
    if (!editPostData.title.trim()) {
      setError("Question title is required");
      return;
    }

    if (!editPostData.body.trim()) {
      setError("Question body is required");
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId,
          title: editPostData.title,
          body: editPostData.body,
          courseName: editPostData.courseName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update question");
        return;
      }

      cancelEditPost();
      fetchPosts();
    } catch (err) {
      console.error("Update post error:", err);
      setError("Cannot connect to server");
    }
  };

  return (
    <div className="questions-page">
      <div className="questions-container">
        <div className="questions-top">
          <div>
            <h1>Questions</h1>
            <p>Ask questions and help other students</p>
          </div>

          <Link to="/home" className="back-home-link">
            Back Home
          </Link>
        </div>

        {error && <p className="error-message">{error}</p>}

        {/* טופס הוספת שאלה */}
        <form className="question-form" onSubmit={addPost}>
          <input
            type="text"
            name="title"
            placeholder="Question title"
            value={newPost.title}
            onChange={handleChange}
          />

          <input
            type="text"
            name="courseName"
            placeholder="Course name"
            value={newPost.courseName}
            onChange={handleChange}
          />

          <textarea
            name="body"
            placeholder="Write your question..."
            value={newPost.body}
            onChange={handleChange}
          />

          <button type="submit">Add Question</button>
        </form>

        {/* סינון לפי קורס */}
        <div className="questions-filter">
          <input
            type="text"
            placeholder="Search by course name"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          />

          <button onClick={fetchPosts}>Filter</button>
        </div>

        {loading ? (
          <p className="empty-message">Loading questions...</p>
        ) : (
          <div className="questions-list">
            {posts.length === 0 ? (
              <p className="empty-message">No questions yet</p>
            ) : (
              posts.map((post, index) => {
                const postId = post._id || post.id;

                return (
                  <div className="question-item" key={postId}>
                    <div className="question-content">
                      <span className="task-number">Post #{index + 1}</span>

                      {editingPostId === postId ? (
                        <div className="edit-post-box">
                          <input
                            type="text"
                            name="title"
                            value={editPostData.title}
                            onChange={handleEditChange}
                          />

                          <input
                            type="text"
                            name="courseName"
                            value={editPostData.courseName}
                            onChange={handleEditChange}
                          />

                          <textarea
                            name="body"
                            value={editPostData.body}
                            onChange={handleEditChange}
                          />

                          <div className="edit-buttons">
                            <button
                              type="button"
                              onClick={() => saveEditPost(postId)}
                            >
                              Save
                            </button>

                            <button
                              type="button"
                              onClick={cancelEditPost}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3>{post.title}</h3>

                          {post.courseName && (
                            <p className="question-course">
                              Course: {post.courseName}
                            </p>
                          )}

                          <p>{post.body}</p>
                        </>
                      )}

                      <p className="question-author">
                        By: {post.userId?.fullName || post.userId?.username || "Student"}
                      </p>
                    </div>

                    <div className="question-actions">
                      <Link to={`/questions/${postId}`} className="open-question-btn">
                        Open
                      </Link>

                      {isMyPost(post) && (
                        <>
                          <button
                            className="edit-btn"
                            onClick={() => startEditPost(post)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-task-btn"
                            onClick={() => deletePost(postId)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
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

export default Questions;