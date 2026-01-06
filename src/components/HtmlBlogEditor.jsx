// src/components/HtmlBlogEditor.jsx
"use client";

export default function HtmlBlogEditor({ value, onChange }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
      {/* Code Editor Side */}
      <div className="flex flex-col h-full border rounded-2xl overflow-hidden shadow-sm bg-slate-900">
        <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">HTML Source</span>
        </div>
        <textarea
          className="flex-1 p-6 bg-transparent text-blue-300 font-mono text-sm outline-none resize-none leading-relaxed"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="<div class='bg-blue-500 p-10'>...</div>"
        />
      </div>

      {/* Live Preview Side */}
      <div className="flex flex-col h-full border rounded-2xl overflow-hidden shadow-sm bg-white">
        <div className="bg-slate-50 px-4 py-2 border-b flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Output</span>
        </div>
        <div className="flex-1 p-6 overflow-auto bg-slate-50/50">
          {/* Renders the raw HTML code directly */}
          <div dangerouslySetInnerHTML={{ __html: value }} />
        </div>
      </div>
    </div>
  );
}