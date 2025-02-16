require('dotenv').config();  // .env 파일 로드
const { Pool } = require('pg');  // PostgreSQL 연결을 위한 Pool 사용

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  max: 10,  // 최대 연결 수
  idleTimeoutMillis: 30000, // 30초 동안 연결이 없으면 해제
  connectionTimeoutMillis: 2000, // 2초 동안 연결 시도
});

pool.connect()
  .then(() => console.log("🚀 PostgreSQL 연결 성공!"))
  .catch(err => console.error("❌ PostgreSQL 연결 오류:", err));

module.exports = pool;