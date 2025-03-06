require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000; 

const allowedOrigins = [
  "http://localhost:3000",  // 로컬 개발 환경
  "https://linemoto.co.kr"  // Vercel 배포 환경
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

// 라우터
const authRouter = require("./routes/auth");
const productsRouter = require("./routes/products");
const memberRouter = require("./routes/members");
const transactionRouter = require("./routes/transactions");
const adminRouter = require("./routes/admin");

app.use("/auth", authRouter);  
app.use("/products", productsRouter);  
app.use("/members", memberRouter);
app.use("/transactions", transactionRouter);
app.use("/admins", adminRouter);

app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
