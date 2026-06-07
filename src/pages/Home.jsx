import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

function Home() {
  return (
    <div className="space-home-page">
      {/* חלונית צד שמאל עם פרטי הסטודנט */}
      <aside className="info-sidebar">
        {/* אזור עליון עם תמונת משתמש ושם */}
        <div className="user-top">
          <div className="avatar">👤</div>

          <div>
            <h2>Shira</h2>
            <p>Software Engineering</p>
          </div>
        </div>

        {/* כרטיס פרטים אישיים של הסטודנט */}
        <div className="student-info-box">
          <h3>ⓘ Student Info</h3>

          <div className="info-row">
            <span>👤</span>
            <div>
              <p>Username</p>
              <strong>SHIRA</strong>
            </div>
          </div>

          <div className="info-row">
            <span>✉️</span>
            <div>
              <p>Email</p>
              <strong>shira@example.com</strong>
            </div>
          </div>

          <div className="info-row">
            <span>🎓</span>
            <div>
              <p>Department</p>
              <strong>Software Engineering</strong>
            </div>
          </div>

          <div className="info-row">
            <span>📅</span>
            <div>
              <p>Year</p>
              <strong>1</strong>
            </div>
          </div>
        </div>

        {/* כפתור התנתקות בתחתית החלונית */}
        <button className="sidebar-logout-btn">
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
            <h2>Welcome Back, Shira 👋</h2>
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