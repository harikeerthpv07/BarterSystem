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
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// POST /offers - Make an offer
router.post("/", authenticate, async (req, res) => {
  try {
    const { item_id, offered_item_id } = req.body;
    const userId = req.user.id;

    // Check if the offered item belongs to the user
    const [ownedItems] = await pool.query(
      "SELECT * FROM items WHERE id = ? AND user_id = ?",
      [offered_item_id, userId]
    );
    if (ownedItems.length === 0) {
      return res.status(403).json({ error: "You can only offer your own items" });
    }

    // Insert offer into DB
    await pool.query(
      "INSERT INTO offers (item_id, offered_by, offered_item_id) VALUES (?, ?, ?)",
      [item_id, userId, offered_item_id]
    );

    res.json({ message: "Offer created successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create offer" });
  }
});
// GET /offers/received - List all offers made to user's items
router.get("/received", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const [offers] = await pool.query(
      `SELECT o.id, o.item_id, o.offered_by, o.offered_item_id, o.status, o.created_at
       FROM offers o
       JOIN items i ON o.item_id = i.id
       WHERE i.user_id = ?`,
      [userId]
    );

    res.json(offers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch received offers" });
  }
});

// POST /offers/:id/accept - Accept an offer
router.post("/:id/accept", authenticate, async (req, res) => {
  try {
    const offerId = req.params.id;
    const userId = req.user.id;

    // 1. Verify ownership of the requested item
    const [offers] = await pool.query(
      `SELECT o.*, i.user_id AS owner_id, o.item_id, o.offered_item_id
       FROM offers o
       JOIN items i ON o.item_id = i.id
       WHERE o.id = ? AND i.user_id = ?`,
      [offerId, userId]
    );

    if (offers.length === 0) {
      return res.status(403).json({ error: "You can only accept offers for your own items" });
    }

    const offer = offers[0];

    // 2. Update offer status to accepted
    await pool.query(
      "UPDATE offers SET status = 'accepted' WHERE id = ?",
      [offerId]
    );

    // 3. Update both items to exchanged
    await pool.query(
      "UPDATE items SET status = 'exchanged' WHERE id IN (?, ?)",
      [offer.item_id, offer.offered_item_id]
    );

    // 4. Reject all other pending offers for the same item
    await pool.query(
      "UPDATE offers SET status = 'rejected' WHERE item_id = ? AND id != ? AND status = 'pending'",
      [offer.item_id, offerId]
    );

    res.json({ message: "Offer accepted and items exchanged!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to accept offer" });
  }
});

// POST /offers/:id/reject - Reject an offer
router.post("/:id/reject", authenticate, async (req, res) => {
  try {
    const offerId = req.params.id;
    const userId = req.user.id;

    // 1. Verify ownership of the requested item
    const [offers] = await pool.query(
      `SELECT o.*, i.user_id AS owner_id
       FROM offers o
       JOIN items i ON o.item_id = i.id
       WHERE o.id = ? AND i.user_id = ?`,
      [offerId, userId]
    );

    if (offers.length === 0) {
      return res.status(403).json({ error: "You can only reject offers for your own items" });
    }

    // 2. Update offer status to rejected
    await pool.query(
      "UPDATE offers SET status = 'rejected' WHERE id = ?",
      [offerId]
    );

    res.json({ message: "Offer rejected!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reject offer" });
  }
});

// GET /offers/sent - List all offers made by current user
router.get("/sent", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const [offers] = await pool.query(
      `SELECT o.id, o.item_id, o.offered_item_id, o.status, o.created_at,
              i1.title AS item_title,
              i2.title AS offered_item_title,
              i1.user_id AS item_owner_id
       FROM offers o
       JOIN items i1 ON o.item_id = i1.id
       JOIN items i2 ON o.offered_item_id = i2.id
       WHERE o.offered_by = ?`,
      [userId]
    );

    res.json(offers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sent offers" });
  }
});


export default router;
