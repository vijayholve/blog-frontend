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
  const [capturedSourceRange, setCapturedSourceRange] = useState(null); // {start, end} indices in source
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

  // Escape to cancel section enhance (not during enhancing)
  useEffect(() => {
    if (!enhanceStep) return;
    const onKey = (e) => {
      if (e.key === "Escape" && enhanceStep !== "enhancing") cancelEnhance();
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
    setCapturedSourceRange(null);
    setEnhanceStep("fullscreen");
  };

  const cancelEnhance = () => {
    setEnhanceStep(null);
    setStartPt(null);
    setEndPt(null);
    setMousePos(null);
    setCapturedHTML("");
    setCapturedSourceRange(null);
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
    setCapturedSourceRange(null);
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

  // Helper: find source section and its indices from a rendered DOM element
  const findSourceSection = (target, tagName, sourceValue) => {
    const cls = target.getAttribute("class") || "";
    const id = target.getAttribute("id") || "";

    // Strategy 1: Match by id (most reliable)
    if (id) {
      const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const idRx = new RegExp(
        `<${tagName}[^>]*\\bid\\s*=\\s*["']${escapedId}["'][^>]*>`,
        "si",
      );
      const range = findClosingTag(idRx, tagName, sourceValue);
      if (range) return range;
    }

    // Strategy 2: Match by class
    if (cls) {
      // Try each class individually for more flexible matching
      const classes = cls.split(/\s+/).filter(Boolean);
      // Try matching by all classes first
      const escapedCls = cls.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const exactClassRx = new RegExp(
        `<${tagName}[^>]*class\\s*=\\s*["']${escapedCls}["'][^>]*>`,
        "si",
      );
      let range = findClosingTag(exactClassRx, tagName, sourceValue);
      if (range) return range;

      // Try matching where class contains the key classes (flexible order)
      if (classes.length >= 2) {
        // Build a regex that matches a tag containing at least 2 distinctive classes
        const distinctClasses = classes.filter((c) => c.length > 3).slice(0, 3);
        if (distinctClasses.length >= 1) {
          const classPatterns = distinctClasses.map((c) =>
            c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          );
          // Match tag where class attribute contains all these classes (any order)
          const lookaheads = classPatterns
            .map((p) => `(?=[^"']*${p})`)
            .join("");
          const flexClassRx = new RegExp(
            `<${tagName}[^>]*class\\s*=\\s*["']${lookaheads}[^"']*["'][^>]*>`,
            "si",
          );
          range = findClosingTag(flexClassRx, tagName, sourceValue);
          if (range) return range;
        }
      }
    }

    // Strategy 3: Match by inline style attribute
    const style = target.getAttribute("style") || "";
    if (style && style.length > 5) {
      const escapedStyle = style
        .substring(0, 40)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const styleRx = new RegExp(
        `<${tagName}[^>]*style\\s*=\\s*["'][^"']*${escapedStyle}[^"']*["'][^>]*>`,
        "si",
      );
      const range = findClosingTag(styleRx, tagName, sourceValue);
      if (range) return range;
    }

    // Strategy 4: Match by inner text content — find a unique text snippet
    const textContent = target.textContent?.trim() || "";
    if (textContent.length > 10) {
      // Take first 60 chars of text, find the tag containing it
      const snippet = textContent
        .substring(0, 60)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\s+/g, "\\s+");
      // Find the innermost tag of our tagName that contains this text
      const allTagRx = new RegExp(`<${tagName}[^>]*>`, "gi");
      let match;
      while ((match = allTagRx.exec(sourceValue)) !== null) {
        const range = findClosingTagFromIndex(
          tagName,
          sourceValue,
          match.index,
          match[0].length,
        );
        if (range) {
          const sectionText = sourceValue.substring(range.start, range.end);
          const textRx = new RegExp(snippet, "si");
          if (textRx.test(sectionText)) {
            return { section: sectionText, start: range.start, end: range.end };
          }
        }
      }
    }

    // Strategy 5: exact outerHTML match
    const rendered = target.outerHTML;
    const idx = sourceValue.indexOf(rendered);
    if (idx !== -1) {
      return { section: rendered, start: idx, end: idx + rendered.length };
    }

    return null;
  };

  // Find closing tag and return {section, start, end}
  const findClosingTag = (openTagRx, tagName, sourceValue) => {
    const openMatch = sourceValue.match(openTagRx);
    if (!openMatch) return null;
    const startIdx = sourceValue.indexOf(openMatch[0]);
    if (startIdx === -1) return null;
    return findClosingTagFromIndex(
      tagName,
      sourceValue,
      startIdx,
      openMatch[0].length,
    );
  };

  const findClosingTagFromIndex = (
    tagName,
    sourceValue,
    startIdx,
    openTagLen,
  ) => {
    let depth = 1;
    let i = startIdx + openTagLen;
    // Self-closing tags
    const selfClosing = [
      "br",
      "hr",
      "img",
      "input",
      "meta",
      "link",
      "area",
      "base",
      "col",
      "embed",
      "source",
      "track",
      "wbr",
    ];
    if (selfClosing.includes(tagName.toLowerCase())) {
      const endIdx = startIdx + openTagLen;
      return {
        section: sourceValue.substring(startIdx, endIdx),
        start: startIdx,
        end: endIdx,
      };
    }
    const openRx = new RegExp(`<${tagName}[\\s>/]`, "gi");
    const closeRx = new RegExp(`</${tagName}\\s*>`, "gi");
    while (depth > 0 && i < sourceValue.length) {
      openRx.lastIndex = i;
      closeRx.lastIndex = i;
      const nextOpen = openRx.exec(sourceValue);
      const nextClose = closeRx.exec(sourceValue);
      if (!nextClose) break;
      if (nextOpen && nextOpen.index < nextClose.index) {
        depth++;
        i = nextOpen.index + nextOpen[0].length;
      } else {
        depth--;
        if (depth === 0) {
          const endIdx = nextClose.index + nextClose[0].length;
          return {
            section: sourceValue.substring(startIdx, endIdx),
            start: startIdx,
            end: endIdx,
          };
        }
        i = nextClose.index + nextClose[0].length;
      }
    }
    return null;
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
      const sel = {
        left: box.x,
        top: box.y,
        right: box.x + box.w,
        bottom: box.y + box.h,
      };
      const allEls = Array.from(doc.body.querySelectorAll("*"));
      const hits = allEls.filter((el) => {
        const r = el.getBoundingClientRect();
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

      const tagName = target.tagName.toLowerCase();

      // Try to find the source section and its position
      let result = findSourceSection(target, tagName, value);

      // If no match, try parent element
      if (
        !result &&
        target.parentElement &&
        target.parentElement !== doc.body
      ) {
        const parentTag = target.parentElement.tagName.toLowerCase();
        result = findSourceSection(target.parentElement, parentTag, value);
      }

      if (result) {
        setCapturedHTML(result.section);
        setCapturedSourceRange({ start: result.start, end: result.end });
      } else {
        // Last resort: use rendered HTML (may not match for replacement)
        const rendered = target.outerHTML;
        setCapturedHTML(rendered);
        // Try to find it in source for the range
        const idx = value.indexOf(rendered);
        if (idx !== -1) {
          setCapturedSourceRange({ start: idx, end: idx + rendered.length });
        } else {
          setCapturedSourceRange(null);
        }
      }

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
      // Build instructions — always include "preserve existing color scheme" unless user specifies colors
      let finalInstructions = enhanceInstructions.trim();
      const mentionsColor =
        /colou?r|theme|background|bg|gradient|dark|light|blue|red|green/i.test(
          finalInstructions,
        );
      if (!mentionsColor) {
        finalInstructions =
          (finalInstructions ? finalInstructions + ". " : "") +
          "IMPORTANT: Preserve the existing color scheme and background colors. Do NOT change the overall color palette or add new background colors.";
      }

      const res = await fetch("http://127.0.0.1:8000/api/enhance-section/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
        body: JSON.stringify({
          html_content: capturedHTML,
          content_type: contentType,
          instructions: finalInstructions,
        }),
      });
      const data = await res.json();
      if (res.ok && data.enhanced_code) {
        let newVal = value;
        let matched = false;

        // Strategy 1: Use stored source range (most reliable)
        if (capturedSourceRange) {
          const { start, end } = capturedSourceRange;
          // Verify the source hasn't changed since capture
          const currentSection = value.substring(start, end);
          if (currentSection === capturedHTML) {
            newVal =
              value.substring(0, start) +
              data.enhanced_code +
              value.substring(end);
            matched = true;
          }
        }

        // Strategy 2: exact string match
        if (!matched && value.includes(capturedHTML)) {
          newVal = value.replace(capturedHTML, data.enhanced_code);
          matched = true;
        }

        // Strategy 3: normalized whitespace
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

        // Strategy 4: flexible tag matching
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

        // Strategy 5: Use source range even if content slightly changed (fuzzy)
        if (!matched && capturedSourceRange) {
          const { start, end } = capturedSourceRange;
          if (start >= 0 && end <= value.length && start < end) {
            newVal =
              value.substring(0, start) +
              data.enhanced_code +
              value.substring(end);
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
        // Stay in fullscreen so user can see the result
        setStartPt(null);
        setEndPt(null);
        setMousePos(null);
        setCapturedHTML("");
        setCapturedSourceRange(null);
        setEnhanceInstructions("");
        setEnhanceStep("fullscreen");
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
        ["fullscreen", "marking", "placed", "confirming", "enhancing"].includes(
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
              background: "#ffffff",
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
                  {enhanceStep === "enhancing" &&
                    "⏳ AI is enhancing the selected section…"}
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

                {/* Enhancing step: show spinner in toolbar */}
                {enhanceStep === "enhancing" && (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    <span
                      style={{
                        color: "#a5b4fc",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      Processing…
                    </span>
                  </div>
                )}

                {/* Always: Cancel (disabled during enhancing) */}
                <button
                  onClick={cancelEnhance}
                  disabled={enhanceStep === "enhancing"}
                  style={{
                    padding: "9px 18px",
                    background: "rgba(239,68,68,0.15)",
                    color: "#fca5a5",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 700,
                    border: "1px solid rgba(239,68,68,0.25)",
                    cursor:
                      enhanceStep === "enhancing" ? "not-allowed" : "pointer",
                    opacity: enhanceStep === "enhancing" ? 0.4 : 1,
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
                background: "#fff",
                cursor:
                  enhanceStep === "marking" || enhanceStep === "placed"
                    ? "crosshair"
                    : "default",
              }}
            >
              {/* Iframe rendered at full document height so user can scroll */}
              <iframe
                ref={enhanceIframeRef}
                srcDoc={`<style>html{overflow:hidden}body{margin:0;background:#fff}</style>${value}`}
                style={{
                  width: "100%",
                  minHeight: "200vh",
                  height: "100%",
                  border: "none",
                  display: "block",
                  pointerEvents: "none",
                  background: "#fff",
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

              {/* Confirmed rectangle (visible during confirming and enhancing) */}
              {(enhanceStep === "confirming" || enhanceStep === "enhancing") &&
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

              {/* Enhancing overlay — shows AI working animation over the selected area */}
              {enhanceStep === "enhancing" &&
                (() => {
                  const box = startPt && endPt ? getBox(startPt, endPt) : null;
                  return (
                    <>
                      {/* Semi-transparent overlay on entire page */}
                      <div
                        style={{
                          position: "fixed",
                          inset: 0,
                          background: "rgba(0,0,0,0.3)",
                          backdropFilter: "blur(2px)",
                          zIndex: 25,
                          pointerEvents: "none",
                        }}
                      />

                      {/* Glowing border around the selected area */}
                      {box && (
                        <div
                          style={{
                            position: "absolute",
                            left: box.x - 4,
                            top: box.y - 4,
                            width: box.w + 8,
                            height: box.h + 8,
                            border: "3px solid #8b5cf6",
                            borderRadius: 14,
                            zIndex: 30,
                            pointerEvents: "none",
                            animation: "enhancePulse 2s ease-in-out infinite",
                            boxShadow:
                              "0 0 40px rgba(139,92,246,0.4), inset 0 0 40px rgba(139,92,246,0.05)",
                          }}
                        >
                          {/* Scanning line animation */}
                          <div
                            style={{
                              position: "absolute",
                              left: 0,
                              right: 0,
                              height: 3,
                              background:
                                "linear-gradient(90deg, transparent, #8b5cf6, #a78bfa, #8b5cf6, transparent)",
                              borderRadius: 2,
                              animation: "scanLine 2s ease-in-out infinite",
                              opacity: 0.8,
                            }}
                          />
                        </div>
                      )}

                      {/* AI Working card — positioned below the selection */}
                      <div
                        style={{
                          position: box ? "absolute" : "fixed",
                          ...(box
                            ? {
                                left: Math.max(10, box.x + box.w / 2 - 175),
                                top: box.y + box.h + 20,
                              }
                            : {
                                bottom: 40,
                                left: "50%",
                                transform: "translateX(-50%)",
                              }),
                          width: 350,
                          background: "#1e293b",
                          borderRadius: 16,
                          padding: "16px 20px",
                          zIndex: 35,
                          pointerEvents: "none",
                          boxShadow:
                            "0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.3)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            marginBottom: 12,
                          }}
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg, #7c3aed, #6366f1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <span style={{ fontSize: 18 }}>✨</span>
                          </div>
                          <div>
                            <div
                              style={{
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: 14,
                              }}
                            >
                              AI is enhancing this section
                            </div>
                            <div
                              style={{
                                color: "#94a3b8",
                                fontSize: 12,
                                marginTop: 2,
                              }}
                            >
                              Improving layout, spacing & design…
                            </div>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div
                          style={{
                            height: 4,
                            background: "rgba(139,92,246,0.15)",
                            borderRadius: 4,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              background:
                                "linear-gradient(90deg, #7c3aed, #a78bfa, #7c3aed)",
                              borderRadius: 4,
                              animation:
                                "progressSlide 2s ease-in-out infinite",
                              width: "40%",
                            }}
                          />
                        </div>

                        {/* Enhancement steps indicator */}
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            marginTop: 10,
                            flexWrap: "wrap",
                          }}
                        >
                          {["Layout", "Spacing", "Typography", "Effects"].map(
                            (step, i) => (
                              <div
                                key={step}
                                style={{
                                  padding: "3px 10px",
                                  borderRadius: 8,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  background: "rgba(139,92,246,0.15)",
                                  color: "#a78bfa",
                                  animation: `fadeStep 2.5s ease-in-out infinite`,
                                  animationDelay: `${i * 0.5}s`,
                                }}
                              >
                                {step}
                              </div>
                            ),
                          )}
                        </div>
                      </div>

                      <style>{`
                      @keyframes spin { to { transform: rotate(360deg) } }
                      @keyframes enhancePulse {
                        0%, 100% { border-color: #8b5cf6; box-shadow: 0 0 30px rgba(139,92,246,0.3); }
                        50% { border-color: #a78bfa; box-shadow: 0 0 50px rgba(139,92,246,0.5); }
                      }
                      @keyframes scanLine {
                        0% { top: 0; opacity: 0; }
                        10% { opacity: 0.8; }
                        90% { opacity: 0.8; }
                        100% { top: calc(100% - 3px); opacity: 0; }
                      }
                      @keyframes progressSlide {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(350%); }
                      }
                      @keyframes fadeStep {
                        0%, 100% { opacity: 0.4; }
                        30%, 70% { opacity: 1; background: rgba(139,92,246,0.3); }
                      }
                    `}</style>
                    </>
                  );
                })()}
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
    </div>
  );
}
