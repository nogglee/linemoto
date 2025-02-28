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

// ✅ 특정 회원의 거래 내역 조회 API 추가
router.get("/:id/transactions", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT s.id, s.final_amount, s.discount, s.payment_method, s.created_at,
              COALESCE(json_agg(sd) FILTER (WHERE sd.id IS NOT NULL), '[]') AS items,
              FLOOR(s.final_amount * 0.1) AS earned_points
       FROM transactions.sales s
       LEFT JOIN transactions.sales_details sd ON s.id = sd.sale_id
       WHERE s.customer_id = $1
       GROUP BY s.id
       ORDER BY s.created_at DESC`, // ✅ 최신순 정렬
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ 회원 거래 내역 조회 오류:", err);
    res.status(500).json({ message: "회원 거래 내역 조회 실패" });
  }
});

// ✅ 미수금 고객 조회 API (미수금 결제 고객만 필터링)
router.get("/arrears", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.id, m.name, m.phone_number, SUM(s.final_amount) AS unpaid_amount
       FROM users.members m
       JOIN transactions.sales s ON m.account_id = s.customer_id
       WHERE s.payment_method = '미수금'
       GROUP BY m.id
       HAVING SUM(s.final_amount) > 0
       ORDER BY unpaid_amount DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ 미수금 회원 조회 오류:", err);
    res.status(500).json({ message: "미수금 회원 조회 실패" });
  }
});

// ✅ 미수금 결제 처리 API (미수금 → 카드/현금 변환)
router.patch("/:id/pay-arrears", async (req, res) => {
  const { id } = req.params;
  const { payment_method } = req.body;

  if (!["카드", "현금", "계좌이체"].includes(payment_method)) {
    return res.status(400).json({ message: "잘못된 결제 방식입니다." });
  }

  try {
    const result = await pool.query(
      `UPDATE transactions.sales
       SET payment_method = $1
       WHERE customer_id = $2 AND payment_method = '미수금'
       RETURNING *`,
      [payment_method, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "미수금 내역이 없습니다." });
    }

    res.json({ message: "미수금 결제 완료", updatedRows: result.rowCount });
  } catch (err) {
    console.error("❌ 미수금 결제 처리 오류:", err);
    res.status(500).json({ message: "미수금 결제 처리 실패" });
  }
});

router.get("/mypage/:account_id", async (req, res) => {
  const { account_id } = req.params;

  try {
    // 🔹 1️⃣ account_id를 이용하여 해당 회원 정보 가져오기
    const memberResult = await pool.query(
      `SELECT m.id, m.account_id, m.name, m.phone_number, m.points
       FROM users.members m
       WHERE m.account_id = $1`,
      [account_id]
    );

    if (memberResult.rows.length === 0) {
      return res.status(404).json({ message: "회원 정보를 찾을 수 없습니다." });
    }

    const member = memberResult.rows[0];

    // 🔹 2️⃣ 해당 회원의 결제 내역 가져오기 (earned_points 추가)
    const transactionsResult = await pool.query(
      `SELECT s.id, s.final_amount, s.discount, s.payment_method, s.created_at,
              ROUND(s.final_amount * 0.1) AS earned_points,  -- 🔥 적립된 포인트 계산
              json_agg(json_build_object(
                'product_id', sd.product_id,
                'name', p.name,
                'quantity', sd.quantity,
                'price', sd.price
              )) AS items
       FROM transactions.sales s
       JOIN transactions.sales_details sd ON s.id = sd.sale_id
       JOIN shops.products p ON sd.product_id = p.id
       WHERE s.customer_id = $1
       GROUP BY s.id
       ORDER BY s.created_at DESC`,
      [member.id]
    );

    res.json({ member, transactions: transactionsResult.rows });
  } catch (err) {
    console.error("❌ MyPage 데이터 조회 오류:", err);
    res.status(500).json({ message: "MyPage 데이터 조회 실패" });
  }
});

module.exports = router;