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
const PromoManagementPage = lazy(() => import("../pages/promo-management/promoManagementPage"));
const PartnersManagementPage = lazy(() => import("../pages/partners-management/partnersManagementPage"));
const ManagePartnersForm = lazy(() => import("../pages/partners-management/managePartnersForm"));
const DoctorManagementPage = lazy(() => import("../pages/doctor-management/doctorManagementPage"));
const ManageDoctorsForm = lazy(() => import("../pages/doctor-management/manageDoctorsForm"));

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
              <Route path="/cms/promo" element={<PromoManagementPage />} />
              <Route path="/cms/partners" element={<PartnersManagementPage />} />
              <Route path="/cms/partners/add" element={<ManagePartnersForm />} />
              <Route path="/cms/partners/edit/:id" element={<ManagePartnersForm />} />
              <Route path="/cms/doctors" element={<DoctorManagementPage />} />
              <Route path="/cms/doctors/add" element={<ManageDoctorsForm />} />
              <Route path="/cms/doctors/edit/:id" element={<ManageDoctorsForm />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/cms/users" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
