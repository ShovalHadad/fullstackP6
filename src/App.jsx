import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Tasks from "./pages/Tasks.jsx";
import Questions from "./pages/Questions.jsx";
import QuestionDetails from "./pages/QuestionDetails.jsx";
import Profile from "./pages/Profile.jsx";
import Admin from "./pages/Admin.jsx";
import Albums from "./pages/Albums.jsx";
import Photos from "./pages/Photos.jsx";

// רכיב קטן שבודק אם המשתמש מחובר
function ProtectedRoute({ children }) {
  // בודקים אם יש משתמש מחובר ב-localStorage
  const currentUser = localStorage.getItem("currentUser");

  // אם אין משתמש מחובר, מחזירים לעמוד התחברות
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // אם המשתמש מחובר, מציגים את העמוד
  return children;
}

function App() {
  return (
    // כאן נגדיר את כל הניווטים בין הדפים במערכת
    <BrowserRouter>
      <Routes>
        {/* דף ברירת מחדל - מעביר להתחברות */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* דפי כניסה והרשמה */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* דפי המערכת אחרי התחברות */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/questions"
          element={
            <ProtectedRoute>
              <Questions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/questions/:id"
          element={
            <ProtectedRoute>
              <QuestionDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/albums"
          element={
            <ProtectedRoute>
              <Albums />
            </ProtectedRoute>
          }
        />

        <Route
          path="/albums/:albumId/photos"
          element={
            <ProtectedRoute>
              <Photos />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;