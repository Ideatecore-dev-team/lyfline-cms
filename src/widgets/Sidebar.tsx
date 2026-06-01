import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiGrid, FiFileText, FiUsers } from "react-icons/fi";
import { mockApi, type User } from "../shared/api/mockApi";

function Sidebar() {
  const [currentUser] = useState<User | null>(() => mockApi.getCurrentUser());

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      to: "/cms/dashboard",
      icon: <FiGrid className="w-5 h-5" />,
      allowedRoles: ["admin", "editor"],
    },
    {
      id: "article",
      label: "Article Management",
      to: "/cms/article",
      icon: <FiFileText className="w-5 h-5" />,
      allowedRoles: ["admin", "editor"],
    },
    {
      id: "users",
      label: "User Management",
      to: "/cms/users",
      icon: <FiUsers className="w-5 h-5" />,
      allowedRoles: ["admin"], // Admin-only option
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-neutral-light min-h-[calc(100vh-4rem)] shrink-0">
      <div className="p-4 flex flex-col gap-1">
        {menuItems.map((menu) => {
          // Check role restrictions
          if (currentUser && !menu.allowedRoles.includes(currentUser.role)) {
            return null;
          }

          return (
            <NavLink
              key={menu.id}
              to={menu.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-neutral-muted hover:bg-neutral-light/50 hover:text-neutral-dark"
                }`
              }
            >
              {menu.icon}
              <span>{menu.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}

export default Sidebar;
