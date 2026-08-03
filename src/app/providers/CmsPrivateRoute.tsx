import { Navigate, Outlet } from "react-router-dom";
import { authApi } from "../../shared/api/auth";

const CmsPrivateRoute = () => {
  const isValid = authApi.checkSession();
  return isValid ? <Outlet /> : <Navigate to="/cms" replace />;
};

export default CmsPrivateRoute;
