const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/auth"); // auth.js import
const productsRouter = require("./routes/products");
const memberRouter = require("./routes/members");
const transactionsRouter = require("./routes/transactions");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware 설정
app.use(cors({
  origin: ["https://linemoto.co.kr"],  // ✅ 프론트엔드 주소를 허용
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],  // ✅ 허용할 HTTP 메서드 추가
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true  // ✅ 추가적으로 필요한 헤더 지정
}));
app.use(express.json());

// 라우터 설정
app.use("/auth", authRouter); // auth 라우터 사용
app.use("/products", productsRouter);
app.use("/members", memberRouter);
app.use("/transactions", transactionsRouter);

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
}); 