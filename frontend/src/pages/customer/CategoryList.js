import React, { useState, useEffect } from "react";
import { getCategories } from "../../api/products";
import { useNavigate } from "react-router-dom";

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
              src={`${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/category-images/${encodeURIComponent(category)}.png`}
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
// import React, { useState, useEffect } from "react";
// import { getProducts } from "../../api/products";
// import { ReactComponent as SearchIcon } from "../../assets/icons/ico-search.svg"

// const ProductList = () => {
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");

//   useEffect(() => {
//     const fetchData = async () => {
//       const data = await getProducts();
//       setProducts(data);
//       // 중복 없는 카테고리 목록 추출
//       const uniqueCategories = [...new Set(data.map((product) => product.category))];
//       setCategories(uniqueCategories);
//     };
//     fetchData();
//   }, []);

//   const handleCategorySelect = (category) => {
//     setSelectedCategory(category);
//     setSearchTerm(""); // 카테고리 선택 시 검색어 초기화
//   };

//   const getCategoryImage = (category) => {
//     const formattedCategory = encodeURIComponent(category); // URL 인코딩 처리
//     return `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/category-images/${formattedCategory}.png`;
//   };

//   const filteredProducts = products
//     .filter((product) => !selectedCategory || product.category === selectedCategory)
//     .filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()));

//   return (
//     <div className="container mx-auto mt-4 px-4">
//       {/* 🔹 초기 화면: 카테고리 선택 */}
//       {!selectedCategory ? (
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//           {categories.map((category) => (
//             <button
//               key={category}
//               className="border p-4 rounded-xl shadow flex flex-col items-start justify-between w-full aspect-square bg-white"
//               onClick={() => handleCategorySelect(category)}
//             >
//               <h3 className="text-lg font-700">{category}</h3>
//               <img
//                 src={getCategoryImage(category)}
//                 onError={(e) => (e.target.src = "/default-category.png")} // 이미지 없을 경우 기본 이미지 표시
//                 alt={category}
//                 className="w-full object-contain"
//               />
//             </button>
//           ))}
//         </div>
//       ) : (
//         <>
//           {/* 🔹 카테고리 선택 후: 검색창 & 상품 목록 */}
//           <div className="flex items-center justify-between mb-4">
//             {/* <button
//               onClick={() => setSelectedCategory(null)}
//               className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
//             >
//               ← 카테고리 선택으로 돌아가기
//             </button> */}
//             <div className="bg-gray-100 rounded-[10px] px-5 py-2.5 gap-3 flex text-gray-400 text-base items-center">
//               <SearchIcon />
//               <input
//                 type="text"
//                 placeholder="상품명으로 검색해 보세요"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="ml-2 border-none bg-transparent mt-0.5 rounded focus:outline-none text-gray-950 w-full"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] md:grid-cols-4 lg:grid-cols-8 gap-4 w-full mt-4 mb-10">
//             {filteredProducts.map((product) => (
//               <div key={product.id} className="w-full">
//                 <img src={product.image_url} alt={product.name} className="w-full h-auto aspect-square shadow-sm rounded-lg object-cover" />
//                 <h3 className="mt-2 text-sm font-semilight text-gray-950">{product.name}</h3>
//                 <p className="text-base font-bold text-gray-950">{product.price.toLocaleString()}원</p>
//               </div>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default ProductList;


// src/pages/customer/CategoryList.js