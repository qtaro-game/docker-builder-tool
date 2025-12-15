// Redmine（プロジェクト管理）モジュール  Ver2.0
// src/modules/redmine.js

registerModule({
  id: "redmine",
  label: "Redmine（プロジェクト管理）",
  description:
    "Redmine を Docker 上で稼働できるようにするモジュールです。DB モジュールと組み合わせて利用してください（DB 必須）。",

  iconPath: "src/modules/redmine.png",
  category: "app",
  requires: ["db"],

  fields: [
    {
      name: "port",
      label: "公開ポート（ホスト側）",
      type: "number",
      default: 3000,
      min: 1,
      max: 65535,
      isPort: true,
      protocol: "tcp",
      placeholder: "3000",
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
      default: "redmine-files",
      placeholder: "redmine-files",
      visibleWhen: { field: "dataStoreType", equals: "named" },
    },
    {
      name: "dataStorePath",
      label: "バインドマウント（ホストパス）",
      type: "text",
      default: "./redmine-files",
      placeholder: "./redmine-files",
      visibleWhen: { field: "dataStoreType", equals: "bind" },
      isDir: true,
      browseEnabledWhen: { field: "dataStoreType", equals: "bind" },
    },
  ],


  buildCompose(config = {}, shared = {}) {
    const projectName =
      shared.projectName || config.projectName || "myapp";

    const hostPort =
      Number(config.port) > 0 ? Number(config.port) : 3000;
    const protocol =
      (config.portProtocol || "tcp").toString().toLowerCase() === "udp"
        ? "udp"
        : "tcp";

    const dataPathRaw =
      (config.dataPath || "./redmine-data").toString();
    const dataPath = dataPathRaw.replace(/\\/g, "/");

    const defaultDbHost = `${projectName}-mariadb`;
    const dbHost =
      config.dbHost && String(config.dbHost).trim() !== ""
        ? String(config.dbHost).trim()
        : defaultDbHost;

    const dbName = config.dbName || "redmine";
    const dbUser = config.dbUser || "redmine";
    const dbPassword = config.dbPassword || "secret";

    const serviceName = `${projectName}-redmine`;

    const portMapping =
      protocol === "udp"
        ? `${hostPort}:3000/udp`
        : `${hostPort}:3000`;

    const volumes = [];
const namedVolumes = [];

// データ保存方式（named / bind）
const storeType = String(config.dataStoreType || "named");
const storeName = String(config.dataStoreName || "").trim();
const storePath = String(config.dataStorePath || "./redmine-files").trim();

if (storeType === "bind") {
  const spec = storePath || "./redmine-files";
  volumes.push(`${spec}:/usr/src/redmine/files`);
} else {
  const key = (storeName || "redmine-files").replace(/[^\w.-]/g, "-");
  const volName = `${projectName}-${key}`;
  volumes.push(`${volName}:/usr/src/redmine/files`);
  namedVolumes.push(volName);
}

const service = {
      name: serviceName,
      image: "redmine:latest",
      restart: "always",
      ports: [portMapping],
      volumes,
      environment: {
        REDMINE_DB_MYSQL: dbHost,
        REDMINE_DB_DATABASE: dbName,
        REDMINE_DB_USERNAME: dbUser,
        REDMINE_DB_PASSWORD: dbPassword,
      },
      depends_on: [dbHost],
    };

    return {
      services: [service],
      volumes: namedVolumes,
    };
  },

  buildDockerfile(config = {}, shared = {}) {
    return "";
  },
});
