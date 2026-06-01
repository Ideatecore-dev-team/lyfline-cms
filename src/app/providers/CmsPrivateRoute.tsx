import { Navigate, Outlet } from "react-router-dom";

const CmsPrivateRoute = () => {
  const token = localStorage.getItem("lyfline_token");
  return token ? <Outlet /> : <Navigate to="/cms" replace />;
};

export default CmsPrivateRoute;
