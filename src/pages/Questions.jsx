import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../services/api";

function Questions() {
  // המשתמש המחובר מתוך localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // שליפת id של המשתמש המחובר
  const userId =
    currentUser?.user?._id ||
    currentUser?.user?.id ||
    currentUser?._id ||
    currentUser?.id;

  // רשימת השאלות
  const [posts, setPosts] = useState([]);

  // נתוני שאלה חדשה
  const [newPost, setNewPost] = useState({
    title: "",
    body: "",
    courseName: ""
  });

  // סינונים לשאלות
  const [filters, setFilters] = useState({
    courseName: "",
    fromDate: "",
    toDate: "",
    dateSort: "closest"
  });

  // הפוסט שנמצא כרגע בעריכה
  const [editingPostId, setEditingPostId] = useState(null);

  // נתוני הפוסט בזמן עריכה
  const [editPostData, setEditPostData] = useState({
    title: "",
    body: "",
    courseName: ""
  });

  // הודעות מצב
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // מפתח ייחודי לשמירת שאלות לפי הסינונים הנוכחיים
  const getPostsStorageKey = () =>
    `posts_${filters.courseName}_${filters.fromDate}_${filters.toDate}_${filters.dateSort}`;

  // שמירת רשימת השאלות ב-sessionStorage
  const savePostsToCache = (updatedPosts) => {
    sessionStorage.setItem(getPostsStorageKey(), JSON.stringify(updatedPosts));
  };

  /*
    שמירת שאלה בודדת לפני מעבר לעמוד הפירוט.

    המטרה:
    כשפותחים פוסט מתוך רשימת השאלות,
    לא צריך לעשות שוב GET /posts/:id.
    QuestionDetails יקח את הפוסט מה-sessionStorage.
  */
  const saveSinglePostToCache = (post) => {
    const postId = post._id || post.id;
    sessionStorage.setItem(`question_${postId}`, JSON.stringify(post));
  };

  /*
    טעינת שאלות כאשר העמוד נפתח.

    קודם בודקים אם הרשימה כבר קיימת ב-sessionStorage.
    אם כן — מציגים אותה בלי קריאה לשרת.
    אם לא — עושים GET אחד לשרת.
  */
  useEffect(() => {
    const savedPosts = sessionStorage.getItem(getPostsStorageKey());

    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
      return;
    }

    fetchPosts();
  }, []);

  // הבאת שאלות מהשרת לפי הסינונים
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (filters.courseName.trim()) {
        params.append("courseName", filters.courseName);
      }

      if (filters.fromDate) {
        params.append("fromDate", filters.fromDate);
      }

      if (filters.toDate) {
        params.append("toDate", filters.toDate);
      }

      if (filters.dateSort) {
        params.append("dateSort", filters.dateSort);
      }

      const response = await fetch(`${API_URL}/posts?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load questions");
        return;
      }

      setPosts(data);
      savePostsToCache(data);
    } catch (err) {
      console.error("Fetch posts error:", err);
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  // עדכון שדות שאלה חדשה
  const handleChange = (event) => {
    const { name, value } = event.target;

    setNewPost({
      ...newPost,
      [name]: value
    });
  };

  // עדכון שדות הסינון
  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters({
      ...filters,
      [name]: value
    });
  };

  // ניקוי סינונים
  const clearFilters = () => {
    setFilters({
      courseName: "",
      fromDate: "",
      toDate: "",
      dateSort: "closest"
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

      /*
        צמצום קריאות:
        לא עושים fetchPosts אחרי הוספה.
        מעדכנים את state ואת sessionStorage.
      */
      setPosts((prevPosts) => {
        const updatedPosts = [data, ...prevPosts];

        savePostsToCache(updatedPosts);
        saveSinglePostToCache(data);

        return updatedPosts;
      });
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

      /*
        צמצום קריאות:
        אחרי מחיקה לא עושים GET מחדש.
        מסירים מה-state ומה-cache.
      */
      setPosts((prevPosts) => {
        const updatedPosts = prevPosts.filter((post) => {
          const currentId = post._id || post.id;
          return currentId !== postId;
        });

        savePostsToCache(updatedPosts);

        // אם הפוסט נמחק, מוחקים גם את הפרטים והתגובות שלו מה-cache
        sessionStorage.removeItem(`question_${postId}`);
        sessionStorage.removeItem(`comments_${postId}`);

        return updatedPosts;
      });
    } catch (err) {
      console.error("Delete post error:", err);
      setError("Cannot connect to server");
    }
  };

  // התחלת עריכת שאלה
  const startEditPost = (post) => {
    const postId = post._id || post.id;

    setEditingPostId(postId);

    setEditPostData({
      title: post.title,
      body: post.body,
      courseName: post.courseName || ""
    });
  };

  // ביטול עריכת שאלה
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

      /*
        צמצום קריאות:
        אחרי עריכה לא עושים GET מחדש.
        מעדכנים את הפוסט גם ברשימה וגם ב-cache של הפוסט הבודד.
      */
      setPosts((prevPosts) => {
        const updatedPosts = prevPosts.map((post) => {
          const currentId = post._id || post.id;

          if (currentId === postId) {
            return data;
          }

          return post;
        });

        savePostsToCache(updatedPosts);
        saveSinglePostToCache(data);

        return updatedPosts;
      });

      cancelEditPost();
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

        {/* אזור סינונים */}
        <div className="filters-box">
          <div className="filter-field">
            <label>Course</label>
            <input
              type="text"
              name="courseName"
              placeholder="Search by course"
              value={filters.courseName}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-field">
            <label>From Date</label>
            <input
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-field">
            <label>To Date</label>
            <input
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-field">
            <label>Sort</label>
            <select
              name="dateSort"
              value={filters.dateSort}
              onChange={handleFilterChange}
            >
              <option value="closest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          <div className="filter-buttons">
            <button type="button" className="filter-btn" onClick={fetchPosts}>
              Filter
            </button>

            <button type="button" className="clear-filter-btn" onClick={clearFilters}>
              Clear
            </button>
          </div>
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

                          {post.createdAt && (
                            <p className="question-date">
                              Created: {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          )}
                        </>
                      )}

                      <p className="question-author">
                        By: {post.userId?.fullName || post.userId?.username || "Student"}
                      </p>
                    </div>

                    <div className="question-actions">
                      {/*
                        לפני המעבר לעמוד הפירוט שומרים את הפוסט ב-cache.
                        כך QuestionDetails לא יצטרך לעשות GET /posts/:id.
                      */}
                      <Link
                        to={`/questions/${postId}`}
                        className="open-question-btn"
                        onClick={() => saveSinglePostToCache(post)}
                      >
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