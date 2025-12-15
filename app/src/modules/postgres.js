// PostgreSQL（DB サーバ）モジュール Ver2.0
// src/modules/postgres.js

registerModule({
  id: "postgres",
  label: "PostgreSQL（DB サーバ）",
  description:
    "アプリケーション用の PostgreSQL データベースコンテナです。MySQL / MariaDB と並ぶ高機能 DBMS です。",

  iconPath: "src/modules/postgresql.png",
  category: "db",

  fields: [
    {
      name: "port",
      label: "公開ポート（ホスト側）",
      type: "number",
      default: 5432,          // PostgreSQL の標準
      min: 1,
      max: 65535,
      isPort: true,
      protocol: "tcp",
      placeholder: "5432",
    },
    {
      name: "dbName",
      label: "DB 名",
      type: "text",
      default: "appdb",
      placeholder: "appdb",
    },
    {
      name: "user",
      label: "ユーザー名",
      type: "text",
      default: "appuser",
      placeholder: "appuser",
    },
    {
      name: "password",
      label: "パスワード",
      type: "text",
      default: "secret",
      placeholder: "secret",
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
      default: "postgres-data",
      placeholder: "postgres-data",
      visibleWhen: { field: "dataStoreType", equals: "named" },
    },
    {
      name: "dataStorePath",
      label: "バインドマウント（ホストパス）",
      type: "text",
      default: "./pg-data",
      placeholder: "./pg-data",
      visibleWhen: { field: "dataStoreType", equals: "bind" },
      isDir: true,
      browseEnabledWhen: { field: "dataStoreType", equals: "bind" },
    },
  ],


  buildCompose(config = {}, shared = {}) {
    const projectName =
      shared.projectName || config.projectName || "myapp";

    const hostPort = Number(config.port) > 0 ? Number(config.port) : 5432;

    const protocol =
      (config.portProtocol || "tcp").toLowerCase() === "udp"
        ? "udp"
        : "tcp";

    const dbName = config.dbName || "appdb";
    const user = config.user || "appuser";
    const password = config.password || "secret";

    const dataPathRaw = (config.dataPath || "./pg-data").toString();
    const dataPath = dataPathRaw.replace(/\\/g, "/");

    const serviceName = `${projectName}-postgres`;

    const portMapping =
      protocol === "udp"
        ? `${hostPort}:5432/udp`
        : `${hostPort}:5432`;

    const volumes = [];
const namedVolumes = [];

// データ保存方式（named / bind）
const storeType = String(config.dataStoreType || "named");
const storeName = String(config.dataStoreName || "").trim();
const storePath = String(config.dataStorePath || "./pg-data").trim();

if (storeType === "bind") {
  const spec = storePath || "./pg-data";
  volumes.push(`${spec}:/var/lib/postgresql/data`);
} else {
  const key = (storeName || "postgres-data").replace(/[^\w.-]/g, "-");
  const volName = `${projectName}-${key}`;
  volumes.push(`${volName}:/var/lib/postgresql/data`);
  namedVolumes.push(volName);
}

const service = {
      name: serviceName,
      image: "postgres:16-alpine",
      restart: "always",
      ports: [portMapping],
      volumes,
      environment: {
        POSTGRES_DB: dbName,
        POSTGRES_USER: user,
        POSTGRES_PASSWORD: password,
      },
    };

    return {
      services: [service],
      volumes: namedVolumes,
    };
  },

  buildDockerfile(config = {}, shared = {}) {
    // 特に Dockerfile は不要
    return "";
  },
});
