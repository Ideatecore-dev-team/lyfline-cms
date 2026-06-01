import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiLogOut, FiUser } from "react-icons/fi";
import { mockApi, type User } from "../shared/api/mockApi";

function CmsNavbar() {
  const [currentUser] = useState<User | null>(() => mockApi.getCurrentUser());
  const navigate = useNavigate();

  const handleLogout = async () => {
    await mockApi.logout();
    navigate("/cms");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-neutral-light shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Brand logo */}
        <div className="flex items-center gap-3">
          <Link to="/cms/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-primary">
              Lyfline<span className="text-accent">CMS</span>
            </span>
          </Link>
        </div>

        {/* User profile & action */}
        <div className="flex items-center gap-4">
          {currentUser && (
            <div className="flex items-center gap-3 text-right">
              <div className="hidden sm:block">
                <h4 className="text-sm font-semibold text-neutral-dark">{currentUser.name}</h4>
                <p className="text-xs text-neutral-muted capitalize">{currentUser.role}</p>
              </div>
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                <FiUser className="w-4 h-4" />
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            title="Sign out"
            className="flex items-center justify-center w-9 h-9 text-neutral-muted rounded-lg hover:text-accent hover:bg-accent/10 transition-all border border-transparent hover:border-accent/20"
          >
            <FiLogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default CmsNavbar;
