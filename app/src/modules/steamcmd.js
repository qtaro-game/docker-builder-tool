// SteamCMD（ゲームサーバ用）
// src/modules/steamcmd.js

/* global registerModule */

registerModule({
  id: "steamcmd",
  name: "SteamCMD（ゲームサーバ用）",
  description: "SteamCMD を利用するゲームサーバのセットアップ用コンテナを追加します。",
  category: "game",
  icon: "src/modules/steamcmd.png",
  fields: [
    // 永続化
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
      default: "steamcmd",
      placeholder: "steamcmd",
      visibleWhen: { field: "dataStoreType", equals: "named" },
    },
    {
      name: "dataStorePath",
      label: "インストール先（ホスト側パス）",
      type: "path",
      default: "./steamcmd-data",
      placeholder: "./steamcmd-data",
      browseEnabled: true,
      visibleWhen: { field: "dataStoreType", equals: "bind" },
    },

    // SteamCMD 設定
    {
      name: "appId",
      label: "APP ID",
      type: "text",
      default: "",
      placeholder: "例: 896660 (Valheim Dedicated Server) など",
    },
    {
      name: "startupCmd",
      label: "起動コマンド（sh -c で実行）",
      type: "text",
      default: "steamcmd +login anonymous +app_update ${APP_ID} validate +quit",
      placeholder: "steamcmd +login anonymous +app_update ${APP_ID} validate +quit",
    },
  ],

// 生成
buildCompose: (cfg, shared) => {
  const project = shared.projectName || "myapp";
  const serviceName = `${project}-steamcmd`;

  const storeType = cfg.dataStoreType || "named";
  const volumeName = storeType === "named" ? (cfg.dataStoreName || "steamcmd") : null;
  const hostPath = storeType === "bind" ? (cfg.dataStorePath || "./steamcmd-data") : null;

  // コンテナ内の作業領域（固定）
  const containerPath = "/data";

  const volumes = [];
  const topVolumes = [];

  if (storeType === "named") {
    volumes.push(`${project}-${volumeName}:${containerPath}`);
    topVolumes.push(`${project}-${volumeName}`); // ← ここが「トップレベル volumes」に出すべき名前
  } else {
    volumes.push(`${hostPath}:${containerPath}`);
  }

  const env = [];
  if (cfg.appId) env.push(`APP_ID=${cfg.appId}`);

  const services = [
    {
      name: serviceName,
      image: "steamcmd/steamcmd:latest",
      restart: "unless-stopped",
      volumes,
      environment: env,
      command: ["sh", "-c", cfg.startupCmd || "steamcmd +login anonymous +quit"],
    },
  ];

  // generate.js 側が forEach できる形（配列）で返す
  return {
    services,
    volumes: topVolumes,
  };
},
});
