// src/pages/dashboard/DashboardPage.tsx
import { useNavigate } from 'react-router-dom';

const modules = [
  { name: 'hebergement', path: '/hebergement' },
  { name: 'Billing', path: '/billing' },
  { name: 'Reports', path: '/reporting' },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Choisissez un module</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modules.map((mod) => (
          <button
            key={mod.name}
            onClick={() => navigate(mod.path)}
            className="p-4 border rounded hover:bg-gray-100 text-left"
          >
            <h2 className="font-bold">{mod.name}</h2>
            <p className="text-sm text-gray-500">Accéder au module {mod.name.toLowerCase()}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
