// src/components/HtmlIframe.jsx
"use client";
import { useRef, useEffect, useState } from "react";

export default function HtmlIframe({
  html,
  title = "Content",
  className = "",
}) {
  const iframeRef = useRef(null);
  const [height, setHeight] = useState("100vh");

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const onLoad = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
          // Set a small delay to let styles/fonts load
          setTimeout(() => {
            const h = doc.documentElement.scrollHeight;
            if (h > 0) setHeight(h + "px");
          }, 500);
        }
      } catch (e) {
        // cross-origin guard
      }
    };

    iframe.addEventListener("load", onLoad);
    return () => iframe.removeEventListener("load", onLoad);
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={html}
      className={`w-full border-0 ${className}`}
      sandbox="allow-scripts allow-same-origin"
      title={title}
      style={{ height, minHeight: "100vh" }}
    />
  );
}
