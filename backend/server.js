require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5000; 

// CORS 설정 (프론트엔드 연결 허용)
app.use(cors({
  origin: "*",  // 🔥 모든 도메인에서 API 호출 가능하게 설정
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// DB에서 데이터 조회
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users.accounts");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ DB 조회 오류:", err);
    res.status(500).send("Server Error");
  }
});


app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});

app.post("/data", (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "이름을 입력하세요!" });
  }

  console.log("새로운 데이터:", name);
  res.json({ message: `데이터 저장 완료: ${name}` });
});