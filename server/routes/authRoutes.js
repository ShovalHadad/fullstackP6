const express = require("express");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const UserPassword = require("../models/UserPassword");

const router = express.Router();

/*
POST /auth/register

Registers a new user.
Creates:
1. User document
2. UserPassword document with encrypted password
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

    // Basic validation
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({
        message: "Full name, username, email and password are required"
      });
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [
        { username: username },
        { email: email }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username or email already exists"
      });
    }

    // Create user without password
    const newUser = await User.create({
      fullName,
      username,
      email,
      department,
      studyYear
    });

    // Encrypt password
    const passwordHash = await bcrypt.hash(password, 10);

    // Save password hash in separate collection
    await UserPassword.create({
      userId: newUser._id,
      passwordHash
    });

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

Logs in an existing user.
Checks:
1. User exists
2. Password is correct
*/
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required"
      });
    }

    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    // Find password document by user id
    const userPassword = await UserPassword.findOne({
      userId: user._id
    });

    if (!userPassword) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    // Compare password with encrypted password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      userPassword.passwordHash
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    // Return user without password
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