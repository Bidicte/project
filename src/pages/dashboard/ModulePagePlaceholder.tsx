// src/pages/dashboard/ModulePagePlaceholder.tsx
type ModulePagePlaceholderProps = {
  name: string;
};

export default function ModulePagePlaceholder({ name }: ModulePagePlaceholderProps) {
  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-2">{name} Module</h2>
      <p className="text-gray-600">Ceci est une page placeholder pour le module {name}.</p>
    </div>
  );
}
