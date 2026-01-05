"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/RichTextEditor';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPublishing(true);

    const postData = { title, content, excerpt, is_published: true };

    try {
      const res = await fetch('http://127.0.0.1:8000/api/posts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        alert("Something went wrong!");
      }
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500">Draft in Personal Blog</span>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleSubmit}
              disabled={isPublishing}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Title Field */}
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Title"
              className="w-full text-5xl md:text-6xl font-black tracking-tight border-none outline-none focus:ring-0 placeholder-slate-200 text-slate-900"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Excerpt Field */}
          <div className="relative group">
            <textarea
              placeholder="Write a short sub-title or summary..."
              className="w-full text-xl text-slate-500 border-none outline-none focus:ring-0 resize-none h-20 placeholder-slate-300"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
            <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-slate-100 group-focus-within:w-full group-focus-within:bg-blue-500 transition-all duration-500"></div>
          </div>

          {/* Editor Field */}
          <div className="min-h-[600px] pt-4">
            <RichTextEditor
              value={content} 
              onChange={setContent}
              placeholder="Tell your story..."
            />
          </div>
        </form>
      </main>
    </div>
  );
}