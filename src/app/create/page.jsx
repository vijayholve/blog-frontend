// src/app/create/page.jsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import HtmlBlogEditor from "../../components/HtmlBlogEditor";
import PromptExamples from "@/components/PromptExamples";
import GraphicalExamples from "@/components/GraphicalExamples";
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
  const [showGraphicalExamples, setShowGraphicalExamples] = useState(false);
  const router = useRouter();

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
  }, []);

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
      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col">
          {/* Fullscreen Workspace Header */}
          <div className="bg-slate-800 border-b border-slate-700 px-4 py-2.5 flex items-center justify-between gap-3">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  setIsFullscreen(false);
                  cancelSectionEnhance();
                }}
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

            {/* Center: Tabs */}
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

            {/* Right: Enhance + Publish + Sidebar Toggle */}
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

          {/* Section Enhance Banner */}
          {sectionMode !== "idle" && (
            <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-amber-300 text-sm">
                {sectionMode === "marking" && (
                  <>
                    <span className="animate-pulse">🎯</span> Draw a rectangle
                    over the section to enhance
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

          {/* Body: Sidebar + Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            {fsSidebarOpen && (
              <div className="w-[300px] bg-slate-800/80 border-r border-slate-700 overflow-y-auto shrink-0">
                {/* AI Prompt */}
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

                {/* Graphical */}
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

                {/* Metadata */}
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

            {/* Main Content Area */}
            <div className="flex-1 relative overflow-hidden">
              {/* Section Enhance Overlay */}
              {sectionMode === "marking" && fullscreenTab === "preview" && (
                <div
                  ref={sectionOverlayRef}
                  className="absolute inset-0 z-20"
                  style={{ cursor: "crosshair" }}
                  onMouseDown={handleOverlayMouseDown}
                  onMouseMove={handleOverlayMouseMove}
                  onMouseUp={handleOverlayMouseUp}
                >
                  {selRect && (
                    <div
                      className="absolute border-2 border-amber-400 bg-amber-400/15 rounded pointer-events-none"
                      style={{
                        left: selRect.x,
                        top: selRect.y,
                        width: selRect.w,
                        height: selRect.h,
                      }}
                    />
                  )}
                </div>
              )}

              {/* Section Enhance Confirmation */}
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
                  <iframe
                    ref={fsPreviewIframeRef}
                    srcDoc={content}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin"
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
                      {/* Split view: Preview on top, Code below */}
                      <div className="flex-1 overflow-hidden bg-white">
                        <iframe
                          ref={graphicalFsIframeRef}
                          srcDoc={graphicalContent}
                          className="w-full h-full border-0"
                          sandbox="allow-scripts allow-same-origin"
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

          {/* ── Fullscreen AI Refine Panel ── */}
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
                {/* Header */}
                <div
                  className="px-5 py-4 flex items-center justify-between shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🪄</span>
                    <span className="text-white font-bold text-sm">
                      AI Refine
                    </span>
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

                {/* Selected Text */}
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

                {/* Command Buttons */}
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
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold text-white transition-all
                          hover:shadow-lg hover:scale-[1.03] active:scale-95
                          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                          ${fsActiveCmd === cmd.key ? "ring-2 ring-offset-2 ring-purple-400 scale-[1.03]" : ""}`}
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

                {/* Refined Output */}
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

                {/* Action Footer */}
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
    </div>
  );
}
