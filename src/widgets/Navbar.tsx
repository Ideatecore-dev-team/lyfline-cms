import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { authApi, type User } from "../shared/api/auth";
import Sidebar from "./Sidebar";

function CmsNavbar() {
  const [currentUser] = useState<User | null>(() => authApi.getCurrentUser());
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await authApi.logout();
    navigate("/cms", { state: { successMessage: "Successfully logged out!" } });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200">
      <div className="w-full px-4 md:px-12 py-3 bg-white flex justify-between items-center h-20">
        <div className="flex items-center gap-4">
          {/* Hamburger button for mobile */}
          <button
            onClick={() => setShowMobileMenu(true)}
            className="lg:hidden p-2 text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <span
              style={{
                maskImage: 'url("/icons/Menu Hamburger.svg")',
                WebkitMaskImage: 'url("/icons/Menu Hamburger.svg")',
              }}
              className="size-6 bg-current block"
            />
          </button>

          {/* Brand Logo Link */}
          <Link to="/cms/users" className="w-32 md:w-40 h-12 relative overflow-hidden flex items-center">
            <img
              className="w-32 md:w-40 h-12 object-contain"
              src="/Lyfline-Logo.png"
              alt="Lyfline Logo"
            />
          </Link>
        </div>

        {/* Navigation Actions */}
        <div className="flex justify-start items-center gap-4 md:gap-6">
          {/* User Profile Info */}
          <div className="hidden lg:flex justify-start items-center gap-4">
            <div className="flex flex-col justify-start items-end text-right">
              <div className="text-primary text-sm font-medium font-sans">
                {currentUser?.name || "Username"}
              </div>
              <div className="text-black text-xs font-medium font-sans capitalize tracking-wider">
                {currentUser?.role === "super_admin"
                  ? "Super Admin"
                  : currentUser?.role === "admin"
                    ? "Admin"
                    : currentUser?.role || "Admin"}
              </div>
            </div>
            {/* User Avatar Circle */}
            <div className="w-14 h-14 bg-primary-light border-primary border rounded-full flex items-center justify-center shrink-0">
              <span
                style={{
                  maskImage: 'url("/icons/Profile Octagon 2.svg")',
                  WebkitMaskImage: 'url("/icons/Profile Octagon 2.svg")',
                }}
                className="size-8 bg-primary mask-contain mask-no-repeat mask-center"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Logout Action Button */}
          <button
            onClick={handleLogout}
            className="h-12 px-5 py-3 bg-accent hover:bg-accent-hover text-white rounded-[48px] flex justify-center items-center gap-2 font-medium font-sans cursor-pointer active:scale-98 transition-all shrink-0"
          >
            <span
              style={{
                maskImage: 'url("/icons/Logout.svg")',
                WebkitMaskImage: 'url("/icons/Logout.svg")',
              }}
              className="size-5 bg-white mask-contain mask-no-repeat mask-center shrink-0"
              aria-hidden="true"
            />
            <span className="leading-none text-base">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Drawer Content */}
          <div className="relative flex w-full max-w-xs flex-col bg-white p-6 shadow-2xl transition-transform duration-300">
            {/* Close Button Header */}
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <span className="text-primary text-lg font-semibold font-sans">CMS Menu</span>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <span
                  style={{
                    maskImage: 'url("/icons/Close.svg")',
                    WebkitMaskImage: 'url("/icons/Close.svg")',
                  }}
                  className="size-6 bg-current block"
                />
              </button>
            </div>

            {/* Sidebar content */}
            <div className="flex-1 overflow-y-auto mb-6">
              <Sidebar minimal />
            </div>

            {/* User Profile Info at the bottom of the sidebar drawer on mobile */}
            {currentUser && (
              <div className="border-t border-slate-100 pt-4 flex justify-start items-center gap-3">
                {/* User Avatar Circle */}
                <div className="w-12 h-12 bg-primary-light border-primary border rounded-full flex items-center justify-center shrink-0">
                  <span
                    style={{
                      maskImage: 'url("/icons/Profile Octagon 2.svg")',
                      WebkitMaskImage: 'url("/icons/Profile Octagon 2.svg")',
                    }}
                    className="size-6 bg-primary mask-contain mask-no-repeat mask-center"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex flex-col justify-start items-start text-left">
                  <div className="text-primary text-sm font-medium font-sans">
                    {currentUser.name}
                  </div>
                  <div className="text-black text-xs font-medium font-sans capitalize tracking-wider">
                    {currentUser.role === "super_admin"
                      ? "Super Admin"
                      : currentUser.role === "admin"
                        ? "Admin"
                        : currentUser.role || "Admin"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default CmsNavbar;
