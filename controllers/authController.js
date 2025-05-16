const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// In-memory users store for now (replace with DB later)
const users = [];

const signup = async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  // Check if user exists
  const userExists = users.find((u) => u.email === email);
  if (userExists) {
    return res.status(400).json({ message: "User already exists." });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save user
  users.push({ email, password: hashedPassword });

  res.status(201).json({ message: "User registered successfully" });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Create JWT
  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ token });
};

module.exports = { signup, login };
