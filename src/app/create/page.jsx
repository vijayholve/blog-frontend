// src/app/create/page.jsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import CreatePostWorkspace from "@/components/CreatePostWorkspace";
import CreateFullscreenWorkspace from "@/components/CreateFullscreenWorkspace";
import { PREVIEW_STYLES } from "@/components/previewStyles";
import { getAuthToken } from "@/lib/authApi";
function extractJsonBlock(text, key) {
  try {
    const regex = new RegExp(`${key}:\\s*({[\\s\\S]*?})`);
    const match = text.match(regex);
    return match ? JSON.parse(match[1]) : null;
  } catch (e) {
    return null;
  }
}
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
  const [showGraphicalExamples, setShowGraphicalExamples] = useState(false);
  const [previewStyle, setPreviewStyle] = useState("editorial");
  const [seoMetaData, setSeoMetaData] = useState({
    meta_title: "",
    meta_description: "",
    keywords: [],
  });
  const [seoJsonLdText, setSeoJsonLdText] = useState("{}");
  const router = useRouter();

  const previewStyles = PREVIEW_STYLES;

  // ── Fullscreen AI Refine state ──
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
  const [fsSelectedText, setFsSelectedText] = useState("");
  const [fsSelStart, setFsSelStart] = useState(0);
  const [fsSelEnd, setFsSelEnd] = useState(0);
  const [fsSelSource, setFsSelSource] = useState("code");
  const [fsRefinedText, setFsRefinedText] = useState("");
  const [fsIsRefining, setFsIsRefining] = useState(false);
  const [fsActiveCmd, setFsActiveCmd] = useState("");
  const [fsPanelOpen, setFsPanelOpen] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [fsSidebarOpen, setFsSidebarOpen] = useState(true);
  const [sectionMode, setSectionMode] = useState("idle"); // idle | marking | placed | enhancing
  const [selRect, setSelRect] = useState(null);
  const [selStartPt, setSelStartPt] = useState(null);
  const [capturedSectionHTML, setCapturedSectionHTML] = useState("");
  const [capturedSectionRange, setCapturedSectionRange] = useState(null);
  const [isEnhancingSection, setIsEnhancingSection] = useState(false);
  const [enhanceSectionInstr, setEnhanceSectionInstr] = useState("");
  const fsCodeRef = useRef(null);
  const fsPreviewIframeRef = useRef(null);
  const graphicalFsIframeRef = useRef(null);
  const sectionOverlayRef = useRef(null);

  // Helper to attach mouseup listener inside an iframe document
  const attachFsIframeMouseup = useCallback((iframe) => {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc || !doc.body) return;
      if (doc.__mouseupAttached) return;
      doc.__mouseupAttached = true;
      doc.addEventListener("mouseup", () => {
        const sel = iframe.contentWindow.getSelection();
        if (!sel || sel.isCollapsed) return;
        const text = sel.toString().trim();
        if (text && text.length > 2) {
          setFsSelectedText(text);
          setFsSelSource("preview");
          setFsRefinedText("");
          setFsPanelOpen(true);
        }
      });
    } catch (e) {
      // cross-origin guard
    }
  }, []);

  // Attach mouseup listener inside the fullscreen preview iframe for text selection
  useEffect(() => {
    if (fullscreenTab !== "preview") return;
    const iframeEl = fsPreviewIframeRef.current;

    // Small delay to let React render the iframe element first
    const timer = setTimeout(() => {
      const iframe = fsPreviewIframeRef.current;
      if (!iframe) return;

      const onLoad = () => attachFsIframeMouseup(iframe);
      iframe.addEventListener("load", onLoad);

      // Also try immediately in case iframe already loaded
      if (iframe.contentDocument?.body) {
        attachFsIframeMouseup(iframe);
      }

      // Store cleanup ref
      iframe.__cleanupLoad = onLoad;
    }, 50);

    return () => {
      clearTimeout(timer);
      if (iframeEl && iframeEl.__cleanupLoad) {
        iframeEl.removeEventListener("load", iframeEl.__cleanupLoad);
      }
    };
  }, [content, fullscreenTab, attachFsIframeMouseup]);

  const handleFsCodeSelect = useCallback(() => {
    const ta = fsCodeRef.current;
    if (!ta) return;
    const text = content.substring(ta.selectionStart, ta.selectionEnd).trim();
    if (text && text.length > 2) {
      setFsSelectedText(text);
      setFsSelStart(ta.selectionStart);
      setFsSelEnd(ta.selectionEnd);
      setFsSelSource("code");
      setFsRefinedText("");
      setFsPanelOpen(true);
    }
  }, [content]);

  // Fullscreen preview text selection is now handled via useEffect on the iframe's contentDocument

  const handleFsRefine = async (command) => {
    if (!fsSelectedText) return;

    // "Change" = let user edit directly, no API call
    if (command === "change") {
      setFsRefinedText(fsSelectedText);
      return;
    }

    setFsIsRefining(true);
    setFsActiveCmd(command);
    setFsRefinedText("");
    const token = getAuthToken();
    try {
      const res = await fetch("http://127.0.0.1:8000/api/refine-text/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
        body: JSON.stringify({ text_snippet: fsSelectedText, command }),
      });
      const data = await res.json();
      if (res.ok) {
        setFsRefinedText(data.refined_text || "");
      } else {
        alert(data.error || "Refine failed");
      }
    } catch (err) {
      alert("Error connecting to AI service.");
    } finally {
      setFsIsRefining(false);
      setFsActiveCmd("");
    }
  };

  const handleFsApply = () => {
    if (!fsRefinedText) return;
    if (fsSelSource === "code") {
      setContent(
        content.substring(0, fsSelStart) +
          fsRefinedText +
          content.substring(fsSelEnd),
      );
    } else {
      // Smart replace for preview selections
      let newContent = content;
      let matched = false;

      // Strategy 1: Exact match
      if (content.includes(fsSelectedText)) {
        newContent = content.replace(fsSelectedText, fsRefinedText);
        matched = true;
      }

      // Strategy 2: Normalized whitespace match
      if (!matched) {
        const normalizedSelected = fsSelectedText.replace(/\s+/g, " ").trim();
        const escapedNorm = normalizedSelected.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&",
        );
        const wsFlexPattern = escapedNorm.split(" ").join("\\s+");
        const wsRegex = new RegExp(wsFlexPattern, "s");
        const wsMatch = content.match(wsRegex);
        if (wsMatch) {
          newContent = content.replace(wsMatch[0], fsRefinedText);
          matched = true;
        }
      }

      // Strategy 3: Allow HTML tags between words
      if (!matched) {
        const escaped = fsSelectedText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const flexPattern = escaped.split(/\s+/).join("\\s*(?:<[^>]*>\\s*)*");
        const regex = new RegExp(flexPattern, "s");
        const match = content.match(regex);
        if (match) {
          newContent = content.replace(match[0], fsRefinedText);
          matched = true;
        }
      }

      // Strategy 4: First-word...last-word loose match
      if (!matched) {
        const words = fsSelectedText.split(/\s+/);
        if (words.length >= 2) {
          const first = words[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const last = words[words.length - 1].replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
          );
          const looseRegex = new RegExp(first + "[\\s\\S]*?" + last, "s");
          const looseMatch = content.match(looseRegex);
          if (looseMatch && looseMatch[0].length < fsSelectedText.length * 3) {
            newContent = content.replace(looseMatch[0], fsRefinedText);
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

      setContent(newContent);
    }
    setFsSelectedText("");
    setFsRefinedText("");
    setFsPanelOpen(false);
  };

  const handleFsDiscard = () => {
    setFsSelectedText("");
    setFsRefinedText("");
    setFsPanelOpen(false);
  };

  // ── Section Enhance helpers (fullscreen) ──
  const findClosingTagFs = (tagName, source, startIdx, openLen) => {
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
      return {
        section: source.substring(startIdx, startIdx + openLen),
        start: startIdx,
        end: startIdx + openLen,
      };
    }
    let depth = 1,
      i = startIdx + openLen;
    const openRx = new RegExp(`<${tagName}[\\s>/]`, "gi");
    const closeRx = new RegExp(`</${tagName}\\s*>`, "gi");
    while (depth > 0 && i < source.length) {
      openRx.lastIndex = i;
      closeRx.lastIndex = i;
      const nextOpen = openRx.exec(source);
      const nextClose = closeRx.exec(source);
      if (!nextClose) break;
      if (nextOpen && nextOpen.index < nextClose.index) {
        depth++;
        i = nextOpen.index + nextOpen[0].length;
      } else {
        depth--;
        if (depth === 0) {
          const end = nextClose.index + nextClose[0].length;
          return {
            section: source.substring(startIdx, end),
            start: startIdx,
            end,
          };
        }
        i = nextClose.index + nextClose[0].length;
      }
    }
    return null;
  };

  const findSourceSectionFs = (target, tagName, sourceValue) => {
    // Strategy 1: Match by id (most reliable)
    if (target.id) {
      const rx = new RegExp(
        `<${tagName}[^>]*\\bid=["']${target.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`,
        "i",
      );
      const m = sourceValue.match(rx);
      if (m) {
        const r = findClosingTagFs(tagName, sourceValue, m.index, m[0].length);
        if (r) return r;
      }
    }

    // Strategy 2: Match by class (exact then flexible)
    if (target.className && typeof target.className === "string") {
      const cls = target.className.trim();
      if (cls) {
        // Try exact class match first
        const escapedCls = cls.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const exactRx = new RegExp(
          `<${tagName}[^>]*class\\s*=\\s*["']${escapedCls}["'][^>]*>`,
          "si",
        );
        let m = sourceValue.match(exactRx);
        if (m) {
          const r = findClosingTagFs(
            tagName,
            sourceValue,
            m.index,
            m[0].length,
          );
          if (r) return r;
        }

        // Try each distinctive class individually
        const classes = cls.split(/\s+/).filter((c) => c.length > 3);
        for (const c of classes.slice(0, 4)) {
          const escapedC = c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const flexRx = new RegExp(
            `<${tagName}[^>]*class\\s*=\\s*["'][^"']*\\b${escapedC}\\b[^"']*["'][^>]*>`,
            "i",
          );
          m = sourceValue.match(flexRx);
          if (m) {
            const r = findClosingTagFs(
              tagName,
              sourceValue,
              m.index,
              m[0].length,
            );
            if (r) return r;
          }
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
      const m = sourceValue.match(styleRx);
      if (m) {
        const r = findClosingTagFs(tagName, sourceValue, m.index, m[0].length);
        if (r) return r;
      }
    }

    // Strategy 4: Match by text content
    const text = target.textContent?.trim() || "";
    if (text.length > 10) {
      const snippet = text
        .substring(0, 60)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\s+/g, "\\s+");
      const allRx = new RegExp(`<${tagName}[^>]*>`, "gi");
      let m;
      while ((m = allRx.exec(sourceValue))) {
        const r = findClosingTagFs(tagName, sourceValue, m.index, m[0].length);
        if (r && new RegExp(snippet, "si").test(r.section)) return r;
      }
    }

    // Strategy 5: exact outerHTML match
    const html = target.outerHTML;
    const idx = sourceValue.indexOf(html);
    if (idx !== -1)
      return { section: html, start: idx, end: idx + html.length };
    return null;
  };

  const startSectionEnhance = () => {
    if (!content || content.trim().length < 50) {
      alert("Generate some content first.");
      return;
    }
    setFullscreenTab("preview");
    setSectionMode("marking");
    setSelRect(null);
    setSelStartPt(null);
    setCapturedSectionHTML("");
    setCapturedSectionRange(null);
    setEnhanceSectionInstr("");
  };

  const cancelSectionEnhance = () => {
    setSectionMode("idle");
    setSelRect(null);
    setSelStartPt(null);
    setCapturedSectionHTML("");
    setCapturedSectionRange(null);
    setEnhanceSectionInstr("");
  };

  const handleOverlayMouseDown = (e) => {
    if (sectionMode !== "marking") return;
    const r = sectionOverlayRef.current.getBoundingClientRect();
    setSelStartPt({ x: e.clientX - r.left, y: e.clientY - r.top });
    setSelRect(null);
  };

  const handleOverlayMouseMove = (e) => {
    if (!selStartPt || sectionMode !== "marking") return;
    const r = sectionOverlayRef.current.getBoundingClientRect();
    const cx = e.clientX - r.left,
      cy = e.clientY - r.top;
    setSelRect({
      x: Math.min(selStartPt.x, cx),
      y: Math.min(selStartPt.y, cy),
      w: Math.abs(cx - selStartPt.x),
      h: Math.abs(cy - selStartPt.y),
    });
  };

  const handleOverlayMouseUp = () => {
    if (sectionMode !== "marking") return;
    setSelStartPt(null);
    if (!selRect || selRect.w < 20 || selRect.h < 20) {
      setSelRect(null);
      return;
    }
    const iframe = fsPreviewIframeRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc || !doc.body) return;
      const sel = {
        left: selRect.x,
        top: selRect.y,
        right: selRect.x + selRect.w,
        bottom: selRect.y + selRect.h,
      };
      // Account for iframe scroll offset so coordinates match
      const scrollX = iframe.contentWindow?.scrollX || 0;
      const scrollY = iframe.contentWindow?.scrollY || 0;
      const hits = Array.from(doc.body.querySelectorAll("*")).filter((el) => {
        const r = el.getBoundingClientRect();
        const elLeft = r.left + scrollX;
        const elTop = r.top + scrollY;
        const elRight = r.right + scrollX;
        const elBottom = r.bottom + scrollY;
        return (
          r.width > 0 &&
          r.height > 0 &&
          elLeft < sel.right &&
          elRight > sel.left &&
          elTop < sel.bottom &&
          elBottom > sel.top
        );
      });
      if (!hits.length) {
        alert("No elements found. Try a larger selection.");
        setSelRect(null);
        return;
      }
      const topLevel = hits.filter(
        (el) => !hits.some((o) => o !== el && o.contains(el)),
      );

      // Blocklist: never capture these as the target
      const isBlocklisted = (el) => {
        if (!el) return true;
        const tag = el.tagName.toLowerCase();
        return (
          tag === "body" ||
          tag === "html" ||
          tag === "main" ||
          el === doc.body ||
          el === doc.documentElement
        );
      };

      let target = topLevel[0];
      if (topLevel.length > 1) {
        for (let i = 1; i < topLevel.length; i++) {
          while (target && !target.contains(topLevel[i]))
            target = target.parentElement;
        }
        if (isBlocklisted(target)) {
          target = topLevel[0];
        }
      }

      // Safety: if target is still blocklisted, pick the best overlapping child
      if (isBlocklisted(target)) {
        target = topLevel[0];
      }
      if (isBlocklisted(target)) {
        const children = Array.from(target.children);
        const overlapping = children.filter((ch) => {
          const r = ch.getBoundingClientRect();
          const elLeft = r.left + scrollX;
          const elTop = r.top + scrollY;
          const elRight = r.right + scrollX;
          const elBottom = r.bottom + scrollY;
          return (
            r.width > 0 &&
            r.height > 0 &&
            elLeft < sel.right &&
            elRight > sel.left &&
            elTop < sel.bottom &&
            elBottom > sel.top
          );
        });
        if (overlapping.length === 1) {
          target = overlapping[0];
        } else if (overlapping.length > 1) {
          target = overlapping.reduce((best, el) => {
            const r = el.getBoundingClientRect();
            const ox = Math.max(
              0,
              Math.min(r.right + scrollX, sel.right) -
                Math.max(r.left + scrollX, sel.left),
            );
            const oy = Math.max(
              0,
              Math.min(r.bottom + scrollY, sel.bottom) -
                Math.max(r.top + scrollY, sel.top),
            );
            const area = ox * oy;
            const br = best.getBoundingClientRect();
            const bx = Math.max(
              0,
              Math.min(br.right + scrollX, sel.right) -
                Math.max(br.left + scrollX, sel.left),
            );
            const by = Math.max(
              0,
              Math.min(br.bottom + scrollY, sel.bottom) -
                Math.max(br.top + scrollY, sel.top),
            );
            return area > bx * by ? el : best;
          }, overlapping[0]);
        }
      }

      const tagName = target.tagName.toLowerCase();
      let result = findSourceSectionFs(target, tagName, content);
      // Walk up the DOM tree trying multiple parent levels
      if (!result) {
        let parent = target.parentElement;
        for (
          let level = 0;
          level < 4 &&
          parent &&
          parent !== doc.body &&
          parent !== doc.documentElement;
          level++
        ) {
          result = findSourceSectionFs(
            parent,
            parent.tagName.toLowerCase(),
            content,
          );
          if (result) break;
          parent = parent.parentElement;
        }
      }
      if (result) {
        setCapturedSectionHTML(result.section);
        setCapturedSectionRange({ start: result.start, end: result.end });
      } else {
        // Fallback: use rendered HTML but find approximate range in source
        const html = target.outerHTML;
        setCapturedSectionHTML(html);
        let idx = content.indexOf(html);
        if (idx !== -1) {
          setCapturedSectionRange({ start: idx, end: idx + html.length });
        } else {
          // Use a text snippet to locate the approximate section
          const textSnippet = (target.textContent || "")
            .trim()
            .substring(0, 80);
          if (textSnippet.length > 10) {
            const escapedSnippet = textSnippet
              .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
              .replace(/\s+/g, "\\s+");
            const snippetRx = new RegExp(escapedSnippet, "si");
            const sm = content.match(snippetRx);
            if (sm) {
              let tagStart = sm.index;
              while (tagStart > 0 && content[tagStart] !== "<") tagStart--;
              const closeTag = `</${tagName}`;
              let tagEnd = content.indexOf(closeTag, sm.index + sm[0].length);
              if (tagEnd === -1) tagEnd = sm.index + sm[0].length;
              else tagEnd = content.indexOf(">", tagEnd) + 1;
              if (tagEnd > tagStart) {
                setCapturedSectionRange({ start: tagStart, end: tagEnd });
              } else {
                setCapturedSectionRange(null);
              }
            } else {
              setCapturedSectionRange(null);
            }
          } else {
            setCapturedSectionRange(null);
          }
        }
      }
      setSectionMode("placed");
    } catch (err) {
      console.error("Capture error:", err);
      alert("Could not capture elements. Try again.");
      setSelRect(null);
    }
  };

  const handleConfirmSectionEnhance = async () => {
    if (!capturedSectionHTML) return;
    setSectionMode("enhancing");
    setIsEnhancingSection(true);
    const token = getAuthToken();

    // Strip <body> wrapper if capture accidentally included it
    let cleanHTML = capturedSectionHTML;
    const bodyMatch = cleanHTML.match(/^\s*<body[^>]*>([\s\S]*)<\/body>\s*$/i);
    if (bodyMatch) cleanHTML = bodyMatch[1].trim();

    try {
      let instr = enhanceSectionInstr.trim();
      if (
        !/colou?r|theme|background|bg|gradient|dark|light|blue|red|green/i.test(
          instr,
        )
      ) {
        instr =
          (instr ? instr + ". " : "") +
          "IMPORTANT: Preserve the existing color scheme and background colors.";
      }
      const res = await fetch("http://127.0.0.1:8000/api/enhance-section/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
        body: JSON.stringify({
          html_content: cleanHTML,
          content_type: "blog",
          instructions: instr,
        }),
      });
      const data = await res.json();
      if (res.ok && data.enhanced_code) {
        let newContent = content,
          matched = false;

        // Helper: normalize quotes so single-quote and double-quote HTML compare equally
        const normQ = (s) => s.replace(/'/g, '"');

        if (capturedSectionRange) {
          const { start, end } = capturedSectionRange;
          const currentSection = content.substring(start, end);
          if (
            currentSection === capturedSectionHTML ||
            normQ(currentSection) === normQ(capturedSectionHTML)
          ) {
            newContent =
              content.substring(0, start) +
              data.enhanced_code +
              content.substring(end);
            matched = true;
          }
        }
        // Strategy 2: exact string match
        if (!matched && content.includes(capturedSectionHTML)) {
          newContent = content.replace(capturedSectionHTML, data.enhanced_code);
          matched = true;
        }

        // Strategy 3: quote-normalized match (handles browser ' → " conversion)
        if (!matched) {
          const normCaptured = normQ(capturedSectionHTML);
          const normValue = normQ(content);
          const qIdx = normValue.indexOf(normCaptured);
          if (qIdx !== -1) {
            newContent =
              content.substring(0, qIdx) +
              data.enhanced_code +
              content.substring(qIdx + capturedSectionHTML.length);
            matched = true;
          }
        }

        // Strategy 4: normalized whitespace match
        if (!matched) {
          const norm = capturedSectionHTML.replace(/\s+/g, " ").trim();
          const escaped = norm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const rx = new RegExp(escaped.split(" ").join("\\s+"), "s");
          const m = content.match(rx);
          if (m) {
            newContent = content.replace(m[0], data.enhanced_code);
            matched = true;
          }
        }

        // Strategy 5: quote-normalized whitespace match
        if (!matched) {
          const normCaptured = normQ(capturedSectionHTML)
            .replace(/\s+/g, " ")
            .trim();
          const normValue = normQ(content);
          const escaped = normCaptured.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const pat = escaped.split(" ").join("\\s+");
          try {
            const rx = new RegExp(pat, "s");
            const m = normValue.match(rx);
            if (m) {
              newContent =
                content.substring(0, m.index) +
                data.enhanced_code +
                content.substring(m.index + m[0].length);
              matched = true;
            }
          } catch (e) {
            /* regex too complex */
          }
        }

        // Strategy 6: flexible tag matching (handles whitespace between tags)
        if (!matched) {
          const escaped = capturedSectionHTML.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
          );
          const flex = escaped.split(/\s+/).join("\\s*(?:<[^>]*>\\s*)*");
          try {
            const rx = new RegExp(flex, "s");
            const m = content.match(rx);
            if (m) {
              newContent = content.replace(m[0], data.enhanced_code);
              matched = true;
            }
          } catch (e) {
            /* regex too complex, skip */
          }
        }

        // Final fallback: use stored range directly
        if (!matched && capturedSectionRange) {
          const { start, end } = capturedSectionRange;
          if (start >= 0 && end <= content.length && start < end) {
            newContent =
              content.substring(0, start) +
              data.enhanced_code +
              content.substring(end);
            matched = true;
          }
        }

        // Only apply if we found the exact section — never replace entire content
        if (matched) {
          setContent(newContent);
        } else {
          console.warn(
            "Section enhance: could not locate section in source, skipping replacement.",
          );
        }
      } else {
        if (res.status === 429) alert("Rate limited. Please wait.");
        else alert(data.error || "Section enhance failed.");
      }
    } catch (err) {
      console.error("Section enhance error:", err);
      alert("Error connecting to AI service.");
    } finally {
      setSectionMode("idle");
      setIsEnhancingSection(false);
      setSelRect(null);
      setCapturedSectionHTML("");
      setCapturedSectionRange(null);
      setEnhanceSectionInstr("");
    }
  };

  // Enhance overall design of the blog HTML
  const handleEnhanceDesign = async () => {
    if (!content || content.trim().length < 50) {
      alert("Generate some content first before enhancing the design.");
      return;
    }
    const token = getAuthToken();
    if (!token) {
      alert("You must be logged in.");
      return;
    }
    setIsEnhancing(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/enhance-design/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ html_content: content }),
      });
      const data = await res.json();
      if (res.ok && data.enhanced_code) {
        setContent(data.enhanced_code);
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

  // Check authentication and load data
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/auth/login");
    } else {
      fetchCategories();
    }
  }, [router]);

  // Fetch tags whenever category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchTags(selectedCategory);
      setSelectedTags([]); // reset tags on category switch
    } else {
      setTags([]);
      setSelectedTags([]);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/categories/");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchTags = async (categoryId) => {
    try {
      const url = categoryId
        ? `http://127.0.0.1:8000/api/tags/?category=${categoryId}`
        : "http://127.0.0.1:8000/api/tags/";
      const res = await fetch(url);
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

  const handleSelectGraphicalPrompt = (prompt) => {
    setGraphicalPrompt(prompt);
    setShowGraphicalExamples(false);
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
          body: JSON.stringify({ requirement: aiPrompt ,isStatic:true}),
        },
      );
      const data = await res.json();
      console.log("AI Generation Response:", data);
      if (res.ok) {
        

        const extractedMeta = extractJsonBlock(data.excerpt, "JSON_META");

        const extractedJsonLd =
          data.json_ld || extractJsonBlock(data.excerpt, "JSON_LD");

        const cleanExcerpt = (data.excerpt || "").split("JSON_META:")[0].trim();
        
        setTitle(data.title || "");
        setExcerpt(cleanExcerpt);
        setContent(data.generated_code || data.content || "");
        console.log("extractedMeta ",extractedMeta);
        
        // ✅ THIS IS WHAT YOU ARE MISSING
        setSeoMetaData({
          meta_title: extractedMeta?.meta_title || data.title || "",
          meta_description: extractedMeta?.meta_description || cleanExcerpt,
          keywords: extractedMeta?.keywords || [],
        });

        setSeoJsonLdText(
          extractedJsonLd ? JSON.stringify(extractedJsonLd, null, 2) : "",
        );
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

  const handleSeoPayloadGenerate = () => {
    const fallbackTitle = title.trim() || aiPrompt.trim().slice(0, 80);
    const fallbackDescription = excerpt.trim() || aiPrompt.trim().slice(0, 160);
    const fallbackKeywords = aiPrompt
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 8);

    setSeoMetaData((prev) => ({
      meta_title: prev.meta_title || fallbackTitle,
      meta_description: prev.meta_description || fallbackDescription,
      keywords:
        Array.isArray(prev.keywords) && prev.keywords.length
          ? prev.keywords
          : fallbackKeywords,
    }));

    setSeoJsonLdText((prev) => {
      if (prev.trim() && prev.trim() !== "{}") return prev;
      return JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: fallbackTitle,
          description: fallbackDescription,
          keywords: fallbackKeywords,
        },
        null,
        2,
      );
    });
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

    if (!excerpt.trim()) {
      alert("Excerpt is required. Add a short summary for your post.");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert("You must be logged in to create a post");
      router.push("/auth/login");
      return;
    }

    let parsedJsonLd = {};
    if (seoJsonLdText.trim()) {
      try {
        parsedJsonLd = JSON.parse(seoJsonLdText);
      } catch (err) {
        alert("JSON-LD is not valid JSON. Fix it or generate it again.");
        return;
      }
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
      seo_metadata_input: seoMetaData,
      json_ld_payload_input: parsedJsonLd,
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
        const fieldErrors = Object.entries(errorData)
          .map(
            ([field, msgs]) =>
              `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`,
          )
          .join("\n");
        alert(`Failed to publish:\n${fieldErrors}`);
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
      <CreateFullscreenWorkspace
        isFullscreen={isFullscreen}
        fullscreenTab={fullscreenTab}
        setFullscreenTab={setFullscreenTab}
        wantGraphical={wantGraphical}
        setWantGraphical={setWantGraphical}
        content={content}
        title={title}
        setTitle={setTitle}
        excerpt={excerpt}
        setExcerpt={setExcerpt}
        isPublishing={isPublishing}
        handleSubmit={handleSubmit}
        fsSidebarOpen={fsSidebarOpen}
        setFsSidebarOpen={setFsSidebarOpen}
        showExamples={showExamples}
        setShowExamples={setShowExamples}
        handleSelectPrompt={handleSelectPrompt}
        aiPrompt={aiPrompt}
        setAiPrompt={setAiPrompt}
        isGenerating={isGenerating}
        handleAIGenerate={handleAIGenerate}
        showGraphicalExamples={showGraphicalExamples}
        setShowGraphicalExamples={setShowGraphicalExamples}
        handleSelectGraphicalPrompt={handleSelectGraphicalPrompt}
        graphicalPrompt={graphicalPrompt}
        setGraphicalPrompt={setGraphicalPrompt}
        isGeneratingGraphical={isGeneratingGraphical}
        handleGraphicalGenerate={handleGraphicalGenerate}
        seoMetaData={seoMetaData}
        seoJsonLdText={seoJsonLdText}
        setSeoJsonLdText={setSeoJsonLdText}
        handleSeoPayloadGenerate={handleSeoPayloadGenerate}
        graphicalContent={graphicalContent}
        setGraphicalContent={setGraphicalContent}
        previewStyle={previewStyle}
        setPreviewStyle={setPreviewStyle}
        previewStyles={previewStyles}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        selectedTags={selectedTags}
        tags={tags}
        toggleTag={toggleTag}
        startSectionEnhance={startSectionEnhance}
        handleEnhanceDesign={handleEnhanceDesign}
        isEnhancing={isEnhancing}
        isEnhancingSection={isEnhancingSection}
        sectionMode={sectionMode}
        cancelSectionEnhance={cancelSectionEnhance}
        capturedSectionHTML={capturedSectionHTML}
        enhanceSectionInstr={enhanceSectionInstr}
        setEnhanceSectionInstr={setEnhanceSectionInstr}
        handleConfirmSectionEnhance={handleConfirmSectionEnhance}
        fsPanelOpen={fsPanelOpen}
        fsSelectedText={fsSelectedText}
        fsSelSource={fsSelSource}
        handleFsDiscard={handleFsDiscard}
        handleFsRefine={handleFsRefine}
        handleFsApply={handleFsApply}
        fsRefinedText={fsRefinedText}
        setFsRefinedText={setFsRefinedText}
        fsIsRefining={fsIsRefining}
        fsActiveCmd={fsActiveCmd}
        REFINE_COMMANDS={REFINE_COMMANDS}
        fsCodeRef={fsCodeRef}
        handleFsCodeSelect={handleFsCodeSelect}
        fsPreviewIframeRef={fsPreviewIframeRef}
        graphicalFsIframeRef={graphicalFsIframeRef}
        sectionOverlayRef={sectionOverlayRef}
        setContent={setContent}
        onClose={() => {
          setIsFullscreen(false);
          cancelSectionEnhance();
        }}
        handleOverlayMouseDown={handleOverlayMouseDown}
        handleOverlayMouseMove={handleOverlayMouseMove}
        handleOverlayMouseUp={handleOverlayMouseUp}
      />

      <CreatePostWorkspace
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        excerpt={excerpt}
        setExcerpt={setExcerpt}
        aiPrompt={aiPrompt}
        setAiPrompt={setAiPrompt}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedTags={selectedTags}
        categories={categories}
        tags={tags}
        toggleTag={toggleTag}
        wantGraphical={wantGraphical}
        setWantGraphical={setWantGraphical}
        graphicalPrompt={graphicalPrompt}
        setGraphicalPrompt={setGraphicalPrompt}
        graphicalContent={graphicalContent}
        setGraphicalContent={setGraphicalContent}
        isGenerating={isGenerating}
        isGeneratingGraphical={isGeneratingGraphical}
        seoMetaData={seoMetaData}
        isPublishing={isPublishing}
        handleAIGenerate={handleAIGenerate}
        handleGraphicalGenerate={handleGraphicalGenerate}
        handleSubmit={handleSubmit}
        showExamples={showExamples}
        setShowExamples={setShowExamples}
        showGraphicalExamples={showGraphicalExamples}
        setShowGraphicalExamples={setShowGraphicalExamples}
        handleSelectPrompt={handleSelectPrompt}
        handleSelectGraphicalPrompt={handleSelectGraphicalPrompt}
        seoJsonLdText={seoJsonLdText}
        onOpenFullscreen={(tab = "preview") => {
          setIsFullscreen(true);
          setFullscreenTab(tab);
        }}
      />
    </div>
  );
}
