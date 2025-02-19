import React, { useState } from "react";
import { FaTimes, FaChevronDown } from "react-icons/fa";

const CategorySelector = ({ categories, selectedCategory, onSelect, onAddCategory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const handleSelect = (category) => {
    onSelect(category);
    setIsOpen(false);
  };

  const handleAddCategory = (e) => {
    if (e.key === "Enter" && newCategory.trim()) {
      if (!categories.includes(newCategory)) {
        onAddCategory(newCategory);
      }
      onSelect(newCategory);
      setNewCategory("");
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-64">
      {/* 선택된 상태 */}
      <div
        className="border border-gray-300 rounded-lg px-3 py-2 flex items-center justify-between bg-white shadow-sm cursor-pointer hover:shadow-md transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap items-center gap-2">
          {selectedCategory ? (
            <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg flex items-center">
              {selectedCategory}
              <button
                className="ml-2 text-blue-600 hover:text-blue-800"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect("");
                }}
              >
                <FaTimes size={12} />
              </button>
            </div>
          ) : (
            <span className="text-gray-500">카테고리 선택</span>
          )}
        </div>
        <FaChevronDown className="text-gray-500" />
      </div>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute w-full mt-2 bg-white border border-gray-300 shadow-lg rounded-lg z-10">
          {/* 기존 카테고리 리스트 */}
          {categories.map((category, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-gray-100 transition-all cursor-pointer"
              onClick={() => handleSelect(category)}
            >
              {category}
            </div>
          ))}

          {/* 새 카테고리 추가 */}
          <div className="p-3 border-t">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={handleAddCategory}
              placeholder="새 카테고리 입력 후 엔터"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-300 outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;