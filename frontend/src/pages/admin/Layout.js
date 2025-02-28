import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../common/Sidebar";

const AdminLayout = ({ user, setUser }) => {
  return (
    <div className="flex h-screen">
      <Sidebar user={user} setUser={setUser} /> {/* ✅ setUser 전달 */}
      <div className="flex-1 p-6  h-full">
        <Outlet context={{ user, setUser }} /> {/* ✅ Nested Routes 적용 */}
      </div>
    </div>
  );
};

export default AdminLayout;