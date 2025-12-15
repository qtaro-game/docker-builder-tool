# docker-builder-tool

Docker / docker-compose の設定ファイルを  
GUI 操作で生成するための **Electron 製デスクトップツール** です。

複数のミドルウェア（Web / DB / Cache / 管理ツール等）を選択し、  
docker-compose.yml を組み立てる用途を想定しています。

---

## 主な機能

- Electron によるデスクトップアプリ
- モジュール選択式 UI
  - Nginx / Apache
  - MySQL / MariaDB / PostgreSQL
  - Redis / Memcached
  - WordPress / Redmine / Jenkins
  - Portainer / phpMyAdmin
  - Ollama など
- 選択したモジュール構成から docker-compose 設定を生成
- UI 設定（テーマ切り替えなど）
- モジュールは JS ファイル単位で追加・管理可能

---

## 技術構成

- Electron
- JavaScript (ES6)
- HTML / CSS
- Node.js
- docker / docker-compose（生成対象）

---

## ディレクトリ構成（抜粋）

├─ app/
│ ├─ index.html
│ └─ src/
│ ├─ renderer/
│ │ ├─ core.js
│ │ ├─ generate.js
│ │ ├─ modules_ui.js
│ │ ├─ settings.js
│ │ └─ ui.js
│ ├─ modules/
│ │ ├─ nginx.js
│ │ ├─ mysql.js
│ │ ├─ redis.js
│ │ └─ ...
│ ├─ img/
│ └─ style.css
├─ main.js
├─ preload.js
├─ package.json
└─ settings.json



## 起動方法（開発用）

```bash
npm install
npm start