// src/app/create/page.jsx
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/RichTextEditor';
import HtmlBlogEditor from '@/components/HtmlBlogEditor';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [isHtmlMode, setIsHtmlMode] = useState(false); // Toggle state
  const [isPublishing, setIsPublishing] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPublishing(true);

    const postData = { title, content, excerpt, is_html: isHtmlMode, is_published: true };

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
        alert("Error publishing post");
      }
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">New Story</span>
            {/* Editor Type Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-full border">
              <button 
                type="button"
                onClick={() => setIsHtmlMode(false)}
                className={`px-4 py-1 rounded-full text-xs font-bold transition ${!isHtmlMode ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                Markdown
              </button>
              <button 
                type="button"
                onClick={() => setIsHtmlMode(true)}
                className={`px-4 py-1 rounded-full text-xs font-bold transition ${isHtmlMode ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                HTML Code
              </button>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={isPublishing} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg transition disabled:opacity-50">
            {isPublishing ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <form className="space-y-8">
          <input
            type="text" placeholder="Post Title"
            className="w-full text-6xl font-black border-none bg-transparent focus:ring-0 placeholder-slate-200"
            value={title} onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="SEO Excerpt..."
            className="w-full text-xl text-slate-500 bg-transparent border-none focus:ring-0 resize-none h-16"
            value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
          />

          <div className="pt-8">
            {isHtmlMode ? (
              <HtmlBlogEditor value={content} onChange={setContent} />
            ) : (
              <RichTextEditor value={content} onChange={setContent} />
            )}
          </div>
        </form>
      </main>
    </div>
  );
}