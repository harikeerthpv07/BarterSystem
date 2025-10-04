import express from "express";
import pool from "./db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to verify JWT
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1]; // Bearer <token>
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // store user info in request
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// POST /items - Add new item
router.post("/", authenticate, async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;

    await pool.query(
      "INSERT INTO items (user_id, title, description) VALUES (?, ?, ?)",
      [userId, title, description]
    );

    res.json({ message: "Item added successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add item" });
  }
});

// GET /items - List all available items
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, title, description, user_id, status, created_at FROM items WHERE status = 'available'"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// PUT /items/:id - Update an item (only owner)
router.put("/:id", authenticate, async (req, res) => {
  try {
    const itemId = req.params.id;
    const userId = req.user.id;
    const { title, description } = req.body;

    // 1. Check if item belongs to the user
    const [items] = await pool.query(
      "SELECT * FROM items WHERE id = ? AND user_id = ?",
      [itemId, userId]
    );

    if (items.length === 0) {
      return res.status(403).json({ error: "You can only update your own items" });
    }

    // 2. Update the item
    await pool.query(
      "UPDATE items SET title = ?, description = ? WHERE id = ?",
      [title, description, itemId]
    );

    res.json({ message: "Item updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update item" });
  }
});
// DELETE /items/:id - Soft delete an item (only owner)
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const itemId = req.params.id;
    const userId = req.user.id;

    // 1. Check if item belongs to the user
    const [items] = await pool.query(
      "SELECT * FROM items WHERE id = ? AND user_id = ?",
      [itemId, userId]
    );

    if (items.length === 0) {
      return res.status(403).json({ error: "You can only delete your own items" });
    }

    // 2. Soft delete the item
    await pool.query(
      "UPDATE items SET status = 'deleted' WHERE id = ?",
      [itemId]
    );

    res.json({ message: "Item deleted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});


export default router;
