import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function Home() {
  // מאפשר מעבר לעמוד login אחרי logout
  const navigate = useNavigate();

  // שליפת המשתמש המחובר מה-localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // אם אין משתמש מחובר, מחזירים להתחברות
  if (!currentUser) {
    navigate("/login");
    return null;
  }

  // התנתקות מהמערכת
  const handleLogout = () => {
    // מוחקים את המשתמש המחובר
    localStorage.removeItem("currentUser");

    /*
      מנקים את כל הנתונים הזמניים ששמרנו בדפדפן.
      זה חשוב כדי שמשתמש אחר לא יראה בטעות נתונים של משתמש קודם.
    */
    sessionStorage.clear();

    navigate("/login");
  };

  return (
    <div className="space-home-page">
      {/* חלונית צד שמאל עם פרטי הסטודנט */}
      <aside className="info-sidebar">
        <div className="user-top">
          <div className="avatar">👤</div>

          <div>
            <h2>{currentUser.fullName}</h2>
            <p>{currentUser.department}</p>
          </div>
        </div>

        <div className="student-info-box">
          <h3>ⓘ Student Info</h3>

          <div className="info-row">
            <span>👤</span>
            <div>
              <p>Username</p>
              <strong>{currentUser.username}</strong>
            </div>
          </div>

          <div className="info-row">
            <span>✉️</span>
            <div>
              <p>Email</p>
              <strong>{currentUser.email}</strong>
            </div>
          </div>

          <div className="info-row">
            <span>🎓</span>
            <div>
              <p>Department</p>
              <strong>{currentUser.department}</strong>
            </div>
          </div>

          <div className="info-row">
            <span>📅</span>
            <div>
              <p>Year</p>
              <strong>{currentUser.studyYear}</strong>
            </div>
          </div>

          <div className="info-row">
            <span>🔐</span>
            <div>
              <p>Role</p>
              <strong>{currentUser.role || "student"}</strong>
            </div>
          </div>
        </div>

        <Link to="/profile" className="sidebar-profile-btn">
          Edit Profile
        </Link>

        {currentUser.role === "admin" && (
          <Link to="/admin" className="sidebar-profile-btn">
            Admin Panel
          </Link>
        )}

        <button className="sidebar-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="home-main">
        <div className="top-section">
          <div className="brand-header">
            <h1 className="project-title">UniSpace</h1>

            <img
              src={logo}
              alt="UniSpace Logo"
              className="brand-logo"
            />
          </div>

          <p className="project-slogan">
            Study • Connect • Achieve
          </p>

          <section className="welcome-section">
            <h2>Welcome Back, {currentUser.fullName} 👋</h2>
            <p>What would you like to do today?</p>
          </section>
        </div>

        <section className="home-actions">
          <Link to="/questions" className="space-card questions-card">
            <div className="card-circle">🚀</div>
            <h2>Questions</h2>
            <p>Ask and answer study questions</p>
            <button>Go to Questions →</button>
          </Link>

          <Link to="/tasks" className="space-card tasks-card">
            <div className="card-circle">📋</div>
            <h2>Tasks</h2>
            <p>Manage and track your study tasks</p>
            <button>Go to Tasks →</button>
          </Link>

          <Link to="/albums" className="space-card tasks-card">
            <div className="card-circle">🖼️</div>
            <h2>Albums</h2>
            <p>Manage albums and study photos</p>
            <button>Go to Albums →</button>
          </Link>

          {currentUser.role === "admin" && (
            <Link to="/admin" className="space-card questions-card">
              <div className="card-circle">🛡️</div>
              <h2>Admin</h2>
              <p>Manage users, permissions and blocking</p>
              <button>Go to Admin →</button>
            </Link>
          )}
        </section>
      </main>
    </div>
  );
}

export default Home;