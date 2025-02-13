require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000; 

// CORS 설정 (프론트엔드 연결 허용)
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend is running!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.post("/data", (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "이름을 입력하세요!" });
  }

  console.log("새로운 데이터:", name);
  res.json({ message: `데이터 저장 완료: ${name}` });
});