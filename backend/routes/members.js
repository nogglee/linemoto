const express = require("express");
const router = express.Router();
const pool = require("../db");

// 특정 회원 포인트 조회
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT id, name, phone_number, points FROM users.members WHERE id = $1", [id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ 회원 조회 오류:", err);
    res.status(500).json({ message: "회원 조회 실패" });
  }
});

// 포인트 지급 및 사용
router.patch("/:id/points", async (req, res) => {
  const { id } = req.params;
  const { points } = req.body; // 음수면 사용, 양수면 지급

  try {
    const result = await pool.query(
      "UPDATE users.members SET points = points + $1 WHERE id = $2 RETURNING *",
      [points, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ 포인트 업데이트 오류:", err);
    res.status(500).json({ message: "포인트 업데이트 실패" });
  }
});

module.exports = router;