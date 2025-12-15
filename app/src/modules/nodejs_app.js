// Node.js アプリ モジュール
// src/modules/nodejs_app.js

registerModule({
  id: "nodejs",
  label: "Node.js アプリ",
  description: "Node.js ベースのフロントエンド／バックエンド開発用コンテナを追加します。",
  iconPath: "src/modules/nodejs.png",
  category: "app",

  fields: [
    {
      name: "hostPort",
      label: "公開ポート（ホスト側）",
      type: "number",
      default: 3000,
      min: 1,
      max: 65535,
      isPort: true,
      protocol: "tcp",
      placeholder: "3000",
    },

    // === データ保存方式（アプリ領域）===
    {
      name: "dataStoreType",
      label: "データ保存方式",
      type: "select",
      default: "named",
      options: [
        { value: "named", label: "名前付きボリューム（推奨）" },
        { value: "bind", label: "バインドマウント（ホストパス）" },
      ],
    },
    {
      name: "dataStoreName",
      label: "ネームボリューム名",
      type: "text",
      default: "node-app",
      placeholder: "node-app",
      visibleWhen: { field: "dataStoreType", equals: "named" },
    },
    {
      name: "dataStorePath",
      label: "バインドマウント（ホストパス）",
      type: "text",
      default: "./node-app",
      placeholder: "./node-app",
      visibleWhen: { field: "dataStoreType", equals: "bind" },
      isDir: true,
      browseEnabledWhen: { field: "dataStoreType", equals: "bind" },
    },

    {
      name: "startCmd",
      label: "起動コマンド（sh -c で実行）",
      type: "text",
      default: "npm install && npm run dev",
      placeholder: "npm install && npm run dev",
    },
  ],

  buildCompose(config = {}, shared = {}) {
    const projectName = shared.projectName || "myapp";
    const svcName = `${projectName}-nodejs`;
    const hostPort = Number(config.hostPort) > 0 ? Number(config.hostPort) : 3000;

    const volumes = [];
    const namedVolumes = [];

    const storeType = String(config.dataStoreType || "named");
    const storeName = String(config.dataStoreName || "node-app").trim();
    const storePath = String(config.dataStorePath || "./node-app").trim();

    if (storeType === "bind") {
      volumes.push(`${storePath}:/app`);
    } else {
      const key = (storeName || "node-app").replace(/[^\w.-]/g, "-");
      const volName = `${projectName}-${key}`;
      volumes.push(`${volName}:/app`);
      namedVolumes.push(volName);
    }

    return {
      services: [
        {
          name: svcName,
          image: "node:20-alpine",
          restart: "always",
          working_dir: "/app",
          ports: [`${hostPort}:${hostPort}`],
          volumes,
          command: ["sh", "-c", String(config.startCmd || "npm install && npm run dev")],
        },
      ],
      volumes: namedVolumes,
    };
  },

  buildDockerfile(config = {}) {
    // 任意：開発用のシンプルな Dockerfile（未使用でもOK）
    return [
      "FROM node:20-alpine",
      "WORKDIR /app",
      "COPY . .",
      "RUN npm install",
      "EXPOSE 3000",
      'CMD ["npm","run","dev"]',
      "",
    ].join("\n");
  },
});
