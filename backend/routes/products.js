const express = require("express");
const router = express.Router();
const pool = require("../db");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const upload = multer({ storage: multer.memoryStorage() });

// 상품 추가
router.post("/", async (req, res) => {
  console.log("🛠 상품 추가 요청 받음:", req.body); // ✅ 백엔드에서 실제로 받은 데이터 확인

  const { name, price, stock, category, image_url, store_id } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ error: "상품명, 가격, 카테고리는 필수 값입니다." });
  }

  try {
    const result = await pool.query(
      "INSERT INTO shops.products (name, price, stock, category, image_url, store_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, price, stock, category, image_url, store_id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ 상품 추가 실패:", error);
    res.status(500).json({ error: "서버 오류" });
  }
});

// 상품 목록 조회 API
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM shops.products ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ 상품 목록 조회 오류:", err);
    res.status(500).json({ message: "상품 목록 조회 실패" });
  }
});

// ✅ 고객용 API: 특정 카테고리 상품만 가져오기
router.get("/category/:categoryName", async (req, res) => {
  const { categoryName } = req.params; // URL에서 categoryName 추출

  try {
    const result = await pool.query(
      "SELECT * FROM shops.products WHERE category = $1 ORDER BY id DESC",
      [categoryName]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ 카테고리별 상품 조회 오류:", err);
    res.status(500).json({ message: "상품 조회 실패" });
  }
});

// 상품 정보 업데이트 API
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  let { name, price, stock, category, image_url } = req.body;

  console.log("🛠 상품 업데이트 요청 받음:", req.body);
  
  // 🔹 필수 값 확인
  if (!name || !price || !category) {
    console.error("❌ 상품 업데이트 실패: 필수 데이터 누락", req.body);
    return res.status(400).json({ error: "필수 데이터가 없습니다." });
  }

  // ✅ `image_url`이 없으면 기본 이미지 적용
  if (!image_url) {
    image_url = `${process.env.SUPABASE_URL}/storage/v1/object/public/product-images/default.png`;
  }

  try {
    const result = await pool.query(
      "UPDATE shops.products SET name = $1, price = $2, stock = $3, category = $4, image_url = $5 WHERE id = $6 RETURNING *",
      [name, price, stock, category, image_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "상품을 찾을 수 없음" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ 상품 업데이트 오류:", error);
    res.status(500).json({ error: "서버 오류" });
  }
});

// 상품 삭제 API
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM shops.products WHERE id = $1 RETURNING *", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "삭제할 상품을 찾을 수 없습니다." });
    }
    res.status(200).json({ message: "상품 삭제 완료", deletedProduct: result.rows[0] });
  } catch (error) {
    console.error("❌ 상품 삭제 오류:", error);
    res.status(500).json({ error: "서버 오류" });
  }
});

// 파일 업로드 API
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: "파일이 필요합니다." });

        const { data, error } = await supabase.storage
            .from("product-images") // 🔹 버킷 이름
            .upload(`products/${Date.now()}-${file.originalname}`, file.buffer, {
                contentType: file.mimetype,
                cacheControl: "3600",
                upsert: false,
            });

        if (error) throw error;

        const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/product-images/${data.path}`;
        res.json({ imageUrl });
    } catch (error) {
        console.error("❌ 파일 업로드 실패:", error);
        res.status(500).json({ error: "파일 업로드 실패" });
    }
  });

  router.delete("/:id/deleteImage", async (req, res) => {
    const { id } = req.params;
  
    try {
      // 1️⃣ 상품 이미지 URL 가져오기
      const result = await pool.query("SELECT image_url FROM shops.products WHERE id = $1", [id]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
      }
  
      const imageUrl = result.rows[0].image_url;
  
      // 2️⃣ 기본 이미지라면 삭제 불가능
      if (imageUrl.includes("default.png")) {
        return res.status(400).json({ error: "기본 이미지는 삭제할 수 없습니다." });
      }
  
      // 3️⃣ Supabase에서 이미지 삭제
      const imagePath = imageUrl.split("/product-images/")[1];
      const { error } = await supabase.storage.from("product-images").remove([`products/${imagePath}`]);
  
      if (error) throw error;
  
      // 4️⃣ DB에서 image_url 필드 초기화
      await pool.query("UPDATE shops.products SET image_url = NULL WHERE id = $1", [id]);
  
      res.json({ success: true, message: "이미지 삭제 완료" });
    } catch (error) {
      console.error("❌ 이미지 삭제 오류:", error);
      res.status(500).json({ error: "이미지 삭제 실패" });
    }
  });

  // 기존 상품 이미지 수정 (업데이트) API
  router.put("/:id/updateImage", upload.single("file"), async (req, res) => {
    const { id } = req.params;
    const file = req.file; // ✅ Multer가 파일을 받아왔는지 확인
  
    if (!file) {
      console.error("❌ 파일이 전달되지 않음");
      return res.status(400).json({ error: "파일이 전달되지 않았습니다." });
    }
  
    try {
      // ✅ Supabase에 업로드
      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(`products/${Date.now()}-${file.originalname}`, file.buffer, {
          contentType: file.mimetype,
          cacheControl: "3600",
          upsert: true,
        });
  
      if (error) throw error;
  
      const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/product-images/${data.path}`;
  
      // ✅ DB에 이미지 업데이트
      await pool.query("UPDATE shops.products SET image_url = $1 WHERE id = $2", [imageUrl, id]);
  
      res.json({ imageUrl });
    } catch (error) {
      console.error("❌ 이미지 업데이트 실패:", error);
      res.status(500).json({ error: "이미지 업데이트 실패" });
    }
  });

  // 상품 재고 업데이트 API
// quantity에 음수 값을 보내면 해당 수량만큼 차감, 양수면 추가
router.patch("/:id/stock", async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body; // 예: -2 (재고 차감)

  console.log(`🔹 [재고 업데이트 요청] 상품 ID: ${id}, 요청된 변경 수량: ${quantity}`);

  try {
    // ✅ 현재 재고 확인
    const stockResult = await pool.query("SELECT stock FROM shops.products WHERE id = $1", [id]);
    if (stockResult.rows.length === 0) {
      console.log("❌ 상품을 찾을 수 없음");
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }

    const currentStock = stockResult.rows[0].stock;
    if (currentStock + quantity < 0) {
      console.log(`❌ [재고 부족] 현재 수량: ${currentStock}, 요청 수량: ${quantity}`);
      return res.status(400).json({ message: "재고가 부족합니다." });
    }

    // ✅ 재고 업데이트 실행
    const result = await pool.query(
      "UPDATE shops.products SET stock = stock + $1 WHERE id = $2 RETURNING *",
      [quantity, id]
    );

    console.log(`✅ [DB 업데이트 완료] 상품 ID: ${id}, 차감 수량: ${quantity}, 변경 후 재고: ${result.rows[0].stock}`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ [재고 업데이트 오류]:", err.message);
    res.status(500).json({ message: "재고 업데이트 실패", error: err.message });
  }
});


module.exports = router;