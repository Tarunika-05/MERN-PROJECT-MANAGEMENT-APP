const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import auth routes
const authRoutes = require("./routes/auth");

// Use auth routes
// Use auth routes
app.use("/api/auth", authRoutes); // ✅ correct

const projectRoutes = require("./routes/projects");
const dashboardRoutes = require("./routes/dashboard");

app.use("/api/projects", projectRoutes);
app.use("/api", dashboardRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Health check
app.get("/", (req, res) => {
  res.send("Projex API is running...");
});
