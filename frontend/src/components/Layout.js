import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = ({ user, setUser }) => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* 고정된 사이드바 */}
      <Sidebar user={user} setUser={setUser} />

      {/* 동적으로 바뀌는 메인 영역 */}
      <main style={{ flexGrow: 1, padding: "20px", overflowY: "auto", marginLeft: "300px" }}>
        <Outlet />  {/* 여기서 현재 선택된 컴포넌트가 렌더링됨 */}
      </main>
    </div>
  );
};

export default Layout;