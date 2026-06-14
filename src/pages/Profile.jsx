import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../services/api";

function Profile() {
  // מאפשר מעבר בין דפים
  const navigate = useNavigate();

  // המשתמש המחובר מתוך localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // אם אין משתמש מחובר מחזירים ל-login
  if (!currentUser) {
    navigate("/login");
    return null;
  }

  // id של המשתמש המחובר
  const userId = currentUser._id || currentUser.id;

  // נתוני שינוי פרטים
  const [profileData, setProfileData] = useState({
    fullName: currentUser.fullName || "",
    email: currentUser.email || "",
    department: currentUser.department || "",
    studyYear: currentUser.studyYear || 1
  });

  // נתוני שינוי סיסמה
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // הודעות למסך
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // עדכון שדות פרופיל
  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  // עדכון שדות סיסמה
  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  // שמירת שינוי פרטים
  const updateProfile = async (event) => {
    event.preventDefault();

    // בדיקה בסיסית
    if (!profileData.fullName.trim() || !profileData.email.trim()) {
      setError("Full name and email are required");
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update profile");
        return;
      }

      // שמירת המשתמש המעודכן ב-localStorage
      localStorage.setItem("currentUser", JSON.stringify(data));

      setMessage("Profile updated successfully");
    } catch (err) {
      console.error("Update profile error:", err);
      setError("Cannot connect to server");
    }
  };

  // שינוי סיסמה
  const changePassword = async (event) => {
    event.preventDefault();

    // בדיקה שהשדות מלאים
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setError("Current password and new password are required");
      return;
    }

    // בדיקה שהסיסמאות החדשות זהות
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/users/${userId}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to change password");
        return;
      }

      // ניקוי שדות הסיסמה
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      setMessage("Password changed successfully");
    } catch (err) {
      console.error("Change password error:", err);
      setError("Cannot connect to server");
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-top">
          <div>
            <h1>My Profile</h1>
            <p>Update your personal details and password</p>
          </div>

          <Link to="/home" className="back-home-link">
            Back Home
          </Link>
        </div>

        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        <div className="profile-sections">
          {/* טופס שינוי פרטים */}
          <form className="profile-card" onSubmit={updateProfile}>
            <h2>Edit Details</h2>

            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={profileData.fullName}
              onChange={handleProfileChange}
            />

            <label>Email</label>
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleProfileChange}
            />

            <label>Department</label>
            <input
              type="text"
              name="department"
              value={profileData.department}
              onChange={handleProfileChange}
            />

            <label>Study Year</label>
            <input
              type="number"
              name="studyYear"
              min="1"
              max="6"
              value={profileData.studyYear}
              onChange={handleProfileChange}
            />

            <button type="submit">Save Details</button>
          </form>

          {/* טופס שינוי סיסמה */}
          <form className="profile-card" onSubmit={changePassword}>
            <h2>Change Password</h2>

            <label>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
            />

            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
            />

            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
            />

            <button type="submit">Change Password</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;