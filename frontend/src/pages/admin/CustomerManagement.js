
import React, { useEffect, useState } from "react";
import { fetchArrearMembers } from "../../api/members";

const CustomerManagement = () => {
  const [arrearMembers, setArrearMembers] = useState([]);

  useEffect(() => {
    const loadArrearMembers = async () => {
      const data = await fetchArrearMembers();
      setArrearMembers(data);
    };

    loadArrearMembers();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold mb-4">미수금 고객 리스트</h2>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">회원명</th>
            <th className="border p-2">전화번호</th>
            <th className="border p-2">미수금액</th>
          </tr>
        </thead>
        <tbody>
          {arrearMembers.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center p-4 text-gray-400">미수금 고객이 없습니다.</td>
            </tr>
          ) : (
            arrearMembers.map((member) => (
              <tr key={member.id} className="hover:bg-gray-100">
                <td className="border p-2">{member.name}</td>
                <td className="border p-2">{member.phone_number}</td>
                <td className="border p-2 text-right">{member.unpaid_amount.toLocaleString()}원</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerManagement; 