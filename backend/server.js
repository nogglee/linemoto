require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5000; 

// CORS 설정 (프론트엔드 연결 허용)
app.use(cors({
  origin: ["https://dodogo.vercel.app"],  // ✅ 프론트엔드 주소를 허용
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],  // ✅ 허용할 HTTP 메서드 추가
  allowedHeaders: ["Content-Type", "Authorization"]  // ✅ 추가적으로 필요한 헤더 지정
}));
app.use(express.json());

// 로그인 시, role 반환, 프론트에서 화면 분기
app.post("/login", async (req, res) => {
  const { phone_number, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT id, name, role FROM users.accounts WHERE phone_number = $1 AND password = $2",
      [phone_number, password]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "로그인 실패" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ 로그인 오류:", err);
    res.status(500).send("Server Error");
  }
});

// 어드민이 고객에게 포인트 지급
app.post("/points", async (req, res) => {
  const { admin_id, customer_id, points, reason } = req.body;
  try {
    await pool.query(
      "INSERT INTO transactions.points (customer_id, admin_id, points, reason) VALUES ($1, $2, $3, $4)",
      [customer_id, admin_id, points, reason]
    );
    res.json({ message: "포인트 지급 완료" });
  } catch (err) {
    console.error("❌ 포인트 지급 오류:", err);
    res.status(500).send("Server Error");
  }
});

// 10만원 이상 결제 시 자동으로 2만 포인트 지급
app.post("/sales", async (req, res) => {
  const { admin_id, customer_id, total_amount, discount, final_amount, payment_method } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO transactions.sales (admin_id, customer_id, total_amount, discount, final_amount, payment_method) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [admin_id, customer_id, total_amount, discount, final_amount, payment_method]
    );

    if (final_amount >= 100000) {
      await pool.query(
        "INSERT INTO transactions.points (customer_id, admin_id, points, reason) VALUES ($1, $2, 20000, '10만 원 이상 결제 자동 적립')",
        [customer_id, admin_id]
      );
    }

    res.json({ message: "결제 완료", sale_id: result.rows[0].id });
  } catch (err) {
    console.error("❌ 결제 오류:", err);
    res.status(500).send("Server Error");
  }
});

app.post("/products", async (req, res) => {
  const { shop_id, name, price, stock, category } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO shops.products (shop_id, name, price, stock, category) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [shop_id, name, price, stock, category]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ 상품 추가 오류:", err);
    res.status(500).send("Server Error");
  }
});

// 상품 목록 조회 API
app.get("/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM shops.products");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ 상품 조회 오류:", err);
    res.status(500).send("Server Error");
  }
});


app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
