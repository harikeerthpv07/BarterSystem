import express from "express";
import bcrypt from "bcrypt";
import pool from "./db.js";
import jwt from "jsonwebtoken";


const router = express.Router();

// POST /auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Check if user already exists
    const [existing] = await pool.query(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [email, username]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insert into DB
    await pool.query(
      "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, 'user')",
      [username, email, hashedPassword]
    );

    res.json({ message: "Signup successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const [users] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = users[0];

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});
export default router;
