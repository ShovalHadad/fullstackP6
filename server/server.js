const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "UniSpace API is running"
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`UniSpace server is running on port ${PORT}`);
});