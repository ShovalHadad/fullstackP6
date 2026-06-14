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

  /*
    סינונים לשאלות.

    courseName:
    - סינון לפי שם קורס

    fromDate:
    - הצגת פוסטים שנוצרו מתאריך מסוים

    toDate:
    - הצגת פוסטים שנוצרו עד תאריך מסוים

    dateSort:
    - closest = החדשים ביותר קודם
    - oldest = הישנים ביותר קודם
  */
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

  // טעינת שאלות כאשר העמוד נפתח
  useEffect(() => {
    fetchPosts();
  }, []);

  // הבאת שאלות מהשרת
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");

      /*
        URLSearchParams בונה את הפרמטרים לכתובת בצורה תקינה.

        לדוגמה:
        /posts?courseName=Full+Stack&fromDate=2026-06-01&toDate=2026-06-30&dateSort=closest

        ככה הסינון מתבצע בצד השרת ובבסיס הנתונים,
        ולא מביאים את כל הפוסטים ואז מסננים ב-React.
      */
      const params = new URLSearchParams();

      // אם המשתמש כתב קורס לחיפוש, מוסיפים אותו לכתובת
      if (filters.courseName.trim()) {
        params.append("courseName", filters.courseName);
      }

      // סינון מתאריך מסוים
      if (filters.fromDate) {
        params.append("fromDate", filters.fromDate);
      }

      // סינון עד תאריך מסוים
      if (filters.toDate) {
        params.append("toDate", filters.toDate);
      }

      // מיון לפי תאריך: closest / oldest
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

  // עדכון שדות הסינון
  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters({
      ...filters,
      [name]: value
    });
  };

  // ניקוי כל הסינונים
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

    // כותרת היא שדה חובה
    if (!newPost.title.trim()) {
      setError("Question title is required");
      return;
    }

    // גוף השאלה הוא שדה חובה
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

      // ניקוי הטופס לאחר הוספה
      setNewPost({
        title: "",
        body: "",
        courseName: ""
      });

      /*
        צמצום פניות לשרת ולבסיס הנתונים:
        במקום לקרוא שוב ל-fetchPosts ולעשות GET חדש,
        מוסיפים את השאלה החדשה ישירות ל-state.
      */
      setPosts([data, ...posts]);
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
        צמצום פניות לשרת ולבסיס הנתונים:
        במקום להביא שוב את כל השאלות מהשרת,
        מסירים מה-state רק את השאלה שנמחקה.
      */
      setPosts(
        posts.filter((post) => {
          const currentId = post._id || post.id;
          return currentId !== postId;
        })
      );
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
    // כותרת היא שדה חובה
    if (!editPostData.title.trim()) {
      setError("Question title is required");
      return;
    }

    // גוף השאלה הוא שדה חובה
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
        צמצום פניות לשרת ולבסיס הנתונים:
        במקום לעשות GET מחדש לכל השאלות,
        מחליפים ב-state רק את הפוסט שהתעדכן.
      */
      setPosts(
        posts.map((post) => {
          const currentId = post._id || post.id;

          if (currentId === postId) {
            return data;
          }

          return post;
        })
      );

      // יציאה ממצב עריכה
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

        {/* סינון שאלות לפי קורס ותאריך */}
        <div className="questions-filter">
          <input
            type="text"
            name="courseName"
            placeholder="Search by course name"
            value={filters.courseName}
            onChange={handleFilterChange}
          />

          <input
            type="date"
            name="fromDate"
            value={filters.fromDate}
            onChange={handleFilterChange}
          />

          <input
            type="date"
            name="toDate"
            value={filters.toDate}
            onChange={handleFilterChange}
          />

          <select
            name="dateSort"
            value={filters.dateSort}
            onChange={handleFilterChange}
          >
            <option value="closest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>

          <button type="button" onClick={fetchPosts}>
            Filter
          </button>

          <button type="button" onClick={clearFilters}>
            Clear
          </button>
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

                          {/* הצגת תאריך יצירת הפוסט אם קיים */}
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