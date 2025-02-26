import React from "react";
import { ReactComponent as SearchIcon } from "../../../assets/icons/ico-search.svg";

const SearchBar = ({ searchTerm, setSearchTerm, placeholder = "검색어를 입력하세요" }) => {
  return (
    <div className="bg-gray-100 rounded-[10px] px-5 py-2.5 gap-3 flex text-gray-400 text-base items-center">
      <SearchIcon />
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="ml-2 border-none bg-transparent mt-0.5 rounded focus:outline-none text-gray-950 w-full"
      />
    </div>
  );
};

export default SearchBar;