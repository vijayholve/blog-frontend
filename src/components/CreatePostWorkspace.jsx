// src/components/CreatePostWorkspace.jsx
"use client";

import HtmlBlogEditor from "@/components/HtmlBlogEditor";
import PromptExamples from "@/components/PromptExamples";
import GraphicalExamples from "@/components/GraphicalExamples";

export default function CreatePostWorkspace({
  title,
  setTitle,
  content,
  setContent,
  excerpt,
  setExcerpt,
  aiPrompt,
  setAiPrompt,
  selectedCategory,
  setSelectedCategory,
  selectedTags,
  categories,
  tags,
  toggleTag,
  wantGraphical,
  setWantGraphical,
  graphicalPrompt,
  setGraphicalPrompt,
  graphicalContent,
  setGraphicalContent,
  seoMetaData = {},
  seoJsonLdText = "",
  setSeoMetaData = () => {},
  setSeoJsonLdText = () => {},
  handleSeoPayloadGenerate = () => {},
  isGenerating,
  isGeneratingGraphical,
  isPublishing,
  handleAIGenerate,
  handleGraphicalGenerate,
  handleSubmit,
  showExamples,
  setShowExamples,
  showGraphicalExamples,
  setShowGraphicalExamples,
  handleSelectPrompt,
  handleSelectGraphicalPrompt,
  onOpenFullscreen,
}) {
  const safeSeoMetaData = {
    meta_title: "",
    meta_description: "",
    keywords: [],
    ...seoMetaData,
  };
  console.log("seoMetaData ", seoMetaData);

  const seoJsonLdExample = `{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Example blog title",
  "description": "Example meta description",
  "keywords": ["example", "blog", "seo"]
}`;

  return (
    <>
      <nav className="sticky top-0 z-50 border-b px-6 h-16 flex items-center justify-between bg-white/90 backdrop-blur">
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
          <aside className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">🤖 AI Generator</h3>
                <button
                  onClick={() => setShowExamples(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  📚 Browse Prompts
                </button>
              </div>

              <PromptExamples
                open={showExamples}
                onClose={() => setShowExamples(false)}
                onSelectPrompt={handleSelectPrompt}
              />

              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe your blog topic in detail..."
                className="text-black w-full h-32 p-4 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-sm mb-4 bg-slate-50"
              />
              <button
                onClick={handleAIGenerate}
                disabled={isGenerating}
                className="w-full py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50"
              >
                {isGenerating ? "⏳ Generating..." : "✨ Generate with AI"}
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">🧩 SEO Metadata</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  AI Output
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Fill this from the same blog generation response and edit it
                manually if needed.
              </p>
              <button
                onClick={handleSeoPayloadGenerate}
                className="w-full py-3 bg-linear-to-r from-slate-700 to-slate-900 text-white rounded-xl font-bold hover:from-slate-800 hover:to-black transition"
              >
                🧾 Fill SEO From Blog AI
              </button>

              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  value={safeSeoMetaData.meta_title}
                  onChange={(e) =>
                    setSeoMetaData((prev) => ({
                      ...prev,
                      meta_title: e.target.value,
                    }))
                  }
                  placeholder="Meta title"
                  className="text-black w-full p-3 rounded-lg bg-slate-50 border-none"
                />
                <textarea
                  value={safeSeoMetaData.meta_description}
                  onChange={(e) =>
                    setSeoMetaData((prev) => ({
                      ...prev,
                      meta_description: e.target.value,
                    }))
                  }
                  placeholder="Meta description"
                  className="text-black w-full h-24 p-3 rounded-lg bg-slate-50 border-none"
                />
                <input
                  type="text"
                  value={
                    Array.isArray(safeSeoMetaData.keywords)
                      ? safeSeoMetaData.keywords.join(", ")
                      : ""
                  }
                  onChange={(e) =>
                    setSeoMetaData((prev) => ({
                      ...prev,
                      keywords: e.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    }))
                  }
                  placeholder="Keywords, separated, by, commas"
                  className="text-black w-full p-3 rounded-lg bg-slate-50 border-none"
                />
                <textarea
                  value={seoJsonLdText}
                  onChange={(e) => setSeoJsonLdText(e.target.value)}
                  placeholder={seoJsonLdExample}
                  className="text-black w-full h-56 p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs"
                />
              </div>
            </div>

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
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      Describe your infographic
                    </span>
                    <button
                      onClick={() => setShowGraphicalExamples(true)}
                      className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                    >
                      📚 Browse Prompts
                    </button>
                  </div>

                  <GraphicalExamples
                    open={showGraphicalExamples}
                    onClose={() => setShowGraphicalExamples(false)}
                    onSelectPrompt={handleSelectGraphicalPrompt}
                  />

                  <textarea
                    value={graphicalPrompt}
                    onChange={(e) => setGraphicalPrompt(e.target.value)}
                    placeholder="Describe what visual explanation you need... e.g. 'Show a comparison chart of React vs Vue vs Angular performance metrics'"
                    className="text-black w-full h-28 p-4 rounded-xl border-none focus:ring-2 focus:ring-purple-500 text-sm bg-slate-50"
                  />
                  <button
                    onClick={handleGraphicalGenerate}
                    disabled={isGeneratingGraphical}
                    className="w-full py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50"
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

          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-lg">📝</span> Blog Content
                </h3>
                <button
                  onClick={onOpenFullscreen}
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

            {wantGraphical && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-lg">📊</span> Graphical Explanation
                  </h3>
                  {graphicalContent && (
                    <button
                      onClick={() => {
                        onOpenFullscreen("graphical");
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

                <HtmlBlogEditor
                  value={graphicalContent}
                  onChange={setGraphicalContent}
                  contentType="graphical"
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
