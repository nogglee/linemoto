const express = require("express");
const router = express.Router();
const pool = require("../db");

// ✅ 결제 처리 API
// ✅ 결제 API
router.post("/", async (req, res) => {
  const client = await pool.connect(); // ✅ 트랜잭션을 위해 DB 커넥션 획득

  try {
    await client.query("BEGIN"); // 🔹 트랜잭션 시작

    const { admin_id, customer_id, total_amount, discount, final_amount, payment_method, items } = req.body;
    const earned_points = Math.floor(final_amount * 0.1); // ✅ 10% 적립

    // ✅ 1️⃣ 거래 내역 저장 (`sales`)
    const saleResult = await client.query(
      `INSERT INTO transactions.sales (admin_id, customer_id, total_amount, discount, final_amount, payment_method, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id`,
      [admin_id, customer_id, total_amount, discount, final_amount, payment_method]
    );

    const saleId = saleResult.rows[0].id; // ✅ `sale_id` 확보

    // ✅ 2️⃣ 구매한 상품 정보 저장 (`sales_details`)
    const insertPromises = items.map(item =>
      client.query(
        `INSERT INTO transactions.sales_details (sale_id, product_id, quantity, price) 
         VALUES ($1, $2, $3, $4)`,
        [saleId, item.product_id, item.quantity, item.price]
      )
    );
    await Promise.all(insertPromises); // ✅ 모든 상품 INSERT 실행

    // ✅ 3️⃣ 포인트 업데이트 (포인트 사용 차감)
    if (discount > 0) {
      await client.query(
        "UPDATE users.members SET points = points - $1 WHERE account_id = $2",
        [discount, customer_id]
      );
    }

    // ✅ 4️⃣ 적립 포인트 업데이트
    await client.query(
      "UPDATE users.members SET points = points + $1 WHERE account_id = $2",
      [earned_points, customer_id]
    );

    await client.query("COMMIT"); // 🔹 트랜잭션 완료
    res.json({ message: "결제 완료", saleId });
  } catch (err) {
    await client.query("ROLLBACK"); // 🔹 오류 발생 시 롤백
    console.error("❌ 결제 처리 오류:", err);
    res.status(500).json({ message: "결제 실패" });
  } finally {
    client.release(); // ✅ DB 커넥션 반환
  }
});

module.exports = router;