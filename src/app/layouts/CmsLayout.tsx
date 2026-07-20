import { Outlet, useLocation } from "react-router-dom";
import CmsNavbar from "../../widgets/Navbar";
import Sidebar from "../../widgets/Sidebar";

const CmsLayout = () => {
  const location = useLocation();
  const hasInternalSidebar =
    ["/cms/users", "/cms/promo", "/cms/partners", "/cms/doctors", "/cms/article", "/cms/media"].includes(location.pathname) ||
    location.pathname.startsWith("/cms/partners/") ||
    location.pathname.startsWith("/cms/doctors/") ||
    location.pathname.startsWith("/cms/article/") ||
    location.pathname.startsWith("/cms/media");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <CmsNavbar />

      {/* Main Container */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        {!hasInternalSidebar && <Sidebar />}

        {/* Scrollable Page Content Area */}
        <main className="flex-1 bg-background p-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CmsLayout;
