const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// 📌 이미지 저장 경로 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // uploads 폴더에 저장
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // 파일명 설정
  },
});

const upload = multer({ storage });

// 📌 이미지 업로드 API
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "파일을 업로드하세요." });
  }
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

module.exports = router;