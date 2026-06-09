const express = require("express");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const UserPassword = require("../models/UserPassword");

const router = express.Router();

/*
POST /auth/register

הרשמת משתמש חדש.
יוצר:
1. מסמך User עם פרטי המשתמש
2. מסמך UserPassword עם סיסמה מוצפנת
*/
router.post("/register", async (req, res) => {
  try {
    const {
      fullName,
      username,
      email,
      department,
      studyYear,
      password
    } = req.body;

    // בדיקה בסיסית שהשדות החובה קיימים
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({
        message: "Full name, username, email and password are required"
      });
    }

    /*
      נורמליזציה לפני שמירה בבסיס הנתונים:

      email:
      - מורידים רווחים בהתחלה ובסוף
      - הופכים לאותיות קטנות

      department:
      - מורידים רווחים בהתחלה ובסוף
      - הופכים לאותיות קטנות
      - לא מוחקים רווחים בין מילים
        לדוגמה: " Software Engineering " -> "software engineering"
    */
    const normalizedEmail = email.trim().toLowerCase();

    const normalizedDepartment = department
      ? department.trim().toLowerCase()
      : "";

    // בדיקה אם כבר קיים משתמש עם אותו username או אותו email
    // שימי לב: email נבדק אחרי נורמליזציה
    const existingUser = await User.findOne({
      $or: [
        { username: username },
        { email: normalizedEmail }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username or email already exists"
      });
    }

    // יצירת משתמש ללא סיסמה
    const newUser = await User.create({
      fullName,
      username,
      email: normalizedEmail,
      department: normalizedDepartment,
      studyYear
    });

    // הצפנת הסיסמה
    const passwordHash = await bcrypt.hash(password, 10);

    // שמירת הסיסמה המוצפנת באוסף נפרד
    await UserPassword.create({
      userId: newUser._id,
      passwordHash
    });

    // מחזירים ללקוח את פרטי המשתמש בלי סיסמה
    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      username: newUser.username,
      email: newUser.email,
      department: newUser.department,
      studyYear: newUser.studyYear
    });
  } catch (error) {
    console.error("Register error:", error.message);

    res.status(500).json({
      message: "Server error during registration"
    });
  }
});

/*
POST /auth/login

התחברות משתמש קיים.
בודק:
1. האם המשתמש קיים
2. האם הסיסמה נכונה
*/
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // בדיקה בסיסית שהשדות קיימים
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required"
      });
    }

    // חיפוש משתמש לפי username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    // חיפוש רשומת הסיסמה לפי ה-id של המשתמש
    const userPassword = await UserPassword.findOne({
      userId: user._id
    });

    if (!userPassword) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    // השוואת הסיסמה שהמשתמש הקליד מול הסיסמה המוצפנת
    const isPasswordCorrect = await bcrypt.compare(
      password,
      userPassword.passwordHash
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    // מחזירים את המשתמש בלי סיסמה
    res.json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      department: user.department,
      studyYear: user.studyYear
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      message: "Server error during login"
    });
  }
});

module.exports = router;