// src/app/create/page.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import HtmlBlogEditor from "@/components/HtmlBlogEditor";
import { generateAIContent } from "@/lib/api";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenTab, setFullscreenTab] = useState('prompt'); // 'prompt', 'preview', 'code'
  const router = useRouter();

  // Call the AI Agent
  const handleAIGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/generate-ai-content/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requirement: aiPrompt }), // Send 'requirement'
        }
      );
      const data = await res.json();
      if (res.ok) {
        setTitle(data.title || "");
        setExcerpt(data.excerpt || "");
        setContent(data.generated_code || "");
      }
    } catch (err) {
      console.error("AI Generation Error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPublishing(true);

    // Ensure is_html is set to true for Gemini content
    const postData = {
      title,
      content,
      excerpt,
      is_html: true,
      is_published: true,
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/posts/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        alert("Something went wrong with publishing!");
      }
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col">
          {/* Fullscreen Header */}
          <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsFullscreen(false)}
                className="text-slate-400 hover:text-white transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={() => setFullscreenTab('prompt')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    fullscreenTab === 'prompt' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  AI Prompt
                </button>
                <button 
                  onClick={() => setFullscreenTab('preview')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    fullscreenTab === 'preview' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Live Output
                </button>
                <button 
                  onClick={() => setFullscreenTab('code')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    fullscreenTab === 'code' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  HTML Source
                </button>
              </div>
            </div>
          </div>

          {/* Fullscreen Content */}
          <div className="flex-1 overflow-auto">
            {fullscreenTab === 'prompt' && (
              <div className="max-w-4xl mx-auto p-8">
                <h2 className="text-2xl font-bold text-white mb-4">AI Agent Prompt</h2>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ex: Create a blog about Space Travel with a blue theme and high contrast text..."
                  className="w-full h-[calc(100vh-250px)] p-6 rounded-xl bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500 text-base"
                />
                <button
                  onClick={handleAIGenerate}
                  disabled={isGenerating}
                  className="mt-4 w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isGenerating ? 'AI is Coding...' : 'Generate with Gemini'}
                </button>
              </div>
            )}

            {fullscreenTab === 'preview' && (
              <div className="h-full bg-white p-8 overflow-auto">
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            )}

            {fullscreenTab === 'code' && (
              <div className="h-full">
                <textarea
                  className="w-full h-full p-8 bg-slate-900 text-blue-300 font-mono text-sm outline-none resize-none leading-relaxed"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="<div class='bg-blue-500 p-10'>...</div>"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md px-6 h-16 flex items-center justify-between">
        <span className="font-bold text-slate-400 uppercase tracking-widest text-xs">
          AI Blog Architect
        </span>
        <button
          onClick={handleSubmit}
          disabled={isPublishing || !content || !title || !excerpt}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg transition disabled:opacity-50"
        >
          {isPublishing ? "Publishing..." : "Publish Blog"}
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Sidebar: AI Controls */}
          <aside className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4">AI Agent Prompt</h3>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ex: Create a blog about Space Travel with a blue theme and high contrast text..."
                className="text-black w-full h-32 p-4 rounded-xl  border-none focus:ring-2 focus:ring-blue-500 text-sm mb-4"
              />
              <button
                onClick={handleAIGenerate}
                disabled={isGenerating}
                className=" w-full py-3 bg-slate-900 y   rounded-xl font-bold hover:bg-blue-600 transition disabled:opacity-50"
              >
                {isGenerating ? "AI is Coding..." : "Generate with Gemini"}
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4">Metadata</h3>
              <input
                type="text"
                placeholder="Post Title"
                className="text-black w-full p-3 rounded-lg bg-slate-50 border-none mb-4"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                placeholder="SEO Excerpt"
                className="text-black w-full p-3 rounded-lg bg-slate-50 border-none h-24"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>
          </aside>

          {/* Main: HTML Editor & Preview */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => {
                  setIsFullscreen(true);
                  setFullscreenTab('preview');
                }}
                className="text-slate-600 hover:text-slate-900 text-sm font-medium flex items-center gap-2 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                Fullscreen
              </button>
            </div>
            <HtmlBlogEditor value={content} onChange={setContent} />
          </div>
        </div>
      </main>
    </div>
  );
}
