import React, { useState, useEffect } from "react";
import { getCategories } from "../../api/products";
import { useNavigate } from "react-router-dom";

const categoryImageMap = {
  "엔진오일": "OIL",
  "거치대/케이스": "CRADLE"
};

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesData = await getCategories();
      const categories = categoriesData.map(item => item.category);
      console.log("🛠 변환된 카테고리 데이터:", categories);
      setCategories(categories);
    };
    
    fetchCategories();
  }, []);

  const handleSelectCategory = (category) => {
    console.log(`🛠 선택한 카테고리: ${category}`);
    navigate(`/products?category=${encodeURIComponent(category)}`); // ✅ 카테고리 선택 시 이동
  };

  const getCategoryImageUrl = (categoryName) => {
    const imageName = categoryImageMap[categoryName] || encodeURIComponent(categoryName);
    return `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/category-images/${imageName}.png`;
  };

  return (
    <div className="w-full mt-4 px-4 md:px-[160px] lg:px-[200px]">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleSelectCategory(category)}
            className="border p-4 rounded-xl shadow flex flex-col justify-between w-full aspect-square bg-white"
          >
            <h3 className="mb-2 text-lg md:text-2xl lg:text-3xl font-semibold text-start text-gray-950">{category}</h3>
            <img
              src={getCategoryImageUrl(category)}
              alt={category}
              className="w-full object-contain"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
