// src/components/CreateFullscreenWorkspace.jsx
"use client";

import PromptExamples from "@/components/PromptExamples";
import GraphicalExamples from "@/components/GraphicalExamples";
import PreviewStyleSelector from "@/components/PreviewStyleSelector";
import StyledIframe from "@/components/StyledIframe";
import { PREVIEW_STYLES } from "@/components/previewStyles";

export default function CreateFullscreenWorkspace({
  isFullscreen,
  fullscreenTab,
  setFullscreenTab,
  wantGraphical,
  setWantGraphical,
  content,
  title,
  setTitle,
  excerpt,
  setExcerpt,
  isPublishing,
  handleSubmit,
  fsSidebarOpen,
  setFsSidebarOpen,
  showExamples,
  setShowExamples,
  handleSelectPrompt,
  aiPrompt,
  setAiPrompt,
  isGenerating,
  handleAIGenerate,
  showGraphicalExamples,
  setShowGraphicalExamples,
  handleSelectGraphicalPrompt,
  graphicalPrompt,
  setGraphicalPrompt,
  isGeneratingGraphical,
  handleGraphicalGenerate,
  graphicalContent,
  setGraphicalContent,
  previewStyle,
  setPreviewStyle,
  previewStyles = PREVIEW_STYLES,
  selectedCategory,
  setSelectedCategory,
  categories,
  selectedTags,
  tags,
  toggleTag,
  startSectionEnhance,
  handleEnhanceDesign,
  isEnhancing,
  isEnhancingSection,
  sectionMode,
  cancelSectionEnhance,
  capturedSectionHTML,
  enhanceSectionInstr,
  setEnhanceSectionInstr,
  handleConfirmSectionEnhance,
  fsPanelOpen,
  fsSelectedText,
  fsSelSource,
  handleFsDiscard,
  handleFsRefine,
  handleFsApply,
  fsRefinedText,
  setFsRefinedText,
  fsIsRefining,
  fsActiveCmd,
  REFINE_COMMANDS,
  fsCodeRef,
  handleFsCodeSelect,
  fsPreviewIframeRef,
  graphicalFsIframeRef,
  sectionOverlayRef,
  setContent,
  onClose,
  handleOverlayMouseDown,
  handleOverlayMouseMove,
  handleOverlayMouseUp,
}) {
  if (!isFullscreen) return null;

  const activePreviewStyle =
    previewStyles.find((style) => style.value === previewStyle) ??
    previewStyles[0] ??
    null;
  const activeStyleSources = activePreviewStyle
    ? [{ href: activePreviewStyle.href }]
    : [];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col">
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition flex items-center gap-1.5 text-sm"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
          <div className="w-px h-5 bg-slate-700" />
          <span className="text-white font-bold text-sm hidden md:inline">
            Workspace
          </span>
        </div>

        <div className="flex gap-1 bg-slate-700/50 rounded-lg p-0.5">
          <button
            onClick={() => setFullscreenTab("preview")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${fullscreenTab === "preview" ? "bg-blue-600 text-white shadow" : "text-slate-300 hover:text-white hover:bg-slate-700/50"}`}
          >
            ▶ Preview
          </button>
          <button
            onClick={() => setFullscreenTab("code")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${fullscreenTab === "code" ? "bg-blue-600 text-white shadow" : "text-slate-300 hover:text-white hover:bg-slate-700/50"}`}
          >
            {"</>"} Code
          </button>
          {wantGraphical && (
            <button
              onClick={() => setFullscreenTab("graphical")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${fullscreenTab === "graphical" ? "bg-purple-600 text-white shadow" : "text-slate-300 hover:text-white hover:bg-slate-700/50"}`}
            >
              📊 Graphic
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {content && content.trim().length > 50 && (
            <>
              <button
                onClick={startSectionEnhance}
                disabled={isEnhancingSection || sectionMode !== "idle"}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #f97316)",
                }}
              >
                🎯 Section
              </button>
              <button
                onClick={handleEnhanceDesign}
                disabled={isEnhancing}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                }}
              >
                {isEnhancing ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />{" "}
                    Enhancing…
                  </>
                ) : (
                  <>🎨 Full Page</>
                )}
              </button>
            </>
          )}
          <div className="w-px h-5 bg-slate-700" />
          <button
            onClick={handleSubmit}
            disabled={isPublishing || !content || !title || !excerpt}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
          >
            {isPublishing ? "⏳..." : "🚀 Publish"}
          </button>
          <button
            onClick={() => setFsSidebarOpen((v) => !v)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
            title={fsSidebarOpen ? "Hide sidebar" : "Show sidebar"}
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
                d={
                  fsSidebarOpen
                    ? "M11 19l-7-7 7-7m8 14l-7-7 7-7"
                    : "M13 5l7 7-7 7M5 5l7 7-7 7"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {sectionMode !== "idle" && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-amber-300 text-sm">
            {sectionMode === "marking" && (
              <>
                <span className="animate-pulse">🎯</span> Draw a rectangle over
                the section to enhance
              </>
            )}
            {sectionMode === "placed" && (
              <>
                <span>✅</span> Section captured — review below
              </>
            )}
            {sectionMode === "enhancing" && (
              <>
                <span className="w-3 h-3 border-2 border-amber-300/40 border-t-amber-300 rounded-full animate-spin inline-block" />{" "}
                Enhancing section…
              </>
            )}
          </div>
          <button
            onClick={cancelSectionEnhance}
            className="text-xs text-amber-400 hover:text-white bg-amber-500/20 px-2.5 py-1 rounded transition"
          >
            ✕ Cancel
          </button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {fsSidebarOpen && (
          <div className="w-[300px] bg-slate-800/80 border-r border-slate-700 overflow-y-auto shrink-0">
            <div className="p-3 border-b border-slate-700/50">
              <PreviewStyleSelector
                label="Workspace Style"
                options={previewStyles}
                value={previewStyle}
                onChange={setPreviewStyle}
              />
            </div>

            <div className="p-3 border-b border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  🤖 AI Prompt
                </h4>
                <button
                  onClick={() => setShowExamples(true)}
                  className="text-[10px] text-blue-400 hover:text-blue-300 transition"
                >
                  📚 Examples
                </button>
              </div>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe your blog topic..."
                className="w-full h-20 p-2.5 rounded-lg bg-slate-900/80 text-white border border-slate-700 text-xs resize-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500"
              />
              <button
                onClick={handleAIGenerate}
                disabled={isGenerating}
                className="mt-2 w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-bold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50"
              >
                {isGenerating ? "⏳ Generating..." : "✨ Generate Blog"}
              </button>
            </div>

            <div className="p-3 border-b border-slate-700/50">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wantGraphical}
                  onChange={(e) => {
                    setWantGraphical(e.target.checked);
                    if (!e.target.checked) setGraphicalContent("");
                  }}
                  className="w-3.5 h-3.5 rounded border-slate-600 text-purple-600 focus:ring-purple-500 bg-slate-800"
                />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  📊 Graphical
                </span>
              </label>
              {wantGraphical && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      Describe infographic
                    </span>
                    <button
                      onClick={() => setShowGraphicalExamples(true)}
                      className="text-[10px] text-purple-400 hover:text-purple-300 transition"
                    >
                      📚
                    </button>
                  </div>
                  <textarea
                    value={graphicalPrompt}
                    onChange={(e) => setGraphicalPrompt(e.target.value)}
                    placeholder="e.g., Show a comparison chart..."
                    className="w-full h-16 p-2.5 rounded-lg bg-slate-900/80 text-white border border-slate-700 text-xs resize-none focus:ring-1 focus:ring-purple-500 placeholder:text-slate-500"
                  />
                  <button
                    onClick={handleGraphicalGenerate}
                    disabled={isGeneratingGraphical}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs font-bold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50"
                  >
                    {isGeneratingGraphical
                      ? "⏳ Generating..."
                      : "📊 Generate Infographic"}
                  </button>
                </div>
              )}
            </div>

            <div className="p-3 border-b border-slate-700/50 space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                📋 Metadata
              </h4>
              <input
                type="text"
                placeholder="Post Title"
                className="w-full p-2 rounded-lg bg-slate-900/80 text-white border border-slate-700 text-xs focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                placeholder="SEO Excerpt"
                className="w-full p-2 rounded-lg bg-slate-900/80 text-white border border-slate-700 text-xs h-14 resize-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-900/80 text-white border border-slate-700 text-xs focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition ${
                        selectedTags.includes(tag.id)
                          ? "bg-blue-600 text-white"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
                {selectedTags.length > 0 && (
                  <p className="mt-1 text-[10px] text-slate-500">
                    {selectedTags.length} tag
                    {selectedTags.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 relative overflow-hidden">
          {sectionMode === "marking" && fullscreenTab === "preview" && (
            <div
              ref={sectionOverlayRef}
              className="absolute inset-0 z-20"
              style={{ cursor: "crosshair" }}
              onMouseDown={handleOverlayMouseDown}
              onMouseMove={handleOverlayMouseMove}
              onMouseUp={handleOverlayMouseUp}
            />
          )}

          {sectionMode === "placed" && (
            <div className="absolute inset-x-0 top-0 z-20 bg-slate-800/95 backdrop-blur border-b border-amber-500/30 p-4 space-y-2">
              <div className="text-xs text-slate-400 font-medium">
                Captured Section:
              </div>
              <div className="max-h-28 overflow-auto bg-slate-900 rounded-lg p-2.5 text-[10px] text-slate-300 font-mono border border-slate-700 leading-relaxed">
                {capturedSectionHTML.length > 500
                  ? capturedSectionHTML.slice(0, 500) + "…"
                  : capturedSectionHTML}
              </div>
              <textarea
                value={enhanceSectionInstr}
                onChange={(e) => setEnhanceSectionInstr(e.target.value)}
                placeholder="Optional: specific instructions (e.g., make more modern, add gradient)..."
                className="w-full p-2 rounded-lg bg-slate-900/80 text-white border border-slate-700 text-xs h-12 resize-none focus:ring-1 focus:ring-amber-500 placeholder:text-slate-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmSectionEnhance}
                  className="flex-1 py-2 rounded-lg text-xs font-bold text-white transition hover:shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, #f97316)",
                  }}
                >
                  ✨ Enhance This Section
                </button>
                <button
                  onClick={cancelSectionEnhance}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-600 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {fullscreenTab === "preview" && (
            <div className="h-full bg-white overflow-hidden">
              <StyledIframe
                iframeRef={fsPreviewIframeRef}
                html={content}
                styles={activeStyleSources}
                title="Fullscreen Preview"
              />
            </div>
          )}

          {fullscreenTab === "code" && (
            <div className="h-full">
              <textarea
                ref={fsCodeRef}
                className="w-full h-full p-8 bg-slate-900 text-blue-300 font-mono text-sm outline-none resize-none leading-relaxed"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onMouseUp={handleFsCodeSelect}
                onKeyUp={handleFsCodeSelect}
                placeholder="<div class='bg-blue-500 p-10'>...</div>"
              />
            </div>
          )}

          {fullscreenTab === "graphical" && (
            <div className="h-full flex flex-col">
              {graphicalContent ? (
                <>
                  <div className="flex-1 overflow-hidden bg-white">
                    <StyledIframe
                      iframeRef={graphicalFsIframeRef}
                      html={graphicalContent}
                      styles={activeStyleSources}
                      title="Graphical Preview"
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

      {fsPanelOpen && fsSelectedText && (
        <div
          className="fixed top-1/2 right-8 -translate-y-1/2 z-[200] w-[370px]"
          style={{ maxHeight: "85vh" }}
        >
          <div
            className="flex flex-col bg-white rounded-2xl overflow-hidden"
            style={{
              maxHeight: "85vh",
              boxShadow:
                "0 25px 60px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.2)",
            }}
          >
            <div
              className="px-5 py-4 flex items-center justify-between shrink-0"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🪄</span>
                <span className="text-white font-bold text-sm">AI Refine</span>
                <span className="text-[10px] text-white/60 bg-white/15 px-2 py-0.5 rounded-full ml-1">
                  {fsSelSource === "code" ? "Source" : "Preview"}
                </span>
              </div>
              <button
                onClick={handleFsDiscard}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/20 text-sm transition"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-3 border-b border-slate-100 shrink-0">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                Selected Text
              </label>
              <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-700 max-h-24 overflow-y-auto leading-relaxed border border-slate-100">
                {fsSelectedText.length > 250
                  ? fsSelectedText.slice(0, 250) + "…"
                  : fsSelectedText}
              </div>
            </div>

            <div className="px-5 py-3 border-b border-slate-100 shrink-0">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                Choose Action
              </label>
              <div className="grid grid-cols-2 gap-2">
                {REFINE_COMMANDS.map((cmd) => (
                  <button
                    key={cmd.key}
                    onClick={() => handleFsRefine(cmd.key)}
                    disabled={fsIsRefining}
                    style={{ background: cmd.bg }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:shadow-lg hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                      fsActiveCmd === cmd.key
                        ? "ring-2 ring-offset-2 ring-purple-400 scale-[1.03]"
                        : ""
                    }`}
                  >
                    {fsIsRefining && fsActiveCmd === cmd.key ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Working…
                      </span>
                    ) : (
                      cmd.label
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 px-5 py-3 overflow-y-auto min-h-[120px] max-h-[250px]">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                Refined Result
              </label>
              {fsRefinedText ? (
                <textarea
                  value={fsRefinedText}
                  onChange={(e) => setFsRefinedText(e.target.value)}
                  className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-slate-800 leading-relaxed resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                  rows={4}
                />
              ) : (
                <div className="flex items-center justify-center h-24 text-slate-300 text-sm">
                  {fsIsRefining ? (
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full animate-spin"
                        style={{
                          border: "3px solid #e9d5ff",
                          borderTopColor: "#7c3aed",
                        }}
                      />
                      <span className="text-purple-400 text-xs font-medium">
                        AI is refining…
                      </span>
                    </div>
                  ) : (
                    "Select an action above to refine"
                  )}
                </div>
              )}
            </div>

            {fsRefinedText && (
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex gap-2 shrink-0">
                <button
                  onClick={handleFsApply}
                  style={{
                    background: "linear-gradient(135deg, #10b981, #14b8a6)",
                  }}
                  className="flex-1 py-2.5 text-white rounded-xl text-sm font-bold hover:shadow-lg transition"
                >
                  ✅ Apply Change
                </button>
                <button
                  onClick={handleFsDiscard}
                  className="px-4 py-2.5 bg-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-300 transition"
                >
                  Discard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <PromptExamples
        open={showExamples}
        onClose={() => setShowExamples(false)}
        onSelectPrompt={handleSelectPrompt}
      />
      <GraphicalExamples
        open={showGraphicalExamples}
        onClose={() => setShowGraphicalExamples(false)}
        onSelectPrompt={handleSelectGraphicalPrompt}
      />
    </div>
  );
}
