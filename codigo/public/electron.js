const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

if (isDev) {
  try {
    require("electron-reloader")(module);
  } catch (_) {}
}

const baseUrl = isDev
  ? "http://localhost:3000/#"
  : `file://${path.join(__dirname, "../build/index.html#")}`;

const createWindow = async () => {
  const mainWindow = new BrowserWindow({
    width: 1100,
    minWidth: 1100,
    height: 700,
    minHeight: 700,
  });

  if (!isDev) {
    mainWindow.setMenu(null);
  }

  mainWindow.loadURL(`${baseUrl}/#`);
  mainWindow.setResizable(true);
};

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
