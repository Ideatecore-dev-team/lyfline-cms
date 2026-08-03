import { Navigate, Outlet } from "react-router-dom";
import { authApi } from "../../shared/api/auth";

const CmsLoginRoute = () => {
  const isValid = authApi.checkSession();
  const userStr = localStorage.getItem("lyfline_current_user");
  const user = userStr ? JSON.parse(userStr) : null;

  if (isValid) {
    if (user && user.role !== "super_admin") {
      return <Navigate to="/cms/promo" replace />;
    }
    return <Navigate to="/cms/users" replace />;
  }

  return <Outlet />;
};

export default CmsLoginRoute;
