import React, { useState } from "react";
import POS from "./POS";
import ProductManagement from "./ProductManagement";
import SalesManagement from "./SalesManagement";
import CustomerManagement from "./CustomerManagement";

const AdminDashboard = () => {
  const [activeMenu, setActiveMenu] = useState("POS"); // 기본값을 POS로 설정

  const renderContent = () => {
    switch (activeMenu) {
      case "POS":
        return <POS />;
      case "상품관리":
        return <ProductManagement />;
      case "매출관리":
        return <SalesManagement />;
      case "고객관리":
        return <CustomerManagement />;
      default:
        return <POS />;
    }
  };

  return (
    <div className="dashboard-container">
      
      <div className="main-content">
        {renderContent()} {/* 선택된 메뉴에 따라 렌더링 */}
      </div>
    </div>
  );
};

export default AdminDashboard;