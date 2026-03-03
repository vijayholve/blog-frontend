// src/components/HtmlBlogEditor.jsx
"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { getAuthToken } from "@/lib/authApi";

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
  {
    key: "change",
    label: "🔄 Change",
    bg: "linear-gradient(135deg, #f59e0b, #d97706)",
  },
];

export default function HtmlBlogEditor({
  value,
  onChange,
  contentType = "blog",
}) {
  const [selectedText, setSelectedText] = useState("");
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [selectionSource, setSelectionSource] = useState("code"); // "code" or "preview"
  const [refinedText, setRefinedText] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [activeCommand, setActiveCommand] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceStep, setEnhanceStep] = useState(null); // null|"fullscreen"|"marking"|"placed"|"confirming"|"enhancing"
  const [startPt, setStartPt] = useState(null);
  const [endPt, setEndPt] = useState(null);
  const [mousePos, setMousePos] = useState(null);
  const [capturedHTML, setCapturedHTML] = useState("");
  const [enhanceInstructions, setEnhanceInstructions] = useState("");
  const textareaRef = useRef(null);
  const previewRef = useRef(null);
  const iframeRef = useRef(null);
  const enhanceIframeRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Helper to attach mouseup listener inside the iframe document
  const attachIframeMouseup = useCallback((iframe) => {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc || !doc.body) return;
      // Avoid duplicate listeners by marking
      if (doc.__mouseupAttached) return;
      doc.__mouseupAttached = true;
      doc.addEventListener("mouseup", () => {
        const sel = iframe.contentWindow.getSelection();
        if (!sel || sel.isCollapsed) return;
        const text = sel.toString().trim();
        if (text && text.length > 2) {
          setSelectedText(text);
          setSelectionSource("preview");
          setRefinedText("");
          setPanelOpen(true);
        }
      });
    } catch (e) {
      // cross-origin guard
    }
  }, []);

  // Attach mouseup listener inside the iframe for preview text selection
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const onLoad = () => attachIframeMouseup(iframe);
    iframe.addEventListener("load", onLoad);

    // Also try immediately in case iframe already loaded
    if (iframe.contentDocument?.body) {
      attachIframeMouseup(iframe);
    }

    return () => iframe.removeEventListener("load", onLoad);
  }, [value, attachIframeMouseup]);

  // Escape to cancel section enhance
  useEffect(() => {
    if (!enhanceStep) return;
    const onKey = (e) => {
      if (e.key === "Escape") cancelEnhance();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enhanceStep]);

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

  // Preview text selection is now handled via useEffect on the iframe's contentDocument

  // Call the refine API
  const handleRefine = async (command) => {
    if (!selectedText) return;

    // "Change" = let user edit directly, no API call
    if (command === "change") {
      setRefinedText(selectedText);
      return;
    }

    setIsRefining(true);
    setActiveCommand(command);
    setRefinedText("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/refine-text/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${getAuthToken()}`,
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
      // Smart replace for preview selections
      let newValue = value;
      let matched = false;

      // Strategy 1: Exact match
      if (value.includes(selectedText)) {
        newValue = value.replace(selectedText, refinedText);
        matched = true;
      }

      // Strategy 2: Normalized whitespace match
      if (!matched) {
        const normalizedSelected = selectedText.replace(/\s+/g, " ").trim();
        // Search for the text in the HTML with flexible whitespace
        const escapedNorm = normalizedSelected.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&",
        );
        const wsFlexPattern = escapedNorm.split(" ").join("\\s+");
        const wsRegex = new RegExp(wsFlexPattern, "s");
        const wsMatch = value.match(wsRegex);
        if (wsMatch) {
          newValue = value.replace(wsMatch[0], refinedText);
          matched = true;
        }
      }

      // Strategy 3: Allow HTML tags between words
      if (!matched) {
        const escaped = selectedText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const flexPattern = escaped.split(/\s+/).join("\\s*(?:<[^>]*>\\s*)*");
        const regex = new RegExp(flexPattern, "s");
        const match = value.match(regex);
        if (match) {
          newValue = value.replace(match[0], refinedText);
          matched = true;
        }
      }

      // Strategy 4: First-word...last-word loose match
      if (!matched) {
        const words = selectedText.split(/\s+/);
        if (words.length >= 2) {
          const first = words[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const last = words[words.length - 1].replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
          );
          const looseRegex = new RegExp(first + "[\\s\\S]*?" + last, "s");
          const looseMatch = value.match(looseRegex);
          if (looseMatch && looseMatch[0].length < selectedText.length * 3) {
            newValue = value.replace(looseMatch[0], refinedText);
            matched = true;
          }
        }
      }

      if (!matched) {
        alert(
          "Could not locate the selected text in the HTML source. Try selecting from the code editor instead.",
        );
        return;
      }

      onChange(newValue);
    }
    setSelectedText("");
    setRefinedText("");
    setPanelOpen(false);
  };

  // Enhance the entire page design via dedicated API
  const handleEnhanceDesign = async () => {
    if (!value || value.trim().length < 50) {
      alert("Generate some content first before enhancing the design.");
      return;
    }
    setIsEnhancing(true);
    try {
      const token = getAuthToken();
      const res = await fetch("http://127.0.0.1:8000/api/enhance-design/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
        body: JSON.stringify({
          html_content: value,
          content_type: contentType,
        }),
      });
      const data = await res.json();
      if (res.ok && data.enhanced_code) {
        onChange(data.enhanced_code);
      } else {
        if (res.status === 429) {
          const retryMsg = data.retry_after_seconds
            ? ` Retry in ${data.retry_after_seconds}s.`
            : "";
          alert(`Rate limited.${retryMsg}`);
        } else {
          alert(data.error || "Design enhancement failed.");
        }
      }
    } catch (err) {
      console.error("Enhance Error:", err);
      alert("Error connecting to AI service.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleDiscard = () => {
    setRefinedText("");
    setSelectedText("");
    setPanelOpen(false);
  };

  // ── Section Enhance Handlers ──
  const startSectionEnhance = () => {
    setStartPt(null);
    setEndPt(null);
    setMousePos(null);
    setCapturedHTML("");
    setEnhanceStep("fullscreen");
  };

  const cancelEnhance = () => {
    setEnhanceStep(null);
    setStartPt(null);
    setEndPt(null);
    setMousePos(null);
    setCapturedHTML("");
    setEnhanceInstructions("");
  };

  const beginMarking = () => {
    setStartPt(null);
    setEndPt(null);
    setMousePos(null);
    setEnhanceStep("marking");
  };

  const resetMarking = () => {
    setStartPt(null);
    setEndPt(null);
    setMousePos(null);
    setCapturedHTML("");
    setEnhanceInstructions("");
    setEnhanceStep("marking");
  };

  // Get position relative to the scroll container, accounting for scroll
  const getScrollPos = (e) => {
    const container = scrollContainerRef.current;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    return {
      x: e.clientX - rect.left + container.scrollLeft,
      y: e.clientY - rect.top + container.scrollTop,
    };
  };

  const handlePreviewClick = (e) => {
    if (enhanceStep === "marking" && !startPt) {
      // Place start point
      const pos = getScrollPos(e);
      setStartPt(pos);
      setEnhanceStep("placed");
    } else if (enhanceStep === "placed" && startPt) {
      // Place end point
      const pos = getScrollPos(e);
      setEndPt(pos);
      captureElementsInRect(startPt, pos);
    }
  };

  const handlePreviewMouseMove = (e) => {
    if (enhanceStep === "placed" && startPt) {
      const pos = getScrollPos(e);
      setMousePos(pos);
    }
  };

  // Calculate box from two points
  const getBox = (a, b) => {
    if (!a || !b) return null;
    return {
      x: Math.min(a.x, b.x),
      y: Math.min(a.y, b.y),
      w: Math.abs(a.x - b.x),
      h: Math.abs(a.y - b.y),
    };
  };

  const captureElementsInRect = (pt1, pt2) => {
    const iframe = enhanceIframeRef.current;
    if (!iframe) return;
    const box = getBox(pt1, pt2);
    if (!box || box.w < 10 || box.h < 10) {
      alert("Selection too small. Try clicking further apart.");
      setEndPt(null);
      return;
    }
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc || !doc.body) return;
      // The iframe is rendered at full height inside the scrollable container,
      // so the box coords already match the iframe's document coordinates.
      const sel = {
        left: box.x,
        top: box.y,
        right: box.x + box.w,
        bottom: box.y + box.h,
      };
      const allEls = Array.from(doc.body.querySelectorAll("*"));
      const hits = allEls.filter((el) => {
        const r = el.getBoundingClientRect();
        // getBoundingClientRect is relative to viewport of iframe,
        // but since iframe is not scrolled (it's full height), coords match.
        return (
          r.width > 0 &&
          r.height > 0 &&
          r.left < sel.right &&
          r.right > sel.left &&
          r.top < sel.bottom &&
          r.bottom > sel.top
        );
      });
      if (!hits.length) {
        alert(
          "No elements found in the selected area. Try a larger selection.",
        );
        setEndPt(null);
        return;
      }
      // Keep only top-level elements (filter out children)
      const topLevel = hits.filter(
        (el) => !hits.some((o) => o !== el && o.contains(el)),
      );

      // Find the best enclosing element
      let target;
      if (topLevel.length === 1) {
        target = topLevel[0];
      } else {
        target = topLevel[0];
        for (let i = 1; i < topLevel.length; i++) {
          while (target && !target.contains(topLevel[i]))
            target = target.parentElement;
        }
        if (!target || target === doc.body || target === doc.documentElement) {
          target = topLevel[0].parentElement || topLevel[0];
        }
      }

      const renderedHTML = target.outerHTML;

      // Find the matching source HTML by using the opening tag to locate it.
      // The browser's outerHTML may differ from source, so extract the opening
      // tag's key attributes (tag name + class) to search the source.
      const tagName = target.tagName.toLowerCase();
      const cls = target.getAttribute("class") || "";

      let sourceSection = "";
      if (cls) {
        // Build a regex to find the opening tag with this class in the source
        const escapedCls = cls.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        // Match <tagName ... class="cls" ...> ... </tagName>
        const openTagRx = new RegExp(
          `<${tagName}[^>]*class\\s*=\\s*["']${escapedCls}["'][^>]*>`,
          "si",
        );
        const openMatch = value.match(openTagRx);
        if (openMatch) {
          const startIdx = value.indexOf(openMatch[0]);
          // Find the matching closing tag, accounting for nesting
          let depth = 1;
          let i = startIdx + openMatch[0].length;
          const openRx = new RegExp(`<${tagName}[\\s>]`, "gi");
          const closeRx = new RegExp(`</${tagName}\\s*>`, "gi");
          while (depth > 0 && i < value.length) {
            openRx.lastIndex = i;
            closeRx.lastIndex = i;
            const nextOpen = openRx.exec(value);
            const nextClose = closeRx.exec(value);
            if (!nextClose) break;
            if (nextOpen && nextOpen.index < nextClose.index) {
              depth++;
              i = nextOpen.index + nextOpen[0].length;
            } else {
              depth--;
              if (depth === 0) {
                sourceSection = value.substring(
                  startIdx,
                  nextClose.index + nextClose[0].length,
                );
              }
              i = nextClose.index + nextClose[0].length;
            }
          }
        }
      }

      // Fallback: try exact match of rendered outerHTML
      if (!sourceSection && value.includes(renderedHTML)) {
        sourceSection = renderedHTML;
      }

      if (!sourceSection) {
        // Last resort: use the rendered HTML and warn
        sourceSection = renderedHTML;
      }

      setCapturedHTML(sourceSection);
      setEnhanceStep("confirming");
    } catch (err) {
      console.error("Capture error:", err);
      alert("Could not capture elements. Try again.");
      setEndPt(null);
    }
  };

  const handleEnhanceSection = async () => {
    if (!capturedHTML) return;
    setEnhanceStep("enhancing");
    try {
      const token = getAuthToken();
      const res = await fetch("http://127.0.0.1:8000/api/enhance-section/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
        body: JSON.stringify({
          html_content: capturedHTML,
          content_type: contentType,
          ...(enhanceInstructions.trim()
            ? { instructions: enhanceInstructions.trim() }
            : {}),
        }),
      });
      const data = await res.json();
      if (res.ok && data.enhanced_code) {
        let newVal = value;
        let matched = false;
        // Strategy 1: exact match
        if (value.includes(capturedHTML)) {
          newVal = value.replace(capturedHTML, data.enhanced_code);
          matched = true;
        }
        // Strategy 2: normalized whitespace
        if (!matched) {
          const norm = capturedHTML.replace(/\s+/g, " ").trim();
          const escaped = norm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const pat = escaped.split(" ").join("\\s+");
          const rx = new RegExp(pat, "s");
          const m = value.match(rx);
          if (m) {
            newVal = value.replace(m[0], data.enhanced_code);
            matched = true;
          }
        }
        // Strategy 3: flexible tag matching
        if (!matched) {
          const escaped = capturedHTML.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const flex = escaped.split(/\s+/).join("\\s*(?:<[^>]*>\\s*)*");
          const rx = new RegExp(flex, "s");
          const m = value.match(rx);
          if (m) {
            newVal = value.replace(m[0], data.enhanced_code);
            matched = true;
          }
        }
        if (!matched) {
          alert(
            "Could not locate the section in the source to replace. " +
              "The enhanced version has been copied to clipboard. " +
              "You can paste it manually.",
          );
          try {
            navigator.clipboard.writeText(data.enhanced_code);
          } catch (e) {}
          setEnhanceStep("confirming");
          return;
        }
        onChange(newVal);
        cancelEnhance();
      } else {
        if (res.status === 429) {
          const msg = data.retry_after_seconds
            ? ` Retry in ${data.retry_after_seconds}s.`
            : "";
          alert(`Rate limited.${msg}`);
        } else {
          alert(data.error || "Section enhancement failed.");
        }
        setEnhanceStep("confirming");
      }
    } catch (err) {
      console.error("Section Enhance Error:", err);
      alert("Error connecting to AI service.");
      setEnhanceStep("confirming");
    }
  };

  return (
    <div className="relative">
      {/* Enhance Design Buttons */}
      {value && value.trim().length > 50 && (
        <div className="mb-4 flex justify-end gap-3">
          <button
            onClick={startSectionEnhance}
            disabled={isEnhancing || !!enhanceStep}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}
          >
            <span>🎯</span>
            Enhance Section
          </button>
          <button
            onClick={handleEnhanceDesign}
            disabled={isEnhancing || !!enhanceStep}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}
          >
            {isEnhancing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Enhancing…
              </>
            ) : (
              <>
                <span>🎨</span>
                Enhance Full Page
              </>
            )}
          </button>
        </div>
      )}

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
            className="flex-1 overflow-hidden bg-slate-50/50 relative"
          >
            <iframe
              ref={iframeRef}
              srcDoc={value}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title="Live Preview"
            />
          </div>
        </div>
      </div>

      {/* Full-screen Section Enhance — rendered via portal */}
      {typeof document !== "undefined" &&
        ["fullscreen", "marking", "placed", "confirming"].includes(
          enhanceStep,
        ) &&
        createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              display: "flex",
              flexDirection: "column",
              background: "#0f172a",
            }}
          >
            {/* ── Top Toolbar ── */}
            <div
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 20px",
                background: "#1e293b",
                borderBottom: "1px solid #334155",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              {/* Left: step indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>🎯</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>
                  {enhanceStep === "fullscreen" &&
                    "Scroll to find the section, then click Start Marking"}
                  {enhanceStep === "marking" &&
                    "👆 Click on the FIRST corner of the area"}
                  {enhanceStep === "placed" &&
                    "👆 Now click on the OPPOSITE corner"}
                  {enhanceStep === "confirming" &&
                    "✅ Section captured! Enhance or redraw."}
                </span>
              </div>

              {/* Right: action buttons */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {/* Step: fullscreen browse → Start Marking */}
                {enhanceStep === "fullscreen" && (
                  <button
                    onClick={beginMarking}
                    style={{
                      padding: "9px 22px",
                      color: "#fff",
                      borderRadius: 12,
                      fontSize: 13,
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                      background: "linear-gradient(135deg, #f59e0b, #f97316)",
                    }}
                  >
                    📍 Start Marking
                  </button>
                )}

                {/* Step: marking / placed → Stop (cancel marking back to fullscreen) */}
                {(enhanceStep === "marking" || enhanceStep === "placed") && (
                  <button
                    onClick={() => {
                      setStartPt(null);
                      setEndPt(null);
                      setMousePos(null);
                      setEnhanceStep("fullscreen");
                    }}
                    style={{
                      padding: "9px 18px",
                      background: "#334155",
                      color: "#fff",
                      borderRadius: 12,
                      fontSize: 13,
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    ⏹ Stop Marking
                  </button>
                )}

                {/* Step: confirming → enhance / redraw */}
                {enhanceStep === "confirming" && (
                  <>
                    <div
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="text"
                        placeholder="e.g. make it darker, use blue theme... (optional)"
                        value={enhanceInstructions}
                        onChange={(e) => setEnhanceInstructions(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleEnhanceSection();
                          }
                        }}
                        style={{
                          width: 340,
                          padding: "8px 14px",
                          background: "#1e293b",
                          color: "#e2e8f0",
                          border: "1px solid rgba(148,163,184,0.25)",
                          borderRadius: 10,
                          fontSize: 13,
                          outline: "none",
                        }}
                      />
                    </div>
                    <button
                      onClick={handleEnhanceSection}
                      style={{
                        padding: "9px 22px",
                        color: "#fff",
                        borderRadius: 12,
                        fontSize: 13,
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                      }}
                    >
                      ✨{" "}
                      {enhanceInstructions.trim()
                        ? "Enhance with Instructions"
                        : "Auto Enhance"}
                    </button>
                    <button
                      onClick={resetMarking}
                      style={{
                        padding: "9px 18px",
                        background: "#334155",
                        color: "#fff",
                        borderRadius: 12,
                        fontSize: 13,
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      ↩ Redraw
                    </button>
                  </>
                )}

                {/* Always: Cancel */}
                <button
                  onClick={cancelEnhance}
                  style={{
                    padding: "9px 18px",
                    background: "rgba(239,68,68,0.15)",
                    color: "#fca5a5",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 700,
                    border: "1px solid rgba(239,68,68,0.25)",
                    cursor: "pointer",
                  }}
                >
                  ✕ Cancel
                </button>
                <span style={{ color: "#64748b", fontSize: 10, marginLeft: 4 }}>
                  Esc to cancel
                </span>
              </div>
            </div>

            {/* ── Scrollable Preview Area ── */}
            <div
              ref={scrollContainerRef}
              onClick={handlePreviewClick}
              onMouseMove={handlePreviewMouseMove}
              style={{
                flex: 1,
                overflow: "auto",
                position: "relative",
                cursor:
                  enhanceStep === "marking" || enhanceStep === "placed"
                    ? "crosshair"
                    : "default",
              }}
            >
              {/* Iframe rendered at full document height so user can scroll */}
              <iframe
                ref={enhanceIframeRef}
                srcDoc={`<style>html{overflow:hidden}body{margin:0}</style>${value}`}
                style={{
                  width: "100%",
                  minHeight: "200vh",
                  height: "100%",
                  border: "none",
                  display: "block",
                  pointerEvents: "none",
                }}
                sandbox="allow-scripts allow-same-origin"
                title="Enhance Preview"
                onLoad={() => {
                  // Auto-size iframe to content height
                  const iframe = enhanceIframeRef.current;
                  if (!iframe) return;
                  try {
                    const doc =
                      iframe.contentDocument || iframe.contentWindow?.document;
                    if (doc?.body) {
                      const h = Math.max(
                        doc.body.scrollHeight,
                        doc.documentElement.scrollHeight,
                        window.innerHeight,
                      );
                      iframe.style.height = h + "px";
                      iframe.style.minHeight = h + "px";
                    }
                  } catch (e) {}
                }}
              />

              {/* Start pin marker */}
              {startPt && (
                <div
                  style={{
                    position: "absolute",
                    left: startPt.x - 8,
                    top: startPt.y - 8,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#f59e0b",
                    border: "3px solid #fff",
                    boxShadow: "0 0 12px rgba(245,158,11,0.6)",
                    pointerEvents: "none",
                    zIndex: 10,
                  }}
                />
              )}

              {/* Live preview rectangle while placing second point */}
              {enhanceStep === "placed" &&
                startPt &&
                mousePos &&
                (() => {
                  const box = getBox(startPt, mousePos);
                  return box ? (
                    <div
                      style={{
                        position: "absolute",
                        left: box.x,
                        top: box.y,
                        width: box.w,
                        height: box.h,
                        border: "2px dashed #f59e0b",
                        borderRadius: 8,
                        backgroundColor: "rgba(245,158,11,0.1)",
                        pointerEvents: "none",
                        zIndex: 5,
                      }}
                    />
                  ) : null;
                })()}

              {/* Confirmed rectangle */}
              {enhanceStep === "confirming" &&
                startPt &&
                endPt &&
                (() => {
                  const box = getBox(startPt, endPt);
                  return box ? (
                    <div
                      style={{
                        position: "absolute",
                        left: box.x,
                        top: box.y,
                        width: box.w,
                        height: box.h,
                        border: "3px solid #8b5cf6",
                        borderRadius: 10,
                        backgroundColor: "rgba(139,92,246,0.12)",
                        boxShadow:
                          "0 0 30px rgba(139,92,246,0.3), inset 0 0 20px rgba(139,92,246,0.05)",
                        pointerEvents: "none",
                        zIndex: 5,
                      }}
                    />
                  ) : null;
                })()}

              {/* Center hint when in fullscreen browse mode */}
              {enhanceStep === "fullscreen" && (
                <div
                  style={{
                    position: "fixed",
                    bottom: 32,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(0,0,0,0.75)",
                    color: "#fff",
                    padding: "14px 28px",
                    borderRadius: 16,
                    fontSize: 14,
                    fontWeight: 500,
                    backdropFilter: "blur(8px)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    zIndex: 20,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  }}
                >
                  <span style={{ fontSize: 20 }}>👀</span>
                  Scroll to browse your page, then click{" "}
                  <strong style={{ color: "#fbbf24" }}>Start Marking</strong> in
                  the toolbar
                </div>
              )}

              {/* Hint when marking first point */}
              {enhanceStep === "marking" && (
                <div
                  style={{
                    position: "fixed",
                    bottom: 32,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(245,158,11,0.9)",
                    color: "#fff",
                    padding: "12px 24px",
                    borderRadius: 14,
                    fontSize: 14,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    zIndex: 20,
                    boxShadow: "0 8px 32px rgba(245,158,11,0.4)",
                  }}
                >
                  <span style={{ fontSize: 18 }}>📍</span>
                  Click on the FIRST corner of the section
                </div>
              )}

              {/* Hint when placing second point */}
              {enhanceStep === "placed" && (
                <div
                  style={{
                    position: "fixed",
                    bottom: 32,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(99,102,241,0.9)",
                    color: "#fff",
                    padding: "12px 24px",
                    borderRadius: 14,
                    fontSize: 14,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    zIndex: 20,
                    boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
                  }}
                >
                  <span style={{ fontSize: 18 }}>📐</span>
                  Now click on the OPPOSITE corner to complete selection
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}

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
                <textarea
                  value={refinedText}
                  onChange={(e) => setRefinedText(e.target.value)}
                  className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-slate-800 leading-relaxed resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                  rows={4}
                />
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

      {/* ── Enhancing spinner modal ── */}
      {typeof document !== "undefined" &&
        enhanceStep === "enhancing" &&
        createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
            }}
          >
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center">
              <div
                className="w-14 h-14 mx-auto mb-4 rounded-full animate-spin"
                style={{
                  border: "3px solid #e9d5ff",
                  borderTopColor: "#7c3aed",
                }}
              />
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Enhancing Section…
              </h3>
              <p className="text-slate-500 text-sm">
                AI is improving the selected design
              </p>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
