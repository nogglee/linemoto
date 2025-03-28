const express = require("express");
const router = express.Router();
const pool = require("../db");

// ✅ 결제 처리 API
router.post("/", async (req, res) => {
  console.log("📌 서버에서 받은 데이터:", req.body); // ✅ 확인용 로그 추가
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
      adjustment_reason = adjustment_reason ? adjustment_reason.trim() : "", // ✅ 조정 사유 (기본값 "")
      final_amount, 
      payment_method, 
      store_id,
      items 
    } = req.body;

    if (!admin_id) throw new Error("admin_id가 제공되지 않았습니다.");
    if (!store_id) throw new Error("store_id가 제공되지 않았습니다.");

    const adminCheck = await client.query("SELECT id FROM users.admins WHERE id = $1", [admin_id]);
    if (adminCheck.rows.length === 0) throw new Error(`유효하지 않은 admin_id: ${admin_id}`);

    const storeCheck = await client.query("SELECT id FROM shops.stores WHERE id = $1", [store_id]);
    if (storeCheck.rows.length === 0) throw new Error(`유효하지 않은 store_id: ${store_id}`);

    const calculatedEarnedPoints = final_amount >= 10000 ? Math.floor(final_amount * 0.05) : 0;
    const earned_points = customer_id ? calculatedEarnedPoints : 0;
    
    if (customer_id && earned_points !== calculatedEarnedPoints) {
      throw new Error("Earned points mismatch");
    }

    // ✅ `adjustment` 값을 숫자로 변환하여 저장
    const numericAdjustment = parseFloat(adjustment) || 0;
    console.log("🚀 변환된 adjustment 값:", numericAdjustment, typeof numericAdjustment);


    const saleResult = await client.query(
      `INSERT INTO transactions.sales 
      (admin_id, admin_name, customer_id, total_amount, discount, adjustment, adjustment_reason, final_amount, payment_method, store_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP) RETURNING id`,
      [admin_id, admin_name, customer_id, total_amount, discount, numericAdjustment, adjustment_reason, final_amount, payment_method, store_id]
    );

    const saleId = saleResult.rows[0].id;
    console.log(`✅ 거래 내역 생성 완료 (ID: ${saleId}) - 결제수단: ${payment_method}, Store ID: ${store_id}`);

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

    // ✅ 5️⃣ 상품 재고 차감 로직 추가
    const updateStockPromises = items.map(item =>
      client.query(
        `UPDATE shops.products SET stock = stock - $1 WHERE id = $2 AND store_id = $3`,
        [item.quantity, item.product_id, store_id]
      )
    );

    await Promise.all(updateStockPromises);
    
    console.log("✅ 상품 재고 차감 완료");


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

router.get("/sales/:admin_id", async (req, res) => {
  const { admin_id } = req.params;
  console.log("📌 매출 데이터 요청 - admin_id:", admin_id);

  try {
    
    const result = await pool.query(
      `SELECT 
        s.id, 
        s.final_amount, 
        s.discount, 
        s.payment_method, 
        s.created_at,
        s.admin_name,
        COALESCE(a.name, '비회원') AS customer_name,
        ROUND(s.final_amount * 0.05) AS earned_points,
        s.adjustment,
        s.adjustment_reason,
        s.store_id, -- store_id 추가
        st.name AS store_name,
        json_agg(json_build_object(
          'product_id', sd.product_id,
          'name', p.name,
          'quantity', sd.quantity,
          'price', sd.price
        )) AS items
      FROM transactions.sales s
      LEFT JOIN users.accounts a ON s.customer_id = a.id
      JOIN transactions.sales_details sd ON s.id = sd.sale_id
      JOIN shops.products p ON sd.product_id = p.id
      JOIN shops.stores st ON s.store_id = st.id
      WHERE s.admin_id = $1  -- 여기서 현재 로그인한 관리자의 id 사용
      GROUP BY 
        s.id, s.final_amount, s.discount, s.payment_method, s.created_at,
        s.admin_id, s.admin_name, a.name, s.adjustment, s.adjustment_reason, s.store_id, st.name
      ORDER BY s.created_at DESC;`,
      [admin_id]
    );
    // console.log("📌 received earned_points:", result.rows.map(row => row.earned_points));
    // console.log("📌 서버에서 반환한 sales 데이터:", result.rows); // ✅ 이 로그가 찍혀야 함


    res.json(result.rows);
  } catch (err) {
    console.error("❌ 매출 내역 조회 오류:", err);
    res.status(500).json({ message: "매출 내역 조회 실패" });
  }
});

module.exports = router;