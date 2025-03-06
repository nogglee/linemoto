import React, { useState, useEffect } from "react";
import { getCategories } from "../../api/products";
import { useNavigate } from "react-router-dom";

const categoryImageMap = {
  "엔진오일": "/images/OIL.png",
  "거치대/케이스": "/images/CRADLE.png",
  "ETC": "/images/ETC.png",
  "ADV350": "/images/ADV350.png",
  "FORZA": "/images/FORZA.png",
  "X-MAX": "/images/X-MAX.png",
  "PCX": "/images/PCX.png",
  "N-MAX": "/images/N-MAX.png",
};

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesData = await getCategories();
      const categories = categoriesData.map(item => item.category);
      setCategories(categories);
    };
    
    fetchCategories();
  }, []);

  const handleSelectCategory = (category) => {
    navigate(`/products?category=${encodeURIComponent(category)}`);
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
            <h3 className="mb-3 text-lg md:text-lg lg:text-2xl font-semibold text-start text-gray-950">{category}</h3>
            <img
              src={categoryImageMap[category]}
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
