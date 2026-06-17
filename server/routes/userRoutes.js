const express = require("express");
const bcrypt = require("bcrypt"); 

const User = require("../models/User");
const UserPassword = require("../models/UserPassword");

const router = express.Router(); // יוצר router נפרד לקובץ המשתמשים
//GET /users/:id
// מחזיר פרטי משתמש לפי id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      department: user.department,
      studyYear: user.studyYear,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error("Get user error:", error.message);

    res.status(500).json({
      message: "Server error while getting user"
    });
  }
});

/*
PUT /users/:id

עדכון פרטי משתמש.
מאפשר לעדכן:
- fullName
- username
- email
- department
- studyYear

לא מעדכן סיסמה כאן.
לשינוי סיסמה יש route נפרד.
*/
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      fullName,
      username,
      email,
      department,
      studyYear
    } = req.body; // מקבל את הנתונים מהבקשה

    // חיפוש המשתמש לפי id
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    /*
      אם רוצים לעדכן username,
      קודם בודקים שאין משתמש אחר עם אותו username.
    */
    if (username !== undefined && username !== user.username) {
      const existingUsername = await User.findOne({
        username: username,
        _id: { $ne: id }
      });

      if (existingUsername) {
        return res.status(409).json({
          message: "Username already exists"
        });
      }

      user.username = username;
    }

    /*
      אם רוצים לעדכן email,
      מנרמלים אותו כמו בהרשמה:
      trim + lowercase
      וגם בודקים שאין משתמש אחר עם אותו email.
    */
    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();

      if (normalizedEmail !== user.email) {
        const existingEmail = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: id }
        });

        if (existingEmail) {
          return res.status(409).json({
            message: "Email already exists"
          });
        }

        user.email = normalizedEmail;
      }
    }

    // עדכון שם מלא
    if (fullName !== undefined) {
      user.fullName = fullName;
    }

    /*
      עדכון מחלקה:
      trim + lowercase
      לא מוחקים רווחים בין מילים.
    */
    if (department !== undefined) {
      user.department = department.trim().toLowerCase();
    }

    // עדכון שנת לימוד
    if (studyYear !== undefined) {
      user.studyYear = studyYear;
    }

    const updatedUser = await user.save();

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
    console.error("Update user error:", error.message);

    res.status(500).json({
      message: "Server error while updating user"
    });
  }
});

// שינוי סיסמה
router.put("/:id/password", async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required"
      });
    }

    const userPassword = await UserPassword.findOne({
      userId: id
    });

    if (!userPassword) {
      return res.status(404).json({
        message: "Password record not found"
      });
    }

    // בדיקה שהסיסמה הנוכחית נכונה
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      userPassword.passwordHash
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Current password is incorrect"
      });
    }

    // הצפנת הסיסמה החדשה
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    userPassword.passwordHash = newPasswordHash;
    await userPassword.save();

    res.json({
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Change password error:", error.message);

    res.status(500).json({
      message: "Server error while changing password"
    });
  }
});

// חסימה או ביטול חסימה של משתמש
router.put("/:id/block", async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isBlocked },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      username: updatedUser.username,
      email: updatedUser.email,
      department: updatedUser.department,
      studyYear: updatedUser.studyYear,
      isBlocked: updatedUser.isBlocked
    });
  } catch (error) {
    console.error("Block user error:", error.message);

    res.status(500).json({
      message: "Server error while blocking user"
    });
  }
});

module.exports = router;