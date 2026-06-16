import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../services/api";

function Tasks() {
  // המשתמש המחובר מתוך localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // שליפה בטוחה של ה-id של המשתמש
  const userId =
    currentUser?.user?._id ||
    currentUser?.user?.id ||
    currentUser?._id ||
    currentUser?.id;

  // רשימת המשימות
  const [tasks, setTasks] = useState([]);

  // נתוני משימה חדשה
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: ""
  });

  // המשימה שנמצאת כרגע בעריכה
  const [editingTaskId, setEditingTaskId] = useState(null);

  // נתוני המשימה בזמן עריכה
  const [editTaskData, setEditTaskData] = useState({
    title: "",
    description: "",
    dueDate: ""
  });

  // הודעות מצב
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // סינון לפי תאריכים
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: ""
  });

  // סינון לפי מצב ביצוע
  const [completedFilter, setCompletedFilter] = useState("all");

  /*
    מפתח לשמירת משימות ב-sessionStorage.

    שמים את userId בתוך המפתח כדי שכל משתמש יקבל cache נפרד.
    שמים גם את הסינונים כדי שכל תוצאת סינון תישמר בנפרד.
  */
  const getTasksStorageKey = () => {
    return `tasks_${userId}_${filters.fromDate}_${filters.toDate}_${completedFilter}`;
  };

  // שמירת משימות ב-sessionStorage
  const saveTasksToCache = (updatedTasks) => {
    sessionStorage.setItem(
      getTasksStorageKey(),
      JSON.stringify(updatedTasks)
    );
  };

  /*
    טעינת המשימות כשהעמוד נפתח.

    קודם בודקים אם כבר יש משימות שמורות ב-sessionStorage.
    אם כן — מציגים אותן בלי קריאת GET נוספת לשרת.
    אם לא — קוראים לשרת פעם אחת ושומרים את התוצאה.
  */
  useEffect(() => {
    if (!userId) {
      setError("User was not found. Please login again.");
      return;
    }

    const savedTasks = sessionStorage.getItem(getTasksStorageKey());

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
      return;
    }

    fetchTasks();
  }, []);

  // מיון משימות לפי id כדי שתהיה תצוגה קבועה
  const sortTasksById = (tasksToSort) => {
    return [...tasksToSort].sort((a, b) => {
      const firstId = a.id || a._id;
      const secondId = b.id || b._id;

      return String(firstId).localeCompare(String(secondId));
    });
  };

  // הבאת המשימות של המשתמש מהשרת
  const fetchTasks = async () => {
    if (!userId) {
      setError("User was not found. Please login again.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      let url = `${API_URL}/todos?userId=${userId}`;

      // סינון לפי תאריך התחלה
      if (filters.fromDate) {
        url += `&fromDate=${filters.fromDate}`;
      }

      // סינון לפי תאריך סיום
      if (filters.toDate) {
        url += `&toDate=${filters.toDate}`;
      }

      // סינון לפי משימות שבוצעו
      if (completedFilter === "completed") {
        url += "&completed=true";
      }

      // סינון לפי משימות שלא בוצעו
      if (completedFilter === "notCompleted") {
        url += "&completed=false";
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load tasks");
        return;
      }

      // מיון המשימות
      const sortedTasks = sortTasksById(data);

      /*
        שומרים גם ב-state וגם ב-sessionStorage.
        כך אם חוזרים לעמוד Tasks או עושים Refresh,
        לא חייבים לקרוא שוב לשרת.
      */
      setTasks(sortedTasks);
      saveTasksToCache(sortedTasks);
    } catch (err) {
      console.error("Fetch tasks error:", err);
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  // עדכון שדות משימה חדשה
  const handleTaskChange = (event) => {
    const { name, value } = event.target;

    setNewTask({
      ...newTask,
      [name]: value
    });
  };

  // עדכון שדות הסינון לפי תאריכים
  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters({
      ...filters,
      [name]: value
    });
  };

  /*
    הפעלת סינון.

    כאן כן עושים קריאה לשרת כי המשתמש ביקש תוצאה מסוננת.
    אבל אחרי שהנתונים חוזרים, הם נשמרים ב-sessionStorage.
  */
  const applyFilters = () => {
    fetchTasks();
  };

  // ניקוי סינונים בלי קריאה אוטומטית לשרת
  const clearFilters = () => {
    setFilters({
      fromDate: "",
      toDate: ""
    });

    setCompletedFilter("all");
  };

  // הוספת משימה חדשה
  const addTask = async (event) => {
    event.preventDefault();

    // כותרת חובה
    if (!newTask.title.trim()) {
      setError("Task title is required");
      return;
    }

    // תאריך יעד חובה
    if (!newTask.dueDate) {
      setError("Due date is required");
      return;
    }

    try {
      setError("");

      /*
        קריאה אחת בלבד לשרת לצורך יצירת משימה.
        אחרי שהשרת מחזיר את המשימה החדשה,
        לא עושים GET נוסף.
      */
      const response = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId,
          title: newTask.title,
          description: newTask.description,
          dueDate: newTask.dueDate,
          completed: false
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to add task");
        return;
      }

      // ניקוי הטופס
      setNewTask({
        title: "",
        description: "",
        dueDate: ""
      });

      /*
        צמצום קריאות לשרת:
        לא עושים fetchTasks אחרי הוספה.
        מוסיפים את המשימה החדשה ישירות ל-state ול-sessionStorage.
      */
      setTasks((prevTasks) => {
        const updatedTasks = sortTasksById([...prevTasks, data]);

        saveTasksToCache(updatedTasks);

        return updatedTasks;
      });
    } catch (err) {
      console.error("Add task error:", err);
      setError("Cannot connect to server");
    }
  };

  // סימון משימה כבוצעה / לא בוצעה
  const toggleCompleted = async (task) => {
    const taskId = task._id || task.id;

    try {
      setError("");

      /*
        קריאה אחת בלבד לשרת לצורך עדכון completed.
        לא עושים GET נוסף אחרי העדכון.
      */
      const response = await fetch(`${API_URL}/todos/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId,
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          completed: !task.completed
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update task");
        return;
      }

      /*
        צמצום קריאות לשרת:
        מעדכנים את המשימה ברשימה וב-sessionStorage בלי GET נוסף.
      */
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((item) =>
          (item._id || item.id) === taskId ? data : item
        );

        saveTasksToCache(updatedTasks);

        return updatedTasks;
      });
    } catch (err) {
      console.error("Update task error:", err);
      setError("Cannot connect to server");
    }
  };

  // התחלת עריכה של משימה
  const startEditTask = (task) => {
    const taskId = task._id || task.id;

    setEditingTaskId(taskId);

    setEditTaskData({
      title: task.title,
      description: task.description || "",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : ""
    });
  };

  // ביטול עריכה
  const cancelEditTask = () => {
    setEditingTaskId(null);

    setEditTaskData({
      title: "",
      description: "",
      dueDate: ""
    });
  };

  // עדכון שדות בזמן עריכה
  const handleEditTaskChange = (event) => {
    const { name, value } = event.target;

    setEditTaskData({
      ...editTaskData,
      [name]: value
    });
  };

  // שמירת עריכת משימה
  const saveEditTask = async (task) => {
    const taskId = task._id || task.id;

    // כותרת חובה
    if (!editTaskData.title.trim()) {
      setError("Task title is required");
      return;
    }

    // תאריך יעד חובה
    if (!editTaskData.dueDate) {
      setError("Due date is required");
      return;
    }

    try {
      setError("");

      /*
        קריאה אחת בלבד לשרת לצורך עריכת משימה.
        אחרי העדכון לא עושים GET נוסף.
      */
      const response = await fetch(`${API_URL}/todos/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId,
          title: editTaskData.title,
          description: editTaskData.description,
          dueDate: editTaskData.dueDate,
          completed: task.completed
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update task");
        return;
      }

      /*
        צמצום קריאות לשרת:
        מעדכנים את המשימה הערוכה ב-state וב-sessionStorage.
      */
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((item) =>
          (item._id || item.id) === taskId ? data : item
        );

        saveTasksToCache(updatedTasks);

        return updatedTasks;
      });

      cancelEditTask();
    } catch (err) {
      console.error("Edit task error:", err);
      setError("Cannot connect to server");
    }
  };

  // מחיקת משימה
  const deleteTask = async (taskId) => {
    try {
      setError("");

      /*
        קריאה אחת בלבד לשרת לצורך מחיקה.
        אחרי המחיקה לא עושים GET נוסף.
      */
      const response = await fetch(`${API_URL}/todos/${taskId}?userId=${userId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to delete task");
        return;
      }

      /*
        צמצום קריאות לשרת:
        מסירים את המשימה מה-state ומה-sessionStorage בלי GET נוסף.
      */
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.filter(
          (item) => (item._id || item.id) !== taskId
        );

        saveTasksToCache(updatedTasks);

        return updatedTasks;
      });
    } catch (err) {
      console.error("Delete task error:", err);
      setError("Cannot connect to server");
    }
  };

  return (
    <div className="tasks-page">
      <div className="tasks-container">
        <div className="tasks-top">
          <div>
            <h1>My Tasks</h1>
            <p>Manage your study tasks and deadlines</p>
          </div>

          <Link to="/home" className="back-home-link">
            Back Home
          </Link>
        </div>

        {error && <p className="error-message">{error}</p>}

        {/* טופס הוספת משימה */}
        <form className="task-form" onSubmit={addTask}>
          <input
            type="text"
            name="title"
            placeholder="Task title"
            value={newTask.title}
            onChange={handleTaskChange}
          />

          <input
            type="text"
            name="description"
            placeholder="Description"
            value={newTask.description}
            onChange={handleTaskChange}
          />

          <input
            type="date"
            name="dueDate"
            value={newTask.dueDate}
            onChange={handleTaskChange}
          />

          <button type="submit" className="filter-btn">Add Task</button>
        </form>

        {/* סינון משימות */}
        <div className="task-filters filters-box">
          <div className="filter-field">
            <label>From Date</label>
            <input
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-field">
            <label>To Date</label>
            <input
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-field">
            <label>Status</label>
            <select
              value={completedFilter}
              onChange={(event) => setCompletedFilter(event.target.value)}
            >
              <option value="all">All Tasks</option>
              <option value="completed">Completed</option>
              <option value="notCompleted">Not Completed</option>
            </select>
          </div>

          <div className="filter-buttons">
            <button type="button" className="filter-btn" onClick={applyFilters}>
              Filter
            </button>

            <button type="button" className="clear-filter-btn" onClick={clearFilters}>
              Clear
            </button>
          </div>
        </div>
        {loading ? (
          <p className="tasks-loading">Loading tasks...</p>
        ) : (
          <div className="tasks-list">
            {tasks.length === 0 ? (
              <p className="empty-message">No tasks yet</p>
            ) : (
              tasks.map((task, index) => {
                const taskId = task._id || task.id;

                return (
                  <div className="task-item" key={taskId}>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleCompleted(task)}
                    />

                    <span className="task-number">
                      Task #{index + 1}
                    </span>

                    <div className="task-content">
                      {editingTaskId === taskId ? (
                        <div className="edit-task-box">
                          <input
                            type="text"
                            name="title"
                            value={editTaskData.title}
                            onChange={handleEditTaskChange}
                          />

                          <input
                            type="text"
                            name="description"
                            value={editTaskData.description}
                            onChange={handleEditTaskChange}
                          />

                          <input
                            type="date"
                            name="dueDate"
                            value={editTaskData.dueDate}
                            onChange={handleEditTaskChange}
                          />

                          <div className="edit-buttons">
                            <button
                              type="button"
                              onClick={() => saveEditTask(task)}
                            >
                              Save
                            </button>

                            <button
                              type="button"
                              onClick={cancelEditTask}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className={task.completed ? "done-task" : ""}>
                            {task.title}
                          </h3>

                          {task.description && <p>{task.description}</p>}

                          {task.dueDate && (
                            <span>
                              Due date: {task.dueDate.slice(0, 10)}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <div className="task-actions">
                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() => startEditTask(task)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-task-btn"
                        onClick={() => deleteTask(taskId)}
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

export default Tasks;