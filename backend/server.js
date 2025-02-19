require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const multer = require("multer");
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5000; 

const allowedOrigins = [
  "http://localhost:3000",  // 로컬 개발 환경
  "https://dodogo.vercel.app"  // Vercel 배포 환경
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);  // 허용된 origin이면 요청 허용
    } else {
      callback(new Error("CORS 정책에 의해 차단된 요청"), false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],  // ✅ 허용할 HTTP 메서드 추가
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true  // ✅ 쿠키 및 인증 헤더를 포함할 경우 필요
}));
app.use(express.json());

// Supabase 연결
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 파일 업로드 설정 (multer 사용)
const upload = multer({ storage: multer.memoryStorage() });

// 파일 업로드 API
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: "파일이 필요합니다." });

        const { data, error } = await supabase.storage
            .from("product-images") // 🔹 버킷 이름
            .upload(`products/${Date.now()}-${file.originalname}`, file.buffer, {
                contentType: file.mimetype,
                cacheControl: "3600",
                upsert: false,
            });

        if (error) throw error;

        const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/product-images/${data.path}`;
        res.json({ imageUrl });
    } catch (error) {
        console.error("❌ 파일 업로드 실패:", error);
        res.status(500).json({ error: "파일 업로드 실패" });
    }
  });

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

// 포인트 지급 및 사용
app.patch("/members/:id/points", async (req, res) => {
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

// 특정 회원 포인트 조회
app.get("/members/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT id, name, phone_number, points FROM users.members WHERE id = $1", [id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ 회원 조회 오류:", err);
    res.status(500).json({ message: "회원 조회 실패" });
  }
});

// 10만원 이상 결제 시 자동으로 2만 포인트 지급(최종 수정 필요)
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
  console.log("🛠 상품 추가 요청 받음:", req.body); // ✅ 백엔드에서 실제로 받은 데이터 확인

  const { name, price, stock, category, image_url } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ error: "상품명, 가격, 카테고리는 필수 값입니다." });
  }

  try {
    const result = await pool.query(
      "INSERT INTO shops.products (name, price, stock, category, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, price, stock, category, image_url]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ 상품 추가 실패:", error);
    res.status(500).json({ error: "서버 오류" });
  }
});

// 상품 목록 조회 API
app.get("/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM shops.products ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ 상품 목록 조회 오류:", err);
    res.status(500).json({ message: "상품 목록 조회 실패" });
  }
});

//  상품 재고 업데이트
app.patch("/products/:id/stock", async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body; // 음수면 차감, 양수면 추가

  try {
    const result = await pool.query(
      "UPDATE shops.products SET stock = stock + $1 WHERE id = $2 RETURNING *",
      [quantity, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ 재고 업데이트 오류:", err);
    res.status(500).json({ message: "재고 업데이트 실패" });
  }
});

// ✅ 상품 정보 업데이트 API
app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price, stock, category, image_url } = req.body;

  // 🔹 값이 없는 경우 방어 코드 추가
  if (!name || !price || !stock || !category) {
    return res.status(400).json({ error: "필수 데이터가 없습니다." });
  }

  try {
    const result = await pool.query(
      "UPDATE shops.products SET name = $1, price = $2, stock = $3, category = $4, image_url = $5 WHERE id = $6 RETURNING *",
      [name, price, stock, category, image_url || "", id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "상품을 찾을 수 없음" });
    }

    res.json(result.rows[0]); // ✅ 업데이트된 상품 반환
  } catch (error) {
    console.error("❌ 상품 업데이트 오류:", error);
    res.status(500).json({ error: "서버 오류" });
  }
});

// 결제 처리
app.post("/transactions", async (req, res) => {
  const { member_id, admin_id, total_amount, discount, final_amount, payment_method, items } = req.body;

  try {
    const transaction = await pool.query(
      "INSERT INTO transactions.transactions (member_id, admin_id, total_amount, discount, final_amount, status, created_at, payment_method) VALUES ($1, $2, $3, $4, $5, 'completed', NOW(), $6) RETURNING id",
      [member_id, admin_id, total_amount, discount, final_amount, payment_method]
    );

    const transactionId = transaction.rows[0].id;

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

    res.json({ message: "결제 완료", transactionId });
  } catch (err) {
    console.error("❌ 결제 처리 오류:", err);
    res.status(500).json({ message: "결제 처리 실패" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
