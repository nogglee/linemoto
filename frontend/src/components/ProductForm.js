import React, { useState } from "react";
import axios from "axios";

const ProductForm = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = "/uploads/default.jpg"; // 기본 이미지 설정

      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        const uploadRes = await axios.post("http://localhost:5001/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadRes.data.imageUrl;
      }

      const response = await axios.post("http://localhost:5001/products", {
        admin_id: 1, // 테스트용으로 어드민 ID 1 사용
        name,
        price,
        stock,
        image_url: imageUrl,
      });

      alert("상품이 등록되었습니다!");
    } catch (error) {
      console.error("상품 등록 오류:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="상품명" value={name} onChange={(e) => setName(e.target.value)} required />
      <input type="number" placeholder="가격" value={price} onChange={(e) => setPrice(e.target.value)} required />
      <input type="number" placeholder="재고" value={stock} onChange={(e) => setStock(e.target.value)} required />
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <button type="submit">상품 등록</button>
    </form>
  );
};

export default ProductForm;