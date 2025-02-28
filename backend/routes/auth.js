const express = require("express");
const pool = require("../db"); 

const router = express.Router(); // router 인스턴스 생성

// 로그인 시, role 반환, 프론트에서 화면 분기
router.post("/login", async (req, res) => {
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

// 회원가입 엔드포인트 추가
// 회원가입 엔드포인트 수정
router.post("/signup", async (req, res) => {
  const { name, phone_number, birth } = req.body;

  try {
    // 1️⃣ 중복 전화번호 체크
    const checkUser = await pool.query(
      "SELECT id FROM users.accounts WHERE phone_number = $1",
      [phone_number]
    );
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ message: "이미 등록된 전화번호입니다." });
    }

    // 2️⃣ 사용자 추가 (password는 임시로 birth 사용)
    const accountResult = await pool.query(
      "INSERT INTO users.accounts (name, phone_number, password, birthdate, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, role",
      [name, phone_number, birth, birth, 'customer'] // 'customer'로 등록
    );

    const newAccount = accountResult.rows[0];

    // 3️⃣ 고객(customer)일 경우 users.members에도 추가
    if (newAccount.role === "customer") {
      await pool.query(
        "INSERT INTO users.members (account_id, name, phone_number) VALUES ($1, $2, $3)",
        [newAccount.id, name, phone_number]
      );
    }

    res.status(201).json({ message: "회원가입 성공", user: newAccount });
  } catch (err) {
    console.error("❌ 회원가입 오류:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router; // router를 내보냄