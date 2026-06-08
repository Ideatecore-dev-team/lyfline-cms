import { Navigate, Outlet } from "react-router-dom";

const CmsLoginRoute = () => {
  const token = localStorage.getItem("lyfline_token");
  const userStr = localStorage.getItem("lyfline_current_user");
  const user = userStr ? JSON.parse(userStr) : null;

  if (token) {
    if (user && user.role !== "super_admin") {
      return <Navigate to="/cms/promo" replace />;
    }
    return <Navigate to="/cms/users" replace />;
  }

  return <Outlet />;
};

export default CmsLoginRoute;
