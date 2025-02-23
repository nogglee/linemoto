import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import Header from "../common/Header"; // 고정 헤더 추가

const CustomerLayout = ({ user }) => {
  if (!user || user.role !== "customer") {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden ">
      <Header /> {/* ✅ 일반 사용자용 헤더 */}
      <div className="flex-1 p-6">
        <Outlet /> {/* ✅ 사용자 하위 페이지 렌더링 */}
      </div>
    </div>
  );
};

export default CustomerLayout;