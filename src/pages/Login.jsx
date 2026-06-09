import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import API_URL from "../services/api";

function Login() {
  // מאפשר מעבר לעמוד אחר אחרי התחברות
  const navigate = useNavigate();

  // שומר את מה שהמשתמש מקליד בטופס
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  // הודעת שגיאה במקרה שההתחברות נכשלה
  const [error, setError] = useState("");

  // מתעדכן בכל הקלדה בשדות
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  // מופעל בלחיצה על כפתור Login
  const handleSubmit = async (event) => {
    // מונע רענון של הדף
    event.preventDefault();

    // מנקה שגיאה קודמת
    setError("");

    try {
      // שליחת username ו-password לשרת
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      // אם השרת החזיר שגיאה
      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // שמירת המשתמש המחובר ב-localStorage
      localStorage.setItem("currentUser", JSON.stringify(data));

      // מעבר לעמוד הבית
      navigate("/home");
    } catch (err) {
      console.error("Login error:", err);
      setError("Cannot connect to server");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src={logo} alt="UniSpace Logo" className="auth-logo" />

        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Login to continue your journey</p>

        {/* הוספנו onSubmit לטופס */}
        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            type="text"
            name="username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleChange}
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />

          {/* הצגת שגיאה אם יש */}
          {error && <p className="error-message">{error}</p>}

          <button type="submit">Login</button>
        </form>

        <p className="auth-link">
          New to UniSpace? <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;