// src/components/PreviewStyleSelector.jsx
"use client";

export default function PreviewStyleSelector({
  label = "Preview Style",
  options = [],
  value,
  onChange,
}) {
  if (!options.length) return null;

  return (
    <div className="rounded-xl border border-slate-700/70 bg-slate-900/50 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {label}
        </span>
        <span className="text-[10px] text-slate-500">iframe CSS</span>
      </div>
      <div className="grid gap-2">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-lg border px-3 py-2 text-left transition ${
                active
                  ? "border-blue-500 bg-blue-500/15 text-white"
                  : "border-slate-700 bg-slate-950/60 text-slate-300 hover:border-slate-500 hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold">{option.label}</span>
                {active && (
                  <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-200">
                    Selected
                  </span>
                )}
              </div>
              {option.fileName && (
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  {option.fileName}
                </p>
              )}
              {option.description && (
                <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                  {option.description}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
