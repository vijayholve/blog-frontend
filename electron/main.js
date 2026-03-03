const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const net = require("net");

// Determine if running in production (packaged) or development
const isDev = !app.isPackaged;
const PORT = 3000;

let mainWindow;
let nextProcess;

/**
 * Wait for a TCP port to become available (Next.js server ready).
 */
function waitForPort(port, host = "127.0.0.1", timeout = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    function tryConnect() {
      const socket = new net.Socket();

      socket.once("connect", () => {
        socket.destroy();
        resolve();
      });

      socket.once("error", () => {
        socket.destroy();
        if (Date.now() - start > timeout) {
          reject(new Error(`Timed out waiting for port ${port}`));
        } else {
          setTimeout(tryConnect, 500);
        }
      });

      socket.connect(port, host);
    }

    tryConnect();
  });
}

/**
 * Start the Next.js production server.
 */
function startNextServer() {
  // In production, the Next.js app is bundled alongside Electron
  const appPath = isDev
    ? path.join(__dirname, "..")
    : path.join(process.resourcesPath, "app");

  const nextBin = path.join(appPath, "node_modules", ".bin", "next.cmd");

  // Use 'next start' for production, which serves the .next build
  const args = ["start", "-p", String(PORT)];

  console.log(`Starting Next.js server: ${nextBin} ${args.join(" ")}`);
  console.log(`Working directory: ${appPath}`);

  nextProcess = spawn(nextBin, args, {
    cwd: appPath,
    stdio: "pipe",
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: "production",
    },
  });

  nextProcess.stdout.on("data", (data) => {
    console.log(`[Next.js] ${data.toString().trim()}`);
  });

  nextProcess.stderr.on("data", (data) => {
    console.error(`[Next.js] ${data.toString().trim()}`);
  });

  nextProcess.on("error", (err) => {
    console.error("Failed to start Next.js server:", err);
  });

  nextProcess.on("exit", (code) => {
    console.log(`Next.js server exited with code ${code}`);
  });

  return nextProcess;
}

/**
 * Create the main Electron browser window.
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 800,
    minHeight: 600,
    title: "My Blog",
    icon: path.join(__dirname, "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false, // show after content loaded
  });

  // Remove the default menu bar
  mainWindow.setMenuBarVisibility(false);

  // Load the Next.js app
  mainWindow.loadURL(`http://127.0.0.1:${PORT}`);

  // Show window when content is ready (avoids white flash)
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Open external links in the system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ─── App lifecycle ──────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  try {
    if (isDev) {
      // In dev mode, assume Next.js dev server is already running
      console.log("Development mode — waiting for Next.js dev server...");
    } else {
      // In production, start the bundled Next.js server
      startNextServer();
    }

    console.log(`Waiting for port ${PORT}...`);
    await waitForPort(PORT);
    console.log("Next.js server is ready!");

    createWindow();
  } catch (err) {
    console.error("Failed to start:", err);
    app.quit();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  // Kill the Next.js server process when quitting
  if (nextProcess && !nextProcess.killed) {
    console.log("Stopping Next.js server...");
    nextProcess.kill("SIGTERM");
    // On Windows, also try taskkill for the process tree
    if (process.platform === "win32") {
      try {
        spawn("taskkill", ["/pid", String(nextProcess.pid), "/f", "/t"], {
          shell: true,
        });
      } catch (e) {
        // ignore errors during cleanup
      }
    }
  }
});
