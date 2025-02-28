const express = require("express");
const router = express.Router();
const pool = require("../db");

// 회원 목록 조회 (추가)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.id, m.account_id, a.name, a.phone_number, m.points
      FROM users.members m
      JOIN users.accounts a ON m.account_id = a.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ 회원 목록 조회 오류:", err.message);
    res.status(500).json({ message: "회원 목록 조회 실패", error: err.message });
  }
});

// 특정 회원 포인트 조회
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT m.id, m.account_id, a.name, a.phone_number, m.points
      FROM users.members m
      JOIN users.accounts a ON m.account_id = a.id
      WHERE m.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "회원을 찾을 수 없습니다." });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ 회원 조회 오류:", err.message);
    res.status(500).json({ message: "회원 조회 실패", error: err.message });
  }
});

// 포인트 지급 및 사용
router.patch("/:id/points", async (req, res) => {
  const { id } = req.params;
  const { points, reason } = req.body;

  try {
    await pool.query("BEGIN");

    // 포인트 업데이트
    const updateResult = await pool.query(
      "UPDATE users.members SET points = points + $1 WHERE id = $2 RETURNING *",
      [points, id]
    );

    if (updateResult.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ message: "회원을 찾을 수 없습니다." });
    }

    // 포인트 변경 내역 저장
    await pool.query(
      "INSERT INTO users.points_history (member_id, change_amount, reason) VALUES ($1, $2, $3)",
      [id, points, reason || "포인트 업데이트"]
    );

    await pool.query("COMMIT");

    res.json(updateResult.rows[0]);
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("❌ 포인트 업데이트 오류:", err.message);
    res.status(500).json({ message: "포인트 업데이트 실패", error: err.message });
  }
});

module.exports = router;