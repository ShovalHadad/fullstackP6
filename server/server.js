const express = require("express");  // מאפשר ליצור שרת Express
const cors = require("cors");  // מאפשר לשרת לקבל בקשות מ-React (או כל מקור אחר)
require("dotenv").config();  //טוען משתנים מקובץ .env

const connectDB = require("./config/db");  // פונקציה שמתחברת ל-MongoDB  
// חיבור כל קבצי ה-routes לשרת
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const todoRoutes = require("./routes/todoRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const albumRoutes = require("./routes/albumRoutes");
const photoRoutes = require("./routes/photoRoutes");

const app = express();  // יצירת שרת Express ז"א יוצר אפליקציית Express

// התחברות לבסיס הנתונים MongoDB
connectDB();

// מאפשר ל-React לשלוח בקשות לשרת
app.use(cors()); //שליחת בקשות לשרת

// מאפשר לשרת לקבל JSON מהבקשות
app.use(express.json());  // קבלת מידע מהשרת

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