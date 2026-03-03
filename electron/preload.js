// Electron preload script — runs in a sandboxed context before the renderer.
// Exposes a minimal, safe API to the renderer process.

const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  isElectron: true,
});
