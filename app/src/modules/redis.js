// Redis（キャッシュサーバ）モジュール Ver2.0
// src/modules/redis.js

registerModule({
  id: "redis",
  label: "Redis（キャッシュサーバ）",
  description:
    "セッション管理やキャッシュ用途の Redis コンテナを追加します。",

  iconPath: "src/modules/redis.png",
  category: "cache",

  fields: [
    {
      name: "port",
      label: "公開ポート（ホスト側）",
      type: "number",
      default: 6379,
      min: 1,
      max: 65535,
      isPort: true,
      protocol: "tcp", // TCP を規定値
      placeholder: "6379",
    },
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
      default: "redis-data",
      placeholder: "redis-data",
      visibleWhen: { field: "dataStoreType", equals: "named" },
    },
    {
      name: "dataStorePath",
      label: "バインドマウント（ホストパス）",
      type: "text",
      default: "./redis-data",
      placeholder: "./redis-data",
      visibleWhen: { field: "dataStoreType", equals: "bind" },
      isDir: true,
      browseEnabledWhen: { field: "dataStoreType", equals: "bind" },
    },
  ],


  buildCompose(config = {}, shared = {}) {
    const projectName =
      shared.projectName || config.projectName || "myapp";

    const port =
      Number(config.port) > 0 ? Number(config.port) : 6379;
    const protocol =
      (config.portProtocol || "tcp").toLowerCase() === "udp"
        ? "udp"
        : "tcp";

    const dataPathRaw =
      (config.dataPath || "./redis-data").toString();
    const dataPath = dataPathRaw.replace(/\\/g, "/");

    const serviceName = `${projectName}-redis`;

    const portMapping =
      protocol === "udp"
        ? `${port}:6379/udp`
        : `${port}:6379`;

    const volumes = [];
const namedVolumes = [];

// データ保存方式（named / bind）
const storeType = String(config.dataStoreType || "named");
const storeName = String(config.dataStoreName || "").trim();
const storePath = String(config.dataStorePath || "./redis-data").trim();

if (storeType === "bind") {
  const spec = storePath || "./redis-data";
  volumes.push(`${spec}:/data`);
} else {
  const key = (storeName || "redis-data").replace(/[^\w.-]/g, "-");
  const volName = `${projectName}-${key}`;
  volumes.push(`${volName}:/data`);
  namedVolumes.push(volName);
}

const service = {
      name: serviceName,
      image: "redis:7-alpine",
      restart: "always",
      ports: [portMapping],
      volumes,
    };

    return {
      services: [service],
      volumes: namedVolumes,
    };
  },

  buildDockerfile(config = {}, shared = {}) {
    // Redis 用の Dockerfile は通常不要
    return "";
  },
});
