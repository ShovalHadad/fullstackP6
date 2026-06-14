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
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <div className="space-home-page">
      {/* חלונית צד שמאל עם פרטי הסטודנט */}
      <aside className="info-sidebar">
        {/* אזור עליון עם תמונת משתמש ושם */}
        <div className="user-top">
          <div className="avatar">👤</div>

          <div>
            {/* במקום שם קבוע, מציגים את שם המשתמש המחובר */}
            <h2>{currentUser.fullName}</h2>
            <p>{currentUser.department}</p>
          </div>
        </div>

        {/* כרטיס פרטים אישיים של הסטודנט */}
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
        </div>

        {/* מעבר לעמוד שינוי פרטים */}
        <Link to="/profile" className="sidebar-profile-btn">
        Edit Profile
        </Link>

        {/* כפתור התנתקות בתחתית החלונית */}
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      {/* האזור המרכזי של עמוד הבית */}
      <main className="home-main">
        {/* אזור עליון של המותג */}
        <div className="top-section">
          <div className="brand-header">
            {/* שם המערכת במרכז */}
            <h1 className="project-title">
              UniSpace
            </h1>

            {/* לוגו בצד ימין של אותה שורה */}
            <img
              src={logo}
              alt="UniSpace Logo"
              className="brand-logo"
            />
          </div>

          {/* סלוגן של המערכת */}
          <p className="project-slogan">
            Study • Connect • Achieve
          </p>

          {/* הודעת ברוכים הבאים */}
          <section className="welcome-section">
            <h2>Welcome Back, {currentUser.fullName} 👋</h2>
            <p>What would you like to do today?</p>
          </section>
        </div>

        {/* כרטיסי ניווט ראשיים */}
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
        </section>
      </main>
    </div>
  );
}

export default Home;