const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const todoRoutes = require("./routes/todoRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const albumRoutes = require("./routes/albumRoutes");
const photoRoutes = require("./routes/photoRoutes");

const app = express();

// התחברות לבסיס הנתונים MongoDB
connectDB();

// מאפשר ל-React לשלוח בקשות לשרת
app.use(cors());

// מאפשר לשרת לקבל JSON מהבקשות
app.use(express.json());

// חיבור כל קבצי ה-routes לשרת
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/todos", todoRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/admin", adminRoutes);
app.use("/albums", albumRoutes);
app.use("/photos", photoRoutes);

// בדיקה בסיסית שהשרת עובד
app.get("/", (req, res) => {
  res.json({
    message: "UniSpace API is running"
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`UniSpace server is running on port ${PORT}`);
});