// src/renderer/core.js
// ------------------------------------------------------------
// コア部：IPC / FS / Log / 共通ユーティリティ
// ------------------------------------------------------------

// ==============================
// [C01] Electron IPC
// ==============================
let ipcRenderer = null;
try {
  ipcRenderer = require("electron").ipcRenderer;
} catch (e) {
  // ブラウザ単体で動かす場合などはここに来る
}
// [C01] END

// ==============================
// [C02] Node.js FS/Path（設定パス検証・フォルダ選択に使用）
// ==============================
let fs = null;
let pathMod = null;
try {
  fs = require("fs");
  pathMod = require("path");
} catch (e) {
  // nodeIntegration が無い場合など
}
// [C02] END

// ==============================
// [C03] ログ出力ユーティリティ
// ==============================
async function appendLog(message) {
  const line = `[renderer] ${message}`;
  try {
    if (ipcRenderer && typeof ipcRenderer.invoke === "function") {
      await ipcRenderer.invoke("write-log", line);
    } else if (
      window.electronAPI &&
      typeof window.electronAPI.writeLog === "function"
    ) {
      window.electronAPI.writeLog(line);
    } else {
      console.log(line);
    }
  } catch (err) {
    console.error("ログ書き込みに失敗しました:", err);
  }
}
// [C03] END

// ==============================
// [C04] ユーティリティ
// ==============================
function sanitizeName(name) {
  return name.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase() || "myapp";
}

function getCurrentProjectName() {
  const input = document.getElementById("projectNameInput");
  const raw = (input && input.value.trim()) || "myapp";
  return sanitizeName(raw);
}
// [C04] END

// ==============================
// [C99] グローバル公開（他モジュールから参照）
// ==============================
/**
 * renderer.js を ES Modules で分割する都合上、
 * このファイルの中の値はモジュールスコープに閉じます。
 * 既存コードの呼び出し構造を崩さないため、window に公開します。
 */
window.__rendererCore = {
  ipcRenderer,
  fs,
  pathMod,
  appendLog,
  sanitizeName,
  getCurrentProjectName,
};

// 互換：既存コードが直接参照していた場合に備えて公開
window.appendLog = appendLog;
window.sanitizeName = sanitizeName;
window.getCurrentProjectName = getCurrentProjectName;
// [C99] END
