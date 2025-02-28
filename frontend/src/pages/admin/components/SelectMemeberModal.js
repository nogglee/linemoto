import React, { useState, useEffect } from "react";
import { fetchMembers } from "../../../api/members";
import { getChoseong } from "es-hangul";
import SearchBar from "../../common/components/SearchBar";

const SelectMemberModal = ({ isOpen, onClose, onSelect }) => {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      const loadMembers = async () => {
        try {
          const memberList = await fetchMembers();
          console.log("Fetched members:", memberList);
          setMembers(memberList);
        } catch (error) {
          console.error("Failed to load members:", error);
          setMembers([]);
        }
      };
      loadMembers();
    }
  }, [isOpen]);

  const filteredMembers = members.filter((member) => {
    if (!searchTerm) return true;

    const nameChoseong = getChoseong(member.name); // 초성 변환

    return nameChoseong.includes(getChoseong(searchTerm)); // 🔥 초성 검색만 적용
  });

  const handleClose = () => {
    setSearchTerm("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-[500px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">회원 선택</h2>
          <button className="text-red-500" onClick={handleClose}>
            닫기
          </button>
        </div>

        <div className="mb-4">
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            placeholder="회원명으로 검색해 보세요"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">회원명</th>
                <th className="border p-2 text-left">전화번호</th>
                <th className="border p-2 text-center">선택</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center p-4 text-gray-400">
                    회원이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-100">
                    <td className="border p-2">{member.name}</td>
                    <td className="border p-2">{member.phone_number || "없음"}</td>
                    <td className="border p-2 text-center">
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                        onClick={() => {
                          onSelect(member);
                          handleClose();
                        }}
                      >
                        선택
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SelectMemberModal;