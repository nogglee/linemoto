import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../common/Sidebar";

const AdminLayout = ({ user, setUser, stock, setStock }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={user} setUser={setUser}/>
      <div className="flex-1 p-6  h-full overflow-auto">
        <Outlet context={{ user, setUser, stock, setStock }} />
      </div>
    </div>
  );
};

export default AdminLayout;