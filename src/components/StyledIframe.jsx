// src/components/StyledIframe.jsx
"use client";

function buildSrcDoc(html, styles = []) {
  const safeHtml = html || "";
  const styleTags = styles
    .filter(Boolean)
    .map((style) => {
      if (style.href) {
        return `<link rel="stylesheet" href="${style.href}" />`;
      }
      if (style.cssText) {
        return `<style>${style.cssText}</style>`;
      }
      return "";
    })
    .join("\n");
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${styleTags}
  </head>
  <body>${safeHtml}</body>
</html>`;
}

export default function StyledIframe({ html, styles, iframeRef, title }) {
  return (
    <iframe
      ref={iframeRef}
      srcDoc={buildSrcDoc(html, styles)}
      className="w-full h-full border-0"
      sandbox="allow-scripts allow-same-origin"
      title={title}
    />
  );
}
