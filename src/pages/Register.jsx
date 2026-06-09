import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import API_URL from "../services/api";

function Register() {
  // מאפשר מעבר לעמוד הבית אחרי הרשמה
  const navigate = useNavigate();

  // שומר את כל הנתונים שהמשתמש מקליד בטופס
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    department: "",
    studyYear: 1,
    password: "",
    confirmPassword: ""
  });

  // שומר הודעת שגיאה
  const [error, setError] = useState("");

  // מעדכן את השדה המתאים בכל הקלדה
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  // מופעל בלחיצה על Register
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // בדיקה שסיסמה ואימות סיסמה זהים
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // שליחת נתוני הרשמה לשרת
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          department: formData.department,
          studyYear: Number(formData.studyYear),
          password: formData.password
        })
      });

      const data = await response.json();

      // אם השרת החזיר שגיאה
      if (!response.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      // שמירת המשתמש שנרשם כמשתמש מחובר
      localStorage.setItem("currentUser", JSON.stringify(data));

      // מעבר לעמוד הבית
      navigate("/home");
    } catch (err) {
      console.error("Register error:", err);
      setError("Cannot connect to server");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <img src={logo} alt="UniSpace Logo" className="auth-logo" />

        <h2>Create Account</h2>
        <p className="auth-subtitle">Join UniSpace and start your journey</p>

        {/* הוספנו onSubmit */}
        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
          />

          <label>Username</label>
          <input
            type="text"
            name="username"
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleChange}
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />

          <label>Department</label>
          <input
            type="text"
            name="department"
            placeholder="Software Engineering"
            value={formData.department}
            onChange={handleChange}
          />

          <label>Year</label>
          <input
            type="number"
            name="studyYear"
            placeholder="1"
            min="1"
            max="6"
            value={formData.studyYear}
            onChange={handleChange}
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
          />

          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          {/* הודעת שגיאה אם יש */}
          {error && <p className="error-message">{error}</p>}

          <button type="submit">Register</button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;