import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Route guards
import CmsPrivateRoute from "./providers/CmsPrivateRoute";
import CmsLoginRoute from "./providers/CmsLoginRoute";

// Layout
import CmsLayout from "./layouts/CmsLayout";

// Loading component
const LoadingSpinner = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-background">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Pages
const LoginPage = lazy(() => import("../pages/login/LoginPage"));
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage"));
const ArticleManagementPage = lazy(() => import("../pages/article-management/ArticleManagementPage"));
const UserManagementPage = lazy(() => import("../pages/user-management/UserManagementPage"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Main Redirect */}
          <Route path="/" element={<Navigate to="/cms" replace />} />

          {/* Login / Auth routes */}
          <Route element={<CmsLoginRoute />}>
            <Route path="/cms" element={<LoginPage />} />
          </Route>

          {/* Private CMS routes */}
          <Route element={<CmsPrivateRoute />}>
            <Route element={<CmsLayout />}>
              <Route path="/cms/dashboard" element={<DashboardPage />} />
              <Route path="/cms/article" element={<ArticleManagementPage />} />
              <Route path="/cms/users" element={<UserManagementPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/cms/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
