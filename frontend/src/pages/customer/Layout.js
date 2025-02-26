import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import Header from "../common/Header"; // 고정 헤더 추가

const CustomerLayout = ({ user }) => {
  if (!user || user.role !== "customer") {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden ">
      <div className="">
        <Outlet /> {/* ✅ 사용자 하위 페이지 렌더링 */}
      </div>
    </div>
  );
};

export default CustomerLayout;