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
  const client = await pool.connect();

  try {
    await client.query("BEGIN"); // 트랜잭션 시작
    console.log("📌 회원가입 요청 데이터:", req.body);

    // 1️⃣ 중복 전화번호 체크
    const checkUser = await client.query(
      "SELECT id FROM users.accounts WHERE phone_number = $1",
      [phone_number]
    );
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ message: "이미 등록된 전화번호입니다." });
    }

    // 2️⃣ `accounts` 테이블에 사용자 추가
    const accountResult = await client.query(
      `INSERT INTO users.accounts (name, phone_number, password, birthdate, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, role`,
      [name, phone_number, birth, birth, "customer"]
    );
    const newAccount = accountResult.rows[0];

    console.log("✅ 신규 계정 생성 완료:", newAccount);

    // 3️⃣ `members` 테이블에 사용자 정보 추가 (중복 방지)
    await client.query(
      `INSERT INTO users.members (account_id, name, phone_number)
       VALUES ($1, $2, $3)
       ON CONFLICT (account_id) DO NOTHING;`,  // ✅ 중복 계정이면 무시
      [newAccount.id, name, phone_number]
    );

    console.log("✅ 신규 회원 정보 추가 완료 (members 테이블)");

    await client.query("COMMIT"); // 트랜잭션 커밋
    res.status(201).json({ message: "회원가입 성공", user: newAccount });

  } catch (err) {
    await client.query("ROLLBACK"); // ❌ 오류 발생 시 롤백
    console.error("❌ 회원가입 오류:", err);
    res.status(500).json({ message: "서버 오류 발생", error: err.message });
  } finally {
    client.release(); // 🔥 DB 연결 해제
  }
});

module.exports = router; // router를 내보냄