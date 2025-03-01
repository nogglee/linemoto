import React from "react";

const SalesLog = ({ sales }) => {
  // UTC → KST 변환 함수
  const convertToKST = (utcDate) => {
    if (!utcDate) return "시간 정보 없음";
    return new Date(utcDate).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  };

  return (
    <div className="font-body">
      <div className="py-2.5 items-center">
        
        {
          sales.map((sale) => {
            // DB에서 문자열로 전달되는 경우를 대비하여 숫자로 변환
            const adjustment = sale.adjustment ? parseFloat(sale.adjustment) : 0;
            const adjustmentReason = sale.adjustment_reason ? sale.adjustment_reason.trim() : "";
            const discountValue = sale.discount ? parseFloat(sale.discount) : 0;
            const earnedPoints = sale.earned_points ? parseFloat(sale.earned_points) : 0;
            
            return (
              <div key={sale.id} className="bg-white p-4 rounded-lg shadow mb-4">
                <h3 className="text-lg font-semibold">{sale.customer_name}님의 결제</h3>
                <p className="text-sm text-gray-500">{convertToKST(sale.created_at)}</p>
                <ul className="mt-2">
                  {sale.items.map((item) => (
                    <li key={item.product_id} className="flex justify-between">
                      <span>{item.name} x {item.quantity}</span>
                      <span>{((item.price ?? 0) * (item.quantity ?? 1)).toLocaleString()}원</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3">
                  <p>
                    총 결제 금액:{" "}
                    <span className="font-bold">
                      {Math.floor(sale.final_amount ?? 0).toLocaleString()}원
                    </span>
                  </p>
                  {/* 항상 사용 포인트 출력 */}
                  <p>
                    사용 포인트:{" "}
                    <span className="text-red-500">
                      {Math.floor(discountValue).toLocaleString()}p
                    </span>
                  </p>
                  <p>
                    적립 포인트:{" "}
                    <span className="text-green-500">
                      {Math.floor(earnedPoints).toLocaleString()}p
                    </span>
                  </p>
                  <p>
                    결제 수단:{" "}
                    <span className="text-gray-600">
                      {sale.payment_method || "정보 없음"}
                    </span>
                  </p>
                  <p className="text-gray-500 text-sm">
                    {convertToKST(sale.created_at)}
                  </p>
                  <p>
                    관리자:{" "}
                    <span className="text-gray-700 font-semibold">
                      {sale.admin_name || "없음"}
                    </span>
                  </p>
                  {/* 조정 금액 및 조정 사유는, 값이 0이어도 조정 사유가 있으면 출력 */}
                  {(adjustment !== 0 || adjustmentReason) && (
                    <div className="mt-3 p-3 border rounded-lg bg-gray-100">
                      {adjustment > 0 ? (
                        <span className="font-bold text-green-600">
                          🔺 추가 금액: {Math.floor(adjustment).toLocaleString()}원
                        </span>
                      ) : adjustment < 0 ? (
                        <span className="font-bold text-red-600">
                          🔻 할인 금액: {Math.floor(Math.abs(adjustment)).toLocaleString()}원
                        </span>
                      ) : (
                        // adjustment === 0 && adjustmentReason exists
                        <span className="font-bold text-gray-600">
                          조정 금액: 0원
                        </span>
                      )}
                      {adjustmentReason && (
                        <p className="text-gray-600 text-sm mt-1">
                          사유: {adjustmentReason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
};

export default SalesLog;