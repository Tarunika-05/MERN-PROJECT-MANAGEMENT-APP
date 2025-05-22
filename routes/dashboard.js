const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Protected dashboard route
router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({
    message: `Hello user ${req.user.id}, welcome to your dashboard!`,
  });
});

module.exports = router;
