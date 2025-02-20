const express = require("express");
const router = express.Router();
const pool = require("../db");

// 🛒 결제 및 포인트 적립 로직 통합
router.post("/", async (req, res) => {
  const { member_id, admin_id, total_amount, discount, final_amount, payment_method, items } = req.body;

  try {
    // 1️⃣ 트랜잭션 저장
    const transaction = await pool.query(
      "INSERT INTO transactions.transactions (member_id, admin_id, total_amount, discount, final_amount, status, created_at, payment_method) VALUES ($1, $2, $3, $4, $5, 'completed', NOW(), $6) RETURNING id",
      [member_id, admin_id, total_amount, discount, final_amount, payment_method]
    );

    const transactionId = transaction.rows[0].id;

    // 2️⃣ 주문 내역 저장 & 상품 재고 차감
    for (const item of items) {
      await pool.query(
        "INSERT INTO transactions.orders (transaction_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [transactionId, item.product_id, item.quantity, item.price]
      );

      await pool.query(
        "UPDATE shops.products SET stock = stock - $1 WHERE id = $2",
        [item.quantity, item.product_id]
      );
    }

    // 3️⃣ 1만 원 이상 결제 시 10% 포인트 적립
    if (final_amount >= 10000) {
      const rewardPoints = Math.floor(final_amount * 0.1); // 정수 포인트 변환

      await pool.query(
        "INSERT INTO transactions.points (customer_id, admin_id, points, reason) VALUES ($1, $2, $3, '결제 금액의 10% 적립')",
        [member_id, admin_id, rewardPoints]
      );
    }

    res.json({ message: "결제 완료", transactionId });
  } catch (err) {
    console.error("❌ 결제 처리 오류:", err);
    res.status(500).json({ message: "결제 처리 실패" });
  }
});

module.exports = router;