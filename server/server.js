const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const todoRoutes = require("./routes/todoRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/todos", todoRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "UniSpace API is running"
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`UniSpace server is running on port ${PORT}`);
});