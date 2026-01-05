// src/components/ui/SectionHeader.jsx
export default function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
      {subtitle && <p className="text-slate-500 mt-2 text-lg">{subtitle}</p>}
      <div className="h-1 w-20 bg-blue-600 mt-4 rounded-full" />
    </div>
  );
}