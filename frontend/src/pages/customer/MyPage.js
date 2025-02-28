import React, { useEffect, useState } from "react";
import { fetchMyPageData  } from "../../api/members";
import { useNavigate } from "react-router-dom";

const MyPage = ({ user }) => {
  const [transactions, setTransactions] = useState([]);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // ✅ 회원 정보 및 결제 내역 불러오기
    const loadMyPageData = async () => {
      setLoading(true);
      const data = await fetchMyPageData(user.id);
      if (data) {
        setMember(data.member);
        setTransactions(data.transactions);
      }
      setLoading(false);
    };

    loadMyPageData();
  }, [user, navigate]);

  const convertToKST = (utcDate) => {
    if (!utcDate) return "시간 정보 없음"; // 값이 없으면 기본값 처리
    return new Date(utcDate).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  };

  return (
    <div className="p-6 px-4 md:px-[160px] lg:px-[200px]">
      {/* 🔹 회원 정보 */}
      {loading ? (
        <p>로딩 중...</p>
      ) : !member ? (
        <p className="text-red-500">회원 정보를 불러올 수 없습니다.</p>
      ) : (
        <>
          <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-bold">현재 보유 포인트</h2>
            <p className="text-2xl font-bold text-blue-500">{(member.points ?? 0).toLocaleString()}p</p>
          </div>

          {/* 🔹 거래 내역 */}
          {transactions.length === 0 ? (
            <p className="text-gray-500">거래 내역이 없습니다.</p>
          ) : (
            transactions.map((txn) => {
              const adjustment = txn.adjustment ? parseFloat(txn.adjustment) : 0;
              const adjustmentReason = txn.adjustment_reason ?? ""; // 🚀 조정 사유 기본값

              return(
                <div key={txn.id} className="p-4 bg-white rounded-lg shadow">
                  <h3 className="text-lg font-semibold">구매한 상품</h3>
                  <ul>
                    {txn.items.map((item) => (
                      <li key={item.product_id} className="flex justify-between">
                        <span>{item.name} x {item.quantity}</span>
                        <span>{((item.price ?? 0) * (item.quantity ?? 1)).toLocaleString()}원</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3">
                    <p>총 결제 금액: <span className="font-bold">{Math.floor((txn.final_amount ?? 0)).toLocaleString()}원</span></p>
                    <p>사용 포인트: <span className="text-red-500">{Math.floor((txn.discount ?? 0)).toLocaleString()}p</span></p>
                    <p>적립 포인트: <span className="text-green-500">{Math.floor((txn.earned_points ?? 0)).toLocaleString()}p</span></p>
                    <p>결제 수단: <span className="text-gray-600">{txn.payment_method || "정보 없음"}</span></p>
                    <p className="text-gray-500 text-sm">{convertToKST(txn.created_at)}</p>
                    
                    {/* ✅ 조정 금액 & 사유 (조정 금액이 0이 아닐 때만 출력) */}
                    {adjustment !== 0 && (
                      <div className="mt-3 p-3 border rounded-lg bg-gray-100">
                        <span className={`font-bold ${adjustment > 0 ? "text-green-600" : "text-red-600"}`}>
                          {adjustment > 0 ? "🔺 추가 금액" : "🔻 할인 금액"}:{" "}
                          {Math.floor(adjustment).toLocaleString()}원
                        </span>
                        {/* {adjustmentReason && (
                          <p className="text-gray-600 text-sm mt-1">사유: {adjustmentReason}</p>
                        )}
                        <p>관리자: <span className="text-gray-700">{txn.admin_name || "없음"}</span></p> */}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </>
      )}
    </div>
  );
};

export default MyPage;