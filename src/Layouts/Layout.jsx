import { Outlet } from "react-router-dom";
import Sidebar from "../Components/Sidebar/Sidebar";
import TopBar from "../Components/Sidebar/TopBar";

function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        <div className="m-3 min-h-0 flex-1 overflow-hidden md:m-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
