import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API_URL from "../services/api";

function Photos() {
  // מקבלים מה-URL את ה-id של האלבום
  const { albumId } = useParams();

  /*
    מפתח ייחודי לשמירת התמונות של האלבום בדפדפן.
    ככה אם חוזרים שוב למסך התמונות של אותו אלבום אין GET נוסף.
  */
  const photosStorageKey = `photos_${albumId}`;

  // המשתמש המחובר מתוך localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // שליפת id של המשתמש המחובר
  const userId =
    currentUser?.user?._id ||
    currentUser?.user?.id ||
    currentUser?._id ||
    currentUser?.id;

  // רשימת התמונות באלבום
  const [photos, setPhotos] = useState([]);

  // נתוני תמונה חדשה
  const [newPhoto, setNewPhoto] = useState({
    title: "",
    url: ""
  });

  // הודעות מצב
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /*
    טעינת תמונות כאשר העמוד נפתח.

    קודם בודקים אם התמונות כבר שמורות ב-sessionStorage.
    אם כן — מציגים אותן בלי קריאה נוספת לשרת.
    אם לא — קוראים לשרת פעם אחת ושומרים את התוצאה.
  */
  useEffect(() => {
    const savedPhotos = sessionStorage.getItem(photosStorageKey);

    if (savedPhotos) {
      setPhotos(JSON.parse(savedPhotos));
      return;
    }

    fetchPhotos();
  }, [albumId]);

  // שליפת תמונות לפי אלבום
  const fetchPhotos = async () => {
    try {
      setLoading(true);
      setError("");

      /*
        הסינון לפי albumId מתבצע בשרת מול MongoDB.
        לא מביאים את כל התמונות ואז מסננים ב-React.
      */
      const response = await fetch(`${API_URL}/photos?albumId=${albumId}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load photos");
        return;
      }

      // שומרים גם ב-state וגם ב-sessionStorage כדי למנוע קריאה חוזרת מיותרת
      setPhotos(data);
      sessionStorage.setItem(photosStorageKey, JSON.stringify(data));
    } catch (err) {
      console.error("Fetch photos error:", err);
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  // עדכון שדות תמונה חדשה
  const handleChange = (event) => {
    const { name, value } = event.target;

    setNewPhoto({
      ...newPhoto,
      [name]: value
    });
  };

  // יצירת תמונה חדשה לפי URL
  const addPhoto = async (event) => {
    event.preventDefault();

    if (!newPhoto.title.trim()) {
      setError("Photo title is required");
      return;
    }

    if (!newPhoto.url.trim()) {
      setError("Photo URL is required");
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_URL}/photos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          albumId,
          userId,
          title: newPhoto.title,
          url: newPhoto.url
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to add photo");
        return;
      }

      setNewPhoto({
        title: "",
        url: ""
      });

      /*
        צמצום קריאות לשרת:
        אחרי יצירת תמונה לא עושים GET נוסף.
        מוסיפים את התמונה החדשה ישירות ל-state ול-sessionStorage.
      */
      setPhotos((prevPhotos) => {
        const updatedPhotos = [data, ...prevPhotos];

        sessionStorage.setItem(
          photosStorageKey,
          JSON.stringify(updatedPhotos)
        );

        return updatedPhotos;
      });
    } catch (err) {
      console.error("Add photo error:", err);
      setError("Cannot connect to server");
    }
  };

  // מחיקת תמונה
  const deletePhoto = async (photoId) => {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/photos/${photoId}?userId=${userId}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to delete photo");
        return;
      }

      /*
        צמצום קריאות לשרת:
        לא שולפים שוב את כל התמונות.
        מסירים מה-state ומה-sessionStorage רק את התמונה שנמחקה.
      */
      setPhotos((prevPhotos) => {
        const updatedPhotos = prevPhotos.filter((photo) => {
          const currentId = photo._id || photo.id;
          return currentId !== photoId;
        });

        sessionStorage.setItem(
          photosStorageKey,
          JSON.stringify(updatedPhotos)
        );

        return updatedPhotos;
      });
    } catch (err) {
      console.error("Delete photo error:", err);
      setError("Cannot connect to server");
    }
  };

  return (
    <div className="questions-page">
      <div className="questions-container">
        <div className="questions-top">
          <div>
            <h1>Photos</h1>
            <p>Add photos by URL to this album</p>
          </div>

          <Link to="/albums" className="back-home-link">
            Back to Albums
          </Link>
        </div>

        {error && <p className="error-message">{error}</p>}

        {/* טופס הוספת תמונה */}
        <form className="question-form" onSubmit={addPhoto}>
          <input
            type="text"
            name="title"
            placeholder="Photo title"
            value={newPhoto.title}
            onChange={handleChange}
          />

          <input
            type="text"
            name="url"
            placeholder="Photo URL"
            value={newPhoto.url}
            onChange={handleChange}
          />

          <button type="submit">Add Photo</button>
        </form>

        {loading ? (
          <p className="empty-message">Loading photos...</p>
        ) : (
          <div className="questions-list">
            {photos.length === 0 ? (
              <p className="empty-message">No photos yet</p>
            ) : (
              photos.map((photo, index) => {
                const photoId = photo._id || photo.id;

                return (
                  <div className="question-item" key={photoId}>
                    <div className="question-content">
                      <span className="task-number">Photo #{index + 1}</span>
                      <h3>{photo.title}</h3>

                      <img
                        src={photo.url}
                        alt={photo.title}
                        style={{
                          width: "220px",
                          maxWidth: "100%",
                          borderRadius: "12px",
                          marginTop: "10px"
                        }}
                      />

                      <p>{photo.url}</p>

                      {photo.createdAt && (
                        <p className="question-date">
                          Created: {new Date(photo.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="question-actions">
                      <button
                        type="button"
                        className="delete-task-btn"
                        onClick={() => deletePhoto(photoId)}
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

export default Photos;