require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRouter = require("../routes/auth"); 
const productsRouter = require("../routes/products");
const memberRouter = require("../routes/members");
const transactionsRouter = require("../routes/transactions");
const cron = require("cron").CronJob; 
const https = require("https");

const app = express();
const PORT = process.env.PORT || 5000;
const RENDER_URL = process.env.RENDER_URL || "https://api.linemoto.co.kr";

// Middleware 설정
app.use(cors({
  origin: ["https://linemoto.co.kr"],  
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],  
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true 
}));
app.use(express.json());

// 라우터 설정
app.use("/auth", authRouter); // auth 라우터 사용
app.use("/products", productsRouter);
app.use("/members", memberRouter);
app.use("/transactions", transactionsRouter);

// Cron 작업: 14분마다 Render 서버에 HTTP 요청 보내기
const keepAliveJob = new cron("*/14 * * * *", function () {
  console.log(`🔄 Keeping server awake at ${new Date().toISOString()}...`);
  https.get(RENDER_URL, (res) => {
    if (res.statusCode === 200) {
      console.log("✅ Server is awake");
    } else {
      console.error(`❌ Failed to keep server awake. Status code: ${res.statusCode}`);
    }
  }).on("error", (err) => {
    console.error("Error during keep-alive request:", err.message);
  });
}, null, true, "Asia/Seoul"); // 시간대 설정 (선택 사항)

// 서버 시작 및 오류 처리
const server = app.listen(PORT, () => {
  console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
}).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`포트 ${PORT}가 이미 사용 중입니다. 프로세스를 종료하거나 다른 포트를 시도하세요.`);
    process.exit(1); // 포트 충돌 시 프로세스 종료
  } else {
    console.error("서버 시작 중 오류 발생:", err);
  }
});

// 프로세스 종료 시 정리 (선택 사항)
process.on("SIGTERM", () => {
  server.close(() => {
    console.log("서버가 종료되었습니다.");
    keepAliveJob.stop(); // Cron 작업 중단
    process.exit(0);
  });
});