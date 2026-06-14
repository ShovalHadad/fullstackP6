import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../services/api";

function Albums() {
  // המשתמש המחובר מתוך localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // שליפת id של המשתמש המחובר
  const userId =
    currentUser?.user?._id ||
    currentUser?.user?.id ||
    currentUser?._id ||
    currentUser?.id;

  // רשימת אלבומים
  const [albums, setAlbums] = useState([]);

  // נתוני אלבום חדש
  const [newAlbum, setNewAlbum] = useState({
    title: "",
    description: ""
  });

  // הודעות מצב
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // טעינת אלבומים כאשר העמוד נפתח
  useEffect(() => {
    fetchAlbums();
  }, []);

  // שליפת אלבומים של המשתמש מהשרת
  const fetchAlbums = async () => {
    try {
      setLoading(true);
      setError("");

      /*
        הסינון לפי userId מתבצע בשרת מול MongoDB.
        לא מביאים את כל האלבומים ואז מסננים ב-React.
      */
      const response = await fetch(`${API_URL}/albums?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load albums");
        return;
      }

      setAlbums(data);
    } catch (err) {
      console.error("Fetch albums error:", err);
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  // עדכון שדות טופס אלבום חדש
  const handleChange = (event) => {
    const { name, value } = event.target;

    setNewAlbum({
      ...newAlbum,
      [name]: value
    });
  };

  // יצירת אלבום חדש
  const addAlbum = async (event) => {
    event.preventDefault();

    if (!newAlbum.title.trim()) {
      setError("Album title is required");
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_URL}/albums`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId,
          title: newAlbum.title,
          description: newAlbum.description
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to add album");
        return;
      }

      setNewAlbum({
        title: "",
        description: ""
      });

      /*
        צמצום קריאות לשרת:
        אחרי יצירת אלבום לא עושים GET נוסף.
        מוסיפים את האלבום החדש ישירות ל-state.
      */
      setAlbums([data, ...albums]);
    } catch (err) {
      console.error("Add album error:", err);
      setError("Cannot connect to server");
    }
  };

  // מחיקת אלבום
  const deleteAlbum = async (albumId) => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/albums/${albumId}?userId=${userId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to delete album");
        return;
      }

      /*
        צמצום קריאות לשרת:
        לא מביאים שוב את כל האלבומים.
        מסירים מה-state רק את האלבום שנמחק.
      */
      setAlbums(
        albums.filter((album) => {
          const currentId = album._id || album.id;
          return currentId !== albumId;
        })
      );
    } catch (err) {
      console.error("Delete album error:", err);
      setError("Cannot connect to server");
    }
  };

  return (
    <div className="questions-page">
      <div className="questions-container">
        <div className="questions-top">
          <div>
            <h1>Albums</h1>
            <p>Create albums and manage study photos</p>
          </div>

          <Link to="/home" className="back-home-link">
            Back Home
          </Link>
        </div>

        {error && <p className="error-message">{error}</p>}

        {/* טופס יצירת אלבום */}
        <form className="question-form" onSubmit={addAlbum}>
          <input
            type="text"
            name="title"
            placeholder="Album title"
            value={newAlbum.title}
            onChange={handleChange}
          />

          <input
            type="text"
            name="description"
            placeholder="Album description"
            value={newAlbum.description}
            onChange={handleChange}
          />

          <button type="submit">Add Album</button>
        </form>

        {loading ? (
          <p className="empty-message">Loading albums...</p>
        ) : (
          <div className="questions-list">
            {albums.length === 0 ? (
              <p className="empty-message">No albums yet</p>
            ) : (
              albums.map((album, index) => {
                const albumId = album._id || album.id;

                return (
                  <div className="question-item" key={albumId}>
                    <div className="question-content">
                      <span className="task-number">Album #{index + 1}</span>
                      <h3>{album.title}</h3>

                      {album.description && (
                        <p>{album.description}</p>
                      )}

                      {album.createdAt && (
                        <p className="question-date">
                          Created: {new Date(album.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="question-actions">
                      <Link to={`/albums/${albumId}/photos`} className="open-question-btn">
                        Open Photos
                      </Link>

                      <button
                        type="button"
                        className="delete-task-btn"
                        onClick={() => deleteAlbum(albumId)}
                      >
                        Delete
                      </button>
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

export default Albums;