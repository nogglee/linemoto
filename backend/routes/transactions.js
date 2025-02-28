const express = require("express");
const router = express.Router();
const pool = require("../db");

// ✅ 결제 처리 API
router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN"); // 🔹 트랜잭션 시작

    const { 
      admin_id, 
      admin_name, // ✅ 관리자 이름 추가
      customer_id, 
      total_amount, 
      discount, 
      adjustment = 0, // ✅ 추가/차감 금액 (기본값 0)
      adjustment_reason = "", // ✅ 조정 사유 (기본값 "")
      final_amount, 
      earned_points,
      payment_method, 
      items 
    } = req.body;

    console.log("🚀 서버에서 받은 데이터:", {
      admin_id,
      admin_name,
      customer_id,
      total_amount,
      discount,
      adjustment,
      adjustment_reason,
      final_amount,
      earned_points,
      payment_method,
    });

    const calculatedEarnedPoints = final_amount >= 10000 ? Math.floor(final_amount * 0.1) : 0;
    if (earned_points !== calculatedEarnedPoints) {
      throw new Error("Earned points mismatch");
    }

    // ✅ `adjustment` 값을 숫자로 변환하여 저장
    const numericAdjustment = parseFloat(adjustment) || 0;

    // ✅ 1️⃣ 거래 내역 저장 (`sales`)
    const saleResult = await client.query(
      `INSERT INTO transactions.sales 
       (admin_id, admin_name, customer_id, total_amount, discount, adjustment, adjustment_reason, final_amount, payment_method, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP) RETURNING id`,
      [admin_id, admin_name, customer_id, total_amount, discount, numericAdjustment, adjustment_reason, final_amount, payment_method]
    );

    const saleId = saleResult.rows[0].id;
    console.log(`✅ 거래 내역 생성 완료 (ID: ${saleId}) - 결제수단: ${payment_method}`);

    await client.query("COMMIT"); // 🔹 `sales` INSERT 후 트랜잭션 커밋

    // ✅ 2️⃣ 별도 트랜잭션 시작 후 구매한 상품 정보 저장 (`sales_details`)
    await client.query("BEGIN"); 

    const insertPromises = items.map(item =>
      client.query(
        `INSERT INTO transactions.sales_details (sale_id, product_id, quantity, price) 
         VALUES ($1, $2, $3, $4)`,
        [saleId, item.product_id, item.quantity, item.price]
      )
    );
    await Promise.all(insertPromises);
    
    // ✅ 3️⃣ 포인트 차감 (할인 적용 시)
    if (discount > 0) {
      await client.query(
        "UPDATE users.members SET points = points - $1 WHERE account_id = $2",
        [discount, customer_id]
      );
    }

    // ✅ 4️⃣ 적립 포인트 업데이트 (차감 금액을 제외한 최종 결제금액의 10%)
    await client.query(
      "UPDATE users.members SET points = points + $1 WHERE account_id = $2",
      [earned_points, customer_id]
    );

    await client.query("COMMIT"); // 🔹 두 번째 트랜잭션 완료
    res.json({ message: "결제 완료", saleId });
  } catch (err) {
    await client.query("ROLLBACK"); // 🔹 오류 발생 시 롤백
    console.error("❌ 결제 처리 오류:", err);
    res.status(500).json({ message: "결제 실패" });
  } finally {
    client.release();
  }
});

module.exports = router;