// src/components/HtmlBlogEditor.jsx
"use client";
import { useState, useRef, useCallback } from "react";

const REFINE_COMMANDS = [
  {
    key: "simplify",
    label: "✨ Simplify",
    bg: "linear-gradient(135deg, #10b981, #14b8a6)",
  },
  {
    key: "professional",
    label: "💼 Professional",
    bg: "linear-gradient(135deg, #3b82f6, #6366f1)",
  },
  {
    key: "translate_marathi",
    label: "🇮🇳 Marathi",
    bg: "linear-gradient(135deg, #f97316, #f59e0b)",
  },
  {
    key: "expand",
    label: "📝 Expand",
    bg: "linear-gradient(135deg, #a855f7, #ec4899)",
  },
  {
    key: "shorten",
    label: "✂️ Shorten",
    bg: "linear-gradient(135deg, #f43f5e, #ef4444)",
  },
  {
    key: "fix_grammar",
    label: "🔤 Grammar Fix",
    bg: "linear-gradient(135deg, #06b6d4, #3b82f6)",
  },
];

export default function HtmlBlogEditor({ value, onChange, authToken }) {
  const [selectedText, setSelectedText] = useState("");
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [selectionSource, setSelectionSource] = useState("code"); // "code" or "preview"
  const [refinedText, setRefinedText] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [activeCommand, setActiveCommand] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const textareaRef = useRef(null);
  const previewRef = useRef(null);

  // Capture text selection from the CODE editor (textarea)
  const handleCodeSelect = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = value.substring(start, end).trim();
    if (text && text.length > 2) {
      setSelectedText(text);
      setSelectionStart(start);
      setSelectionEnd(end);
      setSelectionSource("code");
      setRefinedText("");
      setPanelOpen(true);
    }
  }, [value]);

  // Capture text selection from the PREVIEW (live output) using window.getSelection
  const handlePreviewSelect = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const text = selection.toString().trim();
    if (text && text.length > 2) {
      setSelectedText(text);
      setSelectionSource("preview");
      setRefinedText("");
      setPanelOpen(true);
    }
  }, []);

  // Call the refine API
  const handleRefine = async (command) => {
    if (!selectedText) return;
    setIsRefining(true);
    setActiveCommand(command);
    setRefinedText("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/refine-text/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Token ${authToken}` } : {}),
        },
        body: JSON.stringify({
          text_snippet: selectedText,
          command: command,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRefinedText(data.refined_text || "");
      } else {
        if (res.status === 429) {
          const retryMsg = data.retry_after_seconds
            ? ` Retry in ${data.retry_after_seconds}s.`
            : "";
          alert(`Rate limited.${retryMsg}`);
        } else {
          alert(data.error || "Refine failed");
        }
      }
    } catch (err) {
      console.error("Refine Error:", err);
      alert("Error connecting to AI service.");
    } finally {
      setIsRefining(false);
      setActiveCommand("");
    }
  };

  // Apply the refined text back into the editor
  const handleApply = () => {
    if (!refinedText) return;
    if (selectionSource === "code") {
      // Replace in the raw HTML code by character index
      const before = value.substring(0, selectionStart);
      const after = value.substring(selectionEnd);
      onChange(before + refinedText + after);
    } else {
      // Replace by string matching (for preview selections)
      const newValue = value.replace(selectedText, refinedText);
      onChange(newValue);
    }
    setSelectedText("");
    setRefinedText("");
    setPanelOpen(false);
  };

  const handleDiscard = () => {
    setRefinedText("");
    setSelectedText("");
    setPanelOpen(false);
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
        {/* Code Editor Side */}
        <div className="flex flex-col h-full border rounded-2xl overflow-hidden shadow-sm bg-slate-900">
          <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              HTML Source
            </span>
            {selectedText && selectionSource === "code" && (
              <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                {selectedText.length} chars selected
              </span>
            )}
          </div>
          <textarea
            ref={textareaRef}
            className="flex-1 p-6 bg-transparent text-blue-300 font-mono text-sm outline-none resize-none leading-relaxed"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onMouseUp={handleCodeSelect}
            onKeyUp={handleCodeSelect}
            placeholder="<div class='bg-blue-500 p-10'>...</div>"
          />
        </div>

        {/* Live Preview Side */}
        <div className="flex flex-col h-full border rounded-2xl overflow-hidden shadow-sm bg-white">
          <div className="bg-slate-50 px-4 py-2 border-b flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Live Output
            </span>
            {selectedText && selectionSource === "preview" && (
              <span className="text-[10px] text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full">
                {selectedText.length} chars selected
              </span>
            )}
          </div>
          <div
            ref={previewRef}
            className="flex-1 p-6 overflow-auto bg-slate-50/50"
            onMouseUp={handlePreviewSelect}
          >
            <div dangerouslySetInnerHTML={{ __html: value }} />
          </div>
        </div>
      </div>

      {/* ── AI Refine Side Panel ── */}
      {panelOpen && selectedText && (
        <div
          className="fixed top-1/2 right-8 -translate-y-1/2 w-[370px] z-[200]"
          style={{ maxHeight: "85vh" }}
        >
          <div
            className="flex flex-col bg-white rounded-2xl overflow-hidden"
            style={{
              maxHeight: "85vh",
              boxShadow:
                "0 25px 60px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(139,92,246,0.15)",
            }}
          >
            {/* Panel Header */}
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
                  {selectionSource === "code" ? "Source" : "Preview"}
                </span>
              </div>
              <button
                onClick={handleDiscard}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/20 text-sm transition"
              >
                ✕
              </button>
            </div>

            {/* Selected Text Preview */}
            <div className="px-5 py-3 border-b border-slate-100 shrink-0">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                Selected Text
              </label>
              <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-700 max-h-24 overflow-y-auto leading-relaxed border border-slate-100">
                {selectedText.length > 250
                  ? selectedText.slice(0, 250) + "…"
                  : selectedText}
              </div>
            </div>

            {/* Command Buttons */}
            <div className="px-5 py-3 border-b border-slate-100 shrink-0">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                Choose Action
              </label>
              <div className="grid grid-cols-2 gap-2">
                {REFINE_COMMANDS.map((cmd) => (
                  <button
                    key={cmd.key}
                    onClick={() => handleRefine(cmd.key)}
                    disabled={isRefining}
                    style={{ background: cmd.bg }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold text-white transition-all
                      hover:shadow-lg hover:scale-[1.03] active:scale-95
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                      ${activeCommand === cmd.key ? "ring-2 ring-offset-2 ring-purple-400 scale-[1.03]" : ""}`}
                  >
                    {isRefining && activeCommand === cmd.key ? (
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

            {/* Refined Output */}
            <div className="flex-1 px-5 py-3 overflow-y-auto min-h-[120px] max-h-[250px]">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                Refined Result
              </label>
              {refinedText ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {refinedText}
                </div>
              ) : (
                <div className="flex items-center justify-center h-24 text-slate-300 text-sm">
                  {isRefining ? (
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

            {/* Action Footer */}
            {refinedText && (
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex gap-2 shrink-0">
                <button
                  onClick={handleApply}
                  style={{
                    background: "linear-gradient(135deg, #10b981, #14b8a6)",
                  }}
                  className="flex-1 py-2.5 text-white rounded-xl text-sm font-bold hover:shadow-lg transition"
                >
                  ✅ Apply Change
                </button>
                <button
                  onClick={handleDiscard}
                  className="px-4 py-2.5 bg-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-300 transition"
                >
                  Discard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
