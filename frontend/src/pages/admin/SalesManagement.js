import React, { useEffect, useState } from "react";
import { fetchAdminSales } from "../../api/transactions";
import { useNavigate } from "react-router-dom";
import SalesLog from "./SalesLog";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

const SalesManagement = ({ admin }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // 집계 데이터 상태
  const [salesByPayment, setSalesByPayment] = useState({});
  const [salesByDate, setSalesByDate] = useState({});
  const [topSellingProducts, setTopSellingProducts] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!admin) {
      navigate("/login");
      return;
    }

    const loadSalesData = async () => {
      setLoading(true);
      const data = await fetchAdminSales(admin.id);
      setSales(data);

      // 집계 데이터 계산
      const byPayment = {};
      const productMap = {};
      
      // 날짜별 집계: 오늘, 이번 주, 이번 달, 이번 년도 (KST 기준)
      let todaySum = 0,
          weekSum = 0,
          monthSum = 0,
          yearSum = 0;
      const now = dayjs().tz("Asia/Seoul");
      const startOfToday = now.startOf("day");
      const startOfWeek = now.startOf("week");
      const startOfMonth = now.startOf("month");
      const startOfYear = now.startOf("year");

      data.forEach((sale) => {
        // 결제수단별 집계
        const pm = sale.payment_method || "기타";
        byPayment[pm] = (byPayment[pm] || 0) + parseFloat(sale.final_amount);

        // 날짜별 집계
        const saleDate = dayjs.utc(sale.created_at).tz("Asia/Seoul");
        const finalAmt = parseFloat(sale.final_amount);
        if (saleDate.isSame(startOfToday, "day")) {
          todaySum += finalAmt;
        }
        if (saleDate.isAfter(startOfWeek)) {
          weekSum += finalAmt;
        }
        if (saleDate.isAfter(startOfMonth)) {
          monthSum += finalAmt;
        }
        if (saleDate.isAfter(startOfYear)) {
          yearSum += finalAmt;
        }

        // 판매량 높은 상품 집계 (상품명 기준)
        sale.items.forEach((item) => {
          productMap[item.name] = (productMap[item.name] || 0) + item.quantity;
        });
      });

      setSalesByPayment(byPayment);
      setSalesByDate({
        "오늘": todaySum,
        "이번 주": weekSum,
        "이번 달": monthSum,
        "이번 년도": yearSum,
      });

      const topProducts = Object.entries(productMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, quantity]) => ({ name, quantity }));
      setTopSellingProducts(topProducts);

      setLoading(false);
    };

    loadSalesData();
  }, [admin, navigate]);

  // UTC → KST 변환 함수
  const convertToKST = (utcDate) => {
    if (!utcDate) return "시간 정보 없음";
    return new Date(utcDate).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  };

  return (
    <div className="p-6">
      <div className="font-600 text-2xl">매출 관리</div>
      {loading ? (
        <p>로딩 중...</p>
      ) : (
        <div className="flex flex-col md:flex-row">
          {/* 왼쪽 컬럼: 집계 정보 */}
          <div className="md:w-2/3 md:pr-4">
            {/* 결제수단별 매출 정보 */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-2">결제수단별 매출</h2>
              {Object.entries(salesByPayment).map(([method, total]) => (
                <p key={method}>
                  {method}: {Math.floor(total).toLocaleString()}원
                </p>
              ))}
            </div>
            
            {/* 날짜별 매출 정보 */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-2">날짜별 매출</h2>
              {Object.entries(salesByDate).map(([period, total]) => (
                <p key={period}>
                  {period}: {Math.floor(total).toLocaleString()}원
                </p>
              ))}
              {/* 추후 날짜 지정 조회 기능 추가 예정 */}
            </div>
            
            {/* 판매량 높은 상품 랭킹 */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-2">판매량 높은 상품 랭킹</h2>
              {topSellingProducts.map((prod, idx) => (
                <p key={idx}>
                  {idx + 1}. {prod.name}: {prod.quantity}개
                </p>
              ))}
            </div>
          </div>

          {/* 오른쪽 컬럼: 상세 결제 내역 (SalesLog) */}
          <div className="md:w-1/3">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">상세 결제 내역</h2>
              <SalesLog sales={sales} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesManagement;