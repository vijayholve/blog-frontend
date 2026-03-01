// src/app/create/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HtmlBlogEditor from "@/components/HtmlBlogEditor";
import PromptExamples from "@/components/PromptExamples";
import { generateAIContent } from "@/lib/api";
import { getAuthToken } from "@/lib/authApi";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenTab, setFullscreenTab] = useState("prompt"); // 'prompt', 'preview', 'code'
  const [showExamples, setShowExamples] = useState(false);
  const [wantGraphical, setWantGraphical] = useState(false);
  const [graphicalPrompt, setGraphicalPrompt] = useState("");
  const [graphicalContent, setGraphicalContent] = useState("");
  const [isGeneratingGraphical, setIsGeneratingGraphical] = useState(false);
  const router = useRouter();

  // Check authentication and load data
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/auth/login");
    } else {
      fetchCategories();
      fetchTags();
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/categories/");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/tags/");
      const data = await res.json();
      setTags(data);
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  };

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const handleSelectPrompt = (prompt) => {
    setAiPrompt(prompt);
    setShowExamples(false);
  };

  // Call the AI Agent
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      alert("Please enter a prompt for the AI");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert("You must be logged in to use AI generation");
      router.push("/auth/login");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/generate-ai-content/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ requirement: aiPrompt }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setTitle(data.title || "");
        setExcerpt(data.excerpt || "");
        setContent(data.generated_code || "");
      } else {
        if (res.status === 429) {
          const retryMsg = data.retry_after_seconds
            ? ` Please retry in ${data.retry_after_seconds} seconds.`
            : "";
          alert(`AI quota exceeded.${retryMsg}`);
        } else {
          alert(data.error || "AI generation failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("AI Generation Error:", err);
      alert("Error connecting to AI service.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Call the AI Agent for Graphical Explanation
  const handleGraphicalGenerate = async () => {
    if (!graphicalPrompt.trim()) {
      alert("Please enter a description for the graphical explanation");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert("You must be logged in to use AI generation");
      router.push("/auth/login");
      return;
    }

    setIsGeneratingGraphical(true);
    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/generate-graphical-content/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ requirement: graphicalPrompt }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setGraphicalContent(data.generated_code || "");
      } else {
        if (res.status === 429) {
          const retryMsg = data.retry_after_seconds
            ? ` Please retry in ${data.retry_after_seconds} seconds.`
            : "";
          alert(`AI quota exceeded.${retryMsg}`);
        } else {
          alert(data.error || "Graphical generation failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Graphical Generation Error:", err);
      alert("Error connecting to AI service.");
    } finally {
      setIsGeneratingGraphical(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content || !excerpt) {
      alert("Please fill in title, excerpt, and content");
      return;
    }

    if (!selectedCategory) {
      alert("Please select a category for your post");
      return;
    }

    if (selectedTags.length === 0) {
      alert("Please select at least one tag for your post");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert("You must be logged in to create a post");
      router.push("/auth/login");
      return;
    }

    setIsPublishing(true);

    // Ensure is_html is set to true for Gemini content
    const postData = {
      title,
      content,
      excerpt,
      is_html: true,
      status: "published",
      category_id: parseInt(selectedCategory),
      tag_ids: selectedTags,
      graphical_content: graphicalContent || "",
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/posts/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(postData),
      });

      if (res.ok) {
        alert("Post published successfully!");
        router.push("/");
        router.refresh();
      } else {
        const errorData = await res.json();
        console.error("Publish error:", errorData);
        alert("Failed to publish. Please check all fields.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error publishing post");
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
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setFullscreenTab("prompt")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    fullscreenTab === "prompt"
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  AI Prompt
                </button>
                <button
                  onClick={() => setFullscreenTab("preview")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    fullscreenTab === "preview"
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Live Output
                </button>
                <button
                  onClick={() => setFullscreenTab("code")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    fullscreenTab === "code"
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  HTML Source
                </button>
                {wantGraphical && (
                  <button
                    onClick={() => setFullscreenTab("graphical")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      fullscreenTab === "graphical"
                        ? "bg-purple-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    📊 Infographic
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Fullscreen Content */}
          <div className="flex-1 overflow-auto">
            {fullscreenTab === "prompt" && (
              <div className="max-w-4xl mx-auto p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    AI Content Generator
                  </h2>
                  <button
                    onClick={() => setShowExamples(!showExamples)}
                    className="text-sm text-blue-300 hover:text-blue-200 transition"
                  >
                    {showExamples ? "Hide Examples" : "Show Examples"}
                  </button>
                </div>

                {showExamples && (
                  <div className="mb-6 bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <PromptExamples onSelectPrompt={handleSelectPrompt} />
                  </div>
                )}

                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ex: Write a comprehensive guide about sustainable living practices in 2026..."
                  className="w-full h-[calc(100vh-350px)] p-6 rounded-xl bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500 text-base"
                />
                <button
                  onClick={handleAIGenerate}
                  disabled={isGenerating}
                  className="mt-4 w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isGenerating ? "AI is Coding..." : "Generate with AI"}
                </button>
              </div>
            )}

            {fullscreenTab === "preview" && (
              <div className="h-full bg-white p-8 overflow-auto">
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            )}

            {fullscreenTab === "code" && (
              <div className="h-full">
                <textarea
                  className="w-full h-full p-8 bg-slate-900 text-blue-300 font-mono text-sm outline-none resize-none leading-relaxed"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="<div class='bg-blue-500 p-10'>...</div>"
                />
              </div>
            )}

            {fullscreenTab === "graphical" && (
              <div className="h-full flex flex-col">
                {graphicalContent ? (
                  <>
                    {/* Split view: Preview on top, Code below */}
                    <div className="flex-1 overflow-auto bg-white p-8">
                      <div
                        dangerouslySetInnerHTML={{ __html: graphicalContent }}
                      />
                    </div>
                    <div className="h-[300px] border-t border-slate-700 flex flex-col">
                      <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
                        <span className="text-xs font-medium text-purple-400">
                          {"</>"} Graphical Source Code
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(graphicalContent);
                            alert("Copied!");
                          }}
                          className="text-xs text-slate-400 hover:text-white transition px-2 py-1 rounded hover:bg-slate-700"
                        >
                          📋 Copy
                        </button>
                      </div>
                      <textarea
                        className="flex-1 w-full p-4 bg-slate-900 text-purple-300 font-mono text-sm outline-none resize-none leading-relaxed"
                        value={graphicalContent}
                        onChange={(e) => setGraphicalContent(e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <span className="text-6xl mb-4 block">📊</span>
                      <p className="text-slate-400 text-lg">
                        No infographic generated yet.
                      </p>
                      <p className="text-slate-300 text-sm mt-2">
                        Enable the checkbox in the sidebar and generate one.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <nav className="sticky top-0 z-50 border-b  px-6 h-16 flex items-center justify-between">
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">🤖 AI Generator</h3>
                <button
                  onClick={() => setShowExamples(!showExamples)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showExamples ? "▲" : "▼"} Examples
                </button>
              </div>

              {showExamples && (
                <div className="mb-4 max-h-64 overflow-y-auto">
                  <PromptExamples onSelectPrompt={handleSelectPrompt} />
                </div>
              )}

              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe your blog topic in detail..."
                className="text-black w-full h-32 p-4 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-sm mb-4 bg-slate-50"
              />
              <button
                onClick={handleAIGenerate}
                disabled={isGenerating}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50"
              >
                {isGenerating ? "⏳ Generating..." : "✨ Generate with AI"}
              </button>
            </div>

            {/* Graphical Explanation Toggle */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={wantGraphical}
                  onChange={(e) => {
                    setWantGraphical(e.target.checked);
                    if (!e.target.checked) setGraphicalContent("");
                  }}
                  className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="font-bold text-slate-900 text-sm">
                    📊 Graphical Explanation
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Generate infographics, charts & visual diagrams
                  </p>
                </div>
              </label>

              {wantGraphical && (
                <div className="space-y-3">
                  <textarea
                    value={graphicalPrompt}
                    onChange={(e) => setGraphicalPrompt(e.target.value)}
                    placeholder="Describe what visual explanation you need... e.g. 'Show a comparison chart of React vs Vue vs Angular performance metrics'"
                    className="text-black w-full h-28 p-4 rounded-xl border-none focus:ring-2 focus:ring-purple-500 text-sm bg-slate-50"
                  />
                  <button
                    onClick={handleGraphicalGenerate}
                    disabled={isGeneratingGraphical}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50"
                  >
                    {isGeneratingGraphical
                      ? "⏳ Generating Graphic..."
                      : "📊 Generate Infographic"}
                  </button>
                </div>
              )}
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
                className="text-black w-full p-3 rounded-lg bg-slate-50 border-none h-24 mb-4"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />

              {/* Category Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-50 border-none text-slate-900"
                >
                  <option value="">Select a category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                        selectedTags.includes(tag.id)
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
                {selectedTags.length > 0 && (
                  <p className="mt-2 text-xs text-slate-500">
                    {selectedTags.length} tag
                    {selectedTags.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
            </div>
          </aside>

          {/* Main: HTML Editor & Preview */}
          <div className="lg:col-span-2 space-y-8">
            {/* Blog Content Section */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-lg">📝</span> Blog Content
                </h3>
                <button
                  onClick={() => {
                    setIsFullscreen(true);
                    setFullscreenTab("preview");
                  }}
                  className="text-slate-600 hover:text-slate-900 text-sm font-medium flex items-center gap-2 transition"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                  Fullscreen
                </button>
              </div>
              <HtmlBlogEditor value={content} onChange={setContent} />
            </div>

            {/* Graphical Explanation Section — always visible when checkbox is on */}
            {wantGraphical && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-lg">📊</span> Graphical Explanation
                  </h3>
                  {graphicalContent && (
                    <button
                      onClick={() => {
                        setIsFullscreen(true);
                        setFullscreenTab("graphical");
                      }}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1 transition"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                        />
                      </svg>
                      Fullscreen
                    </button>
                  )}
                </div>

                {graphicalContent ? (
                  <div className="space-y-4">
                    {/* Graphical Live Preview */}
                    <div className="bg-white rounded-2xl shadow-sm border border-purple-200 overflow-hidden">
                      <div className="bg-purple-50 border-b border-purple-100 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                          <span className="text-xs font-medium text-purple-700">
                            Live Infographic Preview
                          </span>
                        </div>
                      </div>
                      <div className="p-6 overflow-auto max-h-[600px]">
                        <div
                          dangerouslySetInnerHTML={{ __html: graphicalContent }}
                        />
                      </div>
                    </div>

                    {/* Graphical HTML Source Code */}
                    <div className="bg-white rounded-2xl shadow-sm border border-purple-200 overflow-hidden">
                      <div className="bg-slate-900 border-b border-slate-700 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-purple-400">
                            {"</>"} Graphical Source Code
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(graphicalContent);
                            alert("Graphical code copied to clipboard!");
                          }}
                          className="text-xs text-slate-400 hover:text-white transition px-2 py-1 rounded hover:bg-slate-700"
                        >
                          📋 Copy
                        </button>
                      </div>
                      <textarea
                        className="w-full p-6 bg-slate-900 text-purple-300 font-mono text-sm outline-none resize-none leading-relaxed min-h-[300px]"
                        value={graphicalContent}
                        onChange={(e) => setGraphicalContent(e.target.value)}
                        placeholder="Graphical HTML will appear here..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-dashed border-purple-300 p-12 text-center">
                    <span className="text-5xl mb-3 block">📊</span>
                    <p className="text-slate-500 font-medium">
                      No infographic generated yet
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      Enter a description in the sidebar and click "Generate
                      Infographic"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
