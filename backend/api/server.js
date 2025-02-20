const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/auth"); // auth.js import
const productsRouter = require("./routes/products");
const memberRouter = require("./routes/members");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware 설정
app.use(cors());
app.use(express.json());

// 라우터 설정
app.use("/auth", authRouter); // auth 라우터 사용
app.use("/products", productsRouter);
app.use("/members", memberRouter);

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
}); 