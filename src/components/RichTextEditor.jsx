"use client";
import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export default function RichTextEditor({ value, onChange, placeholder }) {
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef(null); // This was missing!

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/upload-image/', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      // Injects the image where the user left off
      const imageMarkdown = `\n![${file.name}](${data.url})\n`;
      onChange(value + imageMarkdown);
    } catch (err) {
      alert("Upload failed. Is the Django server running?");
    }
  };

  if (!isMounted) return <div className="h-64 bg-slate-50 animate-pulse rounded-2xl" />;

  return (
    <div className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white" data-color-mode="light">
      {/* Refined Toolbar */}
      <div className="bg-slate-50/50 border-b border-slate-100 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={() => fileInputRef.current.click()} 
            className="group px-3 py-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-2 text-slate-600 border border-transparent hover:border-slate-200"
          >
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider">Add Image</span>
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
            accept="image/*"
          />
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Markdown Enabled</span>
      </div>

      {/* Editor Area */}
      <div 
        className="p-2"
        onDrop={(e) => {
          e.preventDefault();
          handleImageUpload(e);
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || '')}
          preview="edit"
          height={500}
          className="!border-none !shadow-none min-h-[500px]"
          textareaProps={{
            placeholder: placeholder || 'Type your story here...',
          }}
        />
      </div>
    </div>
  );
}