import React from "react";

const MyPage = () => {
  return (
    <div className="container mx-auto mt-20">
      <h1 className="text-2xl font-bold">마이페이지</h1>
      <p>여기에 포인트, 구매내역 등을 표시할 예정입니다.</p>
      <ul>
        <li>📌 실시간 재고/단가 조회</li>
        <li>📌 포인트 조회</li>
        <li>📌 날짜별 정비내역 조회</li>
        <li>📌 지출내역 통계</li>
      </ul>
    </div>
  );
};

export default MyPage;