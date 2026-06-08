import { Navigate, Outlet } from "react-router-dom";

const CmsLoginRoute = () => {
  const token = localStorage.getItem("lyfline_token");
  return token ? <Navigate to="/cms/users" replace /> : <Outlet />;
};

export default CmsLoginRoute;
