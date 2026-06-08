import { useState } from "react";
import { NavLink } from "react-router-dom";
import { authApi, type User } from "../shared/api/auth";

interface SidebarProps {
  minimal?: boolean;
}

function Sidebar({ minimal = false }: SidebarProps) {
  const [currentUser] = useState<User | null>(() => authApi.getCurrentUser());

  const menuItems = [
    {
      id: "users",
      label: "Manage User",
      to: "/cms/users",
      icon: "Profile Add 2",
      allowedRoles: ["super_admin"],
    },
    {
      id: "promo",
      label: "Manage Promo",
      to: "/cms/promo",
      icon: "Ticket Discount",
      allowedRoles: ["super_admin", "admin"],
    },
    {
      id: "partners",
      label: "Manage Partners",
      to: "/cms/partners",
      icon: "Group 1",
      allowedRoles: ["super_admin", "admin"],
    },
    {
      id: "doctors",
      label: "Manage Doctors",
      to: "/cms/doctors",
      icon: "Stethoscope",
      allowedRoles: ["super_admin", "admin"],
    },
    {
      id: "articles",
      label: "Manage Articles",
      to: "/cms/article",
      icon: "Pen",
      allowedRoles: ["super_admin", "admin"],
    },
  ];

  const menuContent = (
    <div className="w-full lg:w-72 p-0 lg:p-6 bg-transparent lg:bg-white rounded-none lg:rounded-[32px] flex flex-col justify-start items-stretch gap-4 shadow-none lg:shadow-[0px_2px_2px_0px_rgba(0,0,0,0.05)] border-0 lg:border border-slate-100/50 shrink-0 lg:sticky lg:top-6">
      <div className="self-stretch justify-start text-[#95B0D7] text-sm tracking-wider font-sans uppercase">
        MENU BAR
      </div>

      <div className="flex flex-col gap-2">
        {menuItems.map((menu) => {
          // Check role restrictions
          if (currentUser && !menu.allowedRoles.includes(currentUser.role)) {
            return null;
          }

          return (
            <NavLink
              key={menu.id}
              to={menu.to}
              className={({ isActive }: { isActive: boolean }) =>
                `self-stretch h-12 px-4 py-3 rounded-[48px] inline-flex justify-start items-center gap-2.5 text-base font-medium font-sans cursor-pointer active:scale-98 transition-all ${isActive
                  ? "bg-linear-to-r from-primary to-primary-hover text-white"
                  : "bg-transparent text-primary hover:bg-primary/10"
                }`
              }
            >
              {({ isActive }: { isActive: boolean }) => (
                <>
                  <span
                    style={{
                      maskImage: `url("/icons/${menu.icon}.svg")`,
                      WebkitMaskImage: `url("/icons/${menu.icon}.svg")`,
                    }}
                    className={`size-6 mask-contain mask-no-repeat mask-center shrink-0 transition-colors ${isActive ? "bg-white" : "bg-primary"
                      }`}
                    aria-hidden="true"
                  />
                  <span>{menu.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );

  if (minimal) {
    return menuContent;
  }

  return (
    <aside className="hidden lg:flex w-80 p-6 bg-primary-light shrink-0 border-r border-slate-200 flex-col items-center">
      {menuContent}
    </aside>
  );
}

export default Sidebar;
