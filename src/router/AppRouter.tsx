// src/router/AppRouter.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import ModulePagePlaceholder from '../pages/dashboard/ModulePagePlaceholder';

const router = createBrowserRouter([
  { path: '/', element: <LoginPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/users', element: <ModulePagePlaceholder name="Users" /> },
  { path: '/billing', element: <ModulePagePlaceholder name="Billing" /> },
  { path: '/reporting', element: <ModulePagePlaceholder name="Reports" /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
