const express = require("express");
const User = require("../models/User");

const router = express.Router();

/*
פונקציית עזר שבודקת אם המשתמש שמבצע את הפעולה הוא מנהל.

בפרויקט שלנו אין JWT / Token,
אז כדי לשמור על פשטות אנחנו מקבלים adminId מה-query או מה-body.
אם המשתמש לא קיים / לא admin / חסום — לא נאשר את הפעולה.
*/
const checkAdmin = async (adminId) => {
  if (!adminId) {
    return null;
  }

  const admin = await User.findById(adminId);

  if (!admin) {
    return null;
  }

  if (admin.role !== "admin") {
    return null;
  }

  if (admin.isBlocked) {
    return null;
  }

  return admin;
};

/*
GET /admin/users?adminId=...
GET /admin/users?adminId=...&search=shira
GET /admin/users?adminId=...&department=software engineering
GET /admin/users?adminId=...&isBlocked=true
GET /admin/users?adminId=...&role=student

מחזיר את כל המשתמשים למנהל.
תומך בשאילתות מתקדמות עם פרמטרים ב-URL:
1. חיפוש לפי שם / username / email
2. סינון לפי מחלקה
3. סינון לפי חסומים / פעילים
4. סינון לפי role
*/
router.get("/users", async (req, res) => {
  try {
    const {
      adminId,
      search,
      department,
      isBlocked,
      role
    } = req.query;

    // בדיקה שרק מנהל יכול לראות את רשימת המשתמשים
    const admin = await checkAdmin(adminId);

    if (!admin) {
      return res.status(403).json({
        message: "Admin access only"
      });
    }

    // אובייקט הסינון שיישלח ל-MongoDB
    const filter = {};

    // חיפוש לפי שם מלא / שם משתמש / מייל
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    // סינון לפי מחלקה
    // משתמשים באותה נורמליזציה כמו בהרשמה
    if (department) {
      filter.department = department.trim().toLowerCase();
    }

    // סינון לפי משתמשים חסומים / פעילים
    if (isBlocked === "true" || isBlocked === "false") {
      filter.isBlocked = isBlocked === "true";
    }

    // סינון לפי תפקיד
    if (role === "student" || role === "admin") {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select("-__v")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error("Admin get users error:", error.message);

    res.status(500).json({
      message: "Server error while getting users for admin"
    });
  }
});

/*
PUT /admin/users/:id/block

חסימה או שחרור של משתמש על ידי מנהל.

Body:
{
  "adminId": "...",
  "isBlocked": true
}
*/
router.put("/users/:id/block", async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, isBlocked } = req.body;

    // בדיקה שרק מנהל יכול לחסום / לשחרר משתמשים
    const admin = await checkAdmin(adminId);

    if (!admin) {
      return res.status(403).json({
        message: "Admin access only"
      });
    }

    // מנהל לא יכול לחסום את עצמו
    if (id === adminId) {
      return res.status(400).json({
        message: "Admin cannot block himself"
      });
    }

    // עדכון סטטוס החסימה של המשתמש
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isBlocked: isBlocked },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // מחזירים את המשתמש המעודכן בלי סיסמה
    res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      username: updatedUser.username,
      email: updatedUser.email,
      department: updatedUser.department,
      studyYear: updatedUser.studyYear,
      role: updatedUser.role,
      isBlocked: updatedUser.isBlocked
    });
  } catch (error) {
    console.error("Admin block user error:", error.message);

    res.status(500).json({
      message: "Server error while blocking user"
    });
  }
});

/*
PUT /admin/users/:id/role

שינוי תפקיד של משתמש על ידי מנהל.

Body:
{
  "adminId": "...",
  "role": "admin"
}

או:

{
  "adminId": "...",
  "role": "student"
}
*/
router.put("/users/:id/role", async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, role } = req.body;

    // בדיקה שרק מנהל יכול לשנות תפקידים
    const admin = await checkAdmin(adminId);

    if (!admin) {
      return res.status(403).json({
        message: "Admin access only"
      });
    }

    // בדיקה שהתפקיד שנשלח תקין
    if (role !== "student" && role !== "admin") {
      return res.status(400).json({
        message: "Invalid role"
      });
    }

    // מנהל לא יכול להוריד לעצמו הרשאות בטעות
    if (id === adminId) {
      return res.status(400).json({
        message: "Admin cannot change his own role"
      });
    }

    // עדכון תפקיד המשתמש
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role: role },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // מחזירים את המשתמש המעודכן בלי סיסמה
    res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      username: updatedUser.username,
      email: updatedUser.email,
      department: updatedUser.department,
      studyYear: updatedUser.studyYear,
      role: updatedUser.role,
      isBlocked: updatedUser.isBlocked
    });
  } catch (error) {
    console.error("Admin change role error:", error.message);

    res.status(500).json({
      message: "Server error while changing user role"
    });
  }
});

module.exports = router;