import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../services/api";

function Admin() {
  const navigate = useNavigate();

  // המשתמש המחובר מתוך localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // רשימת משתמשים
  const [users, setUsers] = useState([]);

  // סינונים למנהל
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    isBlocked: "",
    role: ""
  });

  // הודעות מצב
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // מפתח ייחודי לשמירת המשתמשים לפי admin והסינונים הנוכחיים
  const getUsersStorageKey = () =>
    `admin_users_${currentUser?._id}_${filters.search}_${filters.department}_${filters.isBlocked}_${filters.role}`;

  // שמירת רשימת המשתמשים ב-sessionStorage כדי למנוע GET מיותר בחזרה למסך
  const saveUsersToCache = (updatedUsers) => {
    sessionStorage.setItem(getUsersStorageKey(), JSON.stringify(updatedUsers));
  };

  // בדיקה שהמשתמש מחובר והוא מנהל
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (currentUser.role !== "admin") {
      navigate("/home");
      return;
    }

    const savedUsers = sessionStorage.getItem(getUsersStorageKey());

    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
      return;
    }

    fetchUsers();
  }, []);

  // שליפת משתמשים מהשרת לפי סינונים
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      /*
        משתמשים ב-URLSearchParams כדי לשלוח פרמטרים ב-URL בצורה תקינה.
        הסינון מתבצע בצד השרת מול MongoDB ולא בצד React.
      */
      const params = new URLSearchParams();

      params.append("adminId", currentUser._id);

      if (filters.search.trim()) {
        params.append("search", filters.search);
      }

      if (filters.department.trim()) {
        params.append("department", filters.department);
      }

      if (filters.isBlocked) {
        params.append("isBlocked", filters.isBlocked);
      }

      if (filters.role) {
        params.append("role", filters.role);
      }

      const response = await fetch(`${API_URL}/admin/users?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load users");
        return;
      }

      setUsers(data);
      saveUsersToCache(data);
    } catch (err) {
      console.error("Fetch users error:", err);
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  // עדכון שדות הסינון
  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters({
      ...filters,
      [name]: value
    });
  };

  // הפעלת סינון
  const handleFilterSubmit = (event) => {
    event.preventDefault();
    fetchUsers();
  };

  // ניקוי סינונים
  const clearFilters = () => {
    setFilters({
      search: "",
      department: "",
      isBlocked: "",
      role: ""
    });
  };

  // חסימה / שחרור משתמש
  const toggleBlockUser = async (user) => {
    try {
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/admin/users/${user._id}/block`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          adminId: currentUser._id,
          isBlocked: !user.isBlocked
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update user status");
        return;
      }

      /*
        צמצום קריאות לשרת:
        לא עושים GET מחדש לכל המשתמשים.
        מעדכנים רק את המשתמש שהשתנה בתוך ה-state.
      */
      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.map((item) => {
          if (item._id === data._id) {
            return data;
          }

          return item;
        });

        saveUsersToCache(updatedUsers);
        return updatedUsers;
      });

      setMessage(data.isBlocked ? "User blocked successfully" : "User unblocked successfully");
    } catch (err) {
      console.error("Block user error:", err);
      setError("Cannot connect to server");
    }
  };

  // שינוי role של משתמש
  const changeUserRole = async (user, newRole) => {
    try {
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/admin/users/${user._id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          adminId: currentUser._id,
          role: newRole
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update user role");
        return;
      }

      /*
        צמצום קריאות לשרת:
        לא שולפים שוב את כל המשתמשים.
        מחליפים רק את המשתמש שהתפקיד שלו השתנה.
      */
      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.map((item) => {
          if (item._id === data._id) {
            return data;
          }

          return item;
        });

        saveUsersToCache(updatedUsers);
        return updatedUsers;
      });

      setMessage("User role updated successfully");
    } catch (err) {
      console.error("Change role error:", err);
      setError("Cannot connect to server");
    }
  };

  if (!currentUser || currentUser.role !== "admin") {
    return null;
  }

  return (
    <div className="questions-page">
      <div className="questions-container">
        <div className="questions-top">
          <div>
            <h1>Admin Panel</h1>
            <p>Manage users, search, filter, block and change roles</p>
          </div>

          <Link to="/home" className="back-home-link">
            Back Home
          </Link>
        </div>

        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        {/* טופס סינון למנהל */}
        <form className="question-form" onSubmit={handleFilterSubmit}>
          <input
            type="text"
            name="search"
            placeholder="Search by name, username or email"
            value={filters.search}
            onChange={handleFilterChange}
          />

          <input
            type="text"
            name="department"
            placeholder="Department"
            value={filters.department}
            onChange={handleFilterChange}
          />

          <select
            name="isBlocked"
            value={filters.isBlocked}
            onChange={handleFilterChange}
          >
            <option value="">All statuses</option>
            <option value="false">Active</option>
            <option value="true">Blocked</option>
          </select>

          <select
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
          >
            <option value="">All roles</option>
            <option value="student">Students</option>
            <option value="admin">Admins</option>
          </select>

          <button type="submit">Filter Users</button>

          <button type="button" onClick={clearFilters}>
            Clear
          </button>
        </form>

        {loading ? (
          <p className="empty-message">Loading users...</p>
        ) : (
          <div className="questions-list">
            {users.length === 0 ? (
              <p className="empty-message">No users found</p>
            ) : (
              users.map((user) => (
                <div className="question-item" key={user._id}>
                  <div className="question-content">
                    <h3>{user.fullName}</h3>

                    <p>Username: {user.username}</p>
                    <p>Email: {user.email}</p>
                    <p>Department: {user.department}</p>
                    <p>Year: {user.studyYear}</p>
                    <p>Role: {user.role}</p>
                    <p>Status: {user.isBlocked ? "Blocked" : "Active"}</p>
                  </div>

                  <div className="question-actions">
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => toggleBlockUser(user)}
                      disabled={user._id === currentUser._id}
                    >
                      {user.isBlocked ? "Unblock" : "Block"}
                    </button>

                    {user.role === "student" ? (
                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() => changeUserRole(user, "admin")}
                        disabled={user._id === currentUser._id}
                      >
                        Make Admin
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="delete-task-btn"
                        onClick={() => changeUserRole(user, "student")}
                        disabled={user._id === currentUser._id}
                      >
                        Make Student
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;