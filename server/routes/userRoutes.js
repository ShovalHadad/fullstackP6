const express = require("express");
const User = require("../models/User");

const router = express.Router();

/*
GET /users/:id

Returns user details by id.
Does not return password because passwords are stored separately
in UserPassword collection.
*/
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

module.exports = router;