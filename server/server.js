import express from "express";
import dotenv from "dotenv";
import pool from "./db.js";
import authRoutes from "./auth.js";
import itemRoutes from "./items.js";
import offerRoutes from "./offers.js";
import cors from "cors";




dotenv.config();

const app = express();
app.use(cors());
app.use(cors({
  origin: "https://barter-system-frontend.vercel.app", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/items", itemRoutes);
app.use("/offers", offerRoutes);




// Test route
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS result");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database test failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
