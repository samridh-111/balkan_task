import { createBrowserRouter, Navigate } from "react-router-dom";

// Components (will be created)
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import FileManagerPage from "@/pages/FileManagerPage";
import FileUploadPage from "@/pages/FileUploadPage";
import FileDetailsPage from "@/pages/FileDetailsPage";
import AdminPage from "@/pages/AdminPage";
import ProfilePage from "@/pages/ProfilePage";
import PreferencesPage from "@/pages/PreferencesPage";
import StoragePage from "@/pages/StoragePage";
import AppLayout from "@/components/layout/AppLayout";
import AuthGuard from "@/components/auth/AuthGuard";
import AdminGuard from "@/components/auth/AdminGuard";

// Routes configuration
export const router = createBrowserRouter([
  // Public routes (no layout)
  {
    path: "/login",
    element: <LoginPage />,
  },

  // Protected routes (wrapped in AppLayout)
  {
    path: "/",
    element: (
      <AuthGuard>
        <AppLayout title="Dashboard">
          <DashboardPage />
        </AppLayout>
      </AuthGuard>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <AuthGuard>
        <AppLayout title="Dashboard">
          <DashboardPage />
        </AppLayout>
      </AuthGuard>
    ),
  },
  {
    path: "/files",
    element: (
      <AuthGuard>
        <AppLayout title="File Manager">
          <FileManagerPage />
        </AppLayout>
      </AuthGuard>
    ),
  },
  {
    path: "/files/upload",
    element: (
      <AuthGuard>
        <AppLayout title="Upload Files">
          <FileUploadPage />
        </AppLayout>
      </AuthGuard>
    ),
  },
  {
    path: "/files/:id",
    element: (
      <AuthGuard>
        <AppLayout title="File Details">
          <FileDetailsPage />
        </AppLayout>
      </AuthGuard>
    ),
  },
  {
    path: "/profile",
    element: (
      <AuthGuard>
        <AppLayout title="Profile Settings">
          <ProfilePage />
        </AppLayout>
      </AuthGuard>
    ),
  },
  {
    path: "/preferences",
    element: (
      <AuthGuard>
        <AppLayout title="Preferences">
          <PreferencesPage />
        </AppLayout>
      </AuthGuard>
    ),
  },
  {
    path: "/storage",
    element: (
      <AuthGuard>
        <AppLayout title="Storage Management">
          <StoragePage />
        </AppLayout>
      </AuthGuard>
    ),
  },
  {
    path: "/admin",
    element: (
      <AdminGuard>
        <AppLayout title="Admin Panel">
          <AdminPage />
        </AppLayout>
      </AdminGuard>
    ),
  },

  // Catch-all route for unauthorized access - redirect to login
  {
    path: "/unauthorized",
    element: <Navigate to="/login" replace />,
  },

  // Redirect unknown routes to dashboard
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default router;
