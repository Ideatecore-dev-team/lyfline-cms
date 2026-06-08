import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi, type User } from "../shared/api/auth";

function CmsNavbar() {
  const [currentUser] = useState<User | null>(() => authApi.getCurrentUser());
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authApi.logout();
    navigate("/cms");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200">
      <div className="w-full px-12 py-3 bg-white flex justify-between items-center h-20">
        {/* Brand Logo Link */}
        <Link to="/cms/users" className="w-40 h-12 relative overflow-hidden flex items-center">
          <img
            className="w-40 h-12 object-contain"
            src="/Lyfline-Logo.png"
            alt="Lyfline Logo"
          />
        </Link>

        {/* Navigation Actions */}
        <div className="flex justify-start items-center gap-6">
          {/* User Profile Info */}
          <div className="flex justify-start items-center gap-4">
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
    </header>
  );
}

export default CmsNavbar;
