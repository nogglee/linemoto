const express = require("express");
const router = express.Router();
const pool = require("../db");

// 📌 상품 추가 API
router.post("/", async (req, res) => {
  const { admin_id, name, price, stock, category, image_url } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO shops.products (admin_id, name, price, stock, category, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [admin_id, name, price, stock, category, image_url || "/uploads/ico-empty.png"] // 📌 기본 이미지 설정
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ 상품 등록 오류:", err);
    res.status(500).send("Server Error");
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM shops.products");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ 상품 조회 오류:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;