const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/store/:account_id", async (req, res) => {
  const { account_id } = req.params;
  console.log("📌 조회 요청된 account_id:", account_id);

  try {
    const adminResult = await pool.query(
      `SELECT id FROM users.admins WHERE account_id = $1`,
      [account_id]
    );

    if (adminResult.rows.length === 0) {
      console.log("❌ 관리자 정보 없음:", account_id);
      return res.status(404).json({ message: "해당 계정에 대한 관리자 정보가 없습니다." });
    }

    const admin_id = adminResult.rows[0].id;

    const storeResult = await pool.query(
      `SELECT store_id FROM users.admin_stores WHERE admin_id = $1`,
      [admin_id]
    );

    if (storeResult.rows.length === 0) {
      console.log("❌ 관리자와 연결된 스토어 없음:", admin_id);
      return res.status(404).json({ message: "관리자와 연결된 스토어가 없습니다." });
    }

    const store_id = storeResult.rows[0].store_id;
    console.log("✅ 조회된 관리자 및 스토어 정보:", { admin_id, store_id });
    res.json({ admin_id, store_id });
  } catch (err) {
    console.error("❌ 관리자 및 스토어 조회 오류:", err);
    res.status(500).json({ message: "조회 실패" });
  }
});

module.exports = router;