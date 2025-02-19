import React, { useState } from "react";

const ProductForm = ({ onAddProduct }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !category || !price || !stock) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    const productData = { name, category, price: parseFloat(price), stock: parseInt(stock, 10), image };
    onAddProduct(productData);
    setName("");
    setCategory("");
    setPrice("");
    setStock("");
    setImage(null);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 border p-4">
      <input type="text" placeholder="상품명" value={name} onChange={(e) => setName(e.target.value)} className="p-2 border rounded" />
      <input type="text" placeholder="카테고리" value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 border rounded" />
      <input type="number" placeholder="가격" value={price} onChange={(e) => setPrice(e.target.value)} className="p-2 border rounded" />
      <input type="number" placeholder="초기 수량" value={stock} onChange={(e) => setStock(e.target.value)} className="p-2 border rounded" />
      <input type="file" onChange={async (e) => {
        const file = e.target.files[0];
        const imageUrl = await uploadImageToS3(file);
        if (imageUrl) {
          setNewProduct({ ...newProduct, imageUrl });
        }
      }} />
      <button type="submit" className="bg-green-500 text-white p-2 rounded">상품 등록</button>
    </form>
  );
};

export default ProductForm;
