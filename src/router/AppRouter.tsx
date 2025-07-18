// src/router/AppRouter.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { Layout } from '../components/Layout/Layout';
import DashboardPage from '../pages/dashboard/DashboardPage';
import ModulePagePlaceholder from '../pages/dashboard/ModulePagePlaceholder';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: '/hebergement', element: <ModulePagePlaceholder name="hebergement" /> },
      { path: '/billing', element: <ModulePagePlaceholder name="Billing" /> },
      { path: '/reporting', element: <ModulePagePlaceholder name="Reports" /> },
    ],
  },
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-8">Page non trouvée</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    ),
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
