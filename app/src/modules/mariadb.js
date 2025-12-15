// MariaDB（DB サーバ）モジュール  Ver2.0
// src/modules/mariadb.js

registerModule({
  id: "mariadb",
  label: "MariaDB（DB サーバ）",
  description:
    "MySQL 互換の MariaDB データベースサーバを追加します。MySQL より軽量で高速な構成が可能です。",

  iconPath: "src/modules/mariadb.png",
  category: "db",

  fields: [
    {
      name: "port",
      label: "公開ポート（ホスト側）",
      type: "number",
      default: 3307,           // 旧モジュールの規定値
      min: 1,
      max: 65535,
      isPort: true,
      protocol: "tcp",
      placeholder: "3307",
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
      default: "mariadb-data",
      placeholder: "mariadb-data",
      visibleWhen: { field: "dataStoreType", equals: "named" },
    },
    {
      name: "dataStorePath",
      label: "バインドマウント（ホストパス）",
      type: "text",
      default: "./db-data",
      placeholder: "./db-data",
      visibleWhen: { field: "dataStoreType", equals: "bind" },
      isDir: true,
      browseEnabledWhen: { field: "dataStoreType", equals: "bind" },
    },
  ],


  buildCompose(config = {}, shared = {}) {
    const projectName =
      shared.projectName || config.projectName || "myapp";

    const hostPort =
      Number(config.port) > 0 ? Number(config.port) : 3307;
    const protocol =
      (config.portProtocol || "tcp").toString().toLowerCase() === "udp"
        ? "udp"
        : "tcp";

    const dbName = config.dbName || "appdb";
    const user = config.user || "appuser";
    const password = config.password || "secret";

    const dataPathRaw = (config.dataPath || "./mariadb-data").toString();
    const dataPath = dataPathRaw.replace(/\\/g, "/");

    const serviceName = `${projectName}-mariadb`;

    const portMapping =
      protocol === "udp"
        ? `${hostPort}:3306/udp`
        : `${hostPort}:3306`;

    const volumes = [];
const namedVolumes = [];

// データ保存方式（named / bind）
const storeType = String(config.dataStoreType || "named");
const storeName = String(config.dataStoreName || "").trim();
const storePath = String(config.dataStorePath || "./db-data").trim();

if (storeType === "bind") {
  const spec = storePath || "./db-data";
  volumes.push(`${spec}:/var/lib/mysql`);
} else {
  const key = (storeName || "mariadb-data").replace(/[^\w.-]/g, "-");
  const volName = `${projectName}-${key}`;
  volumes.push(`${volName}:/var/lib/mysql`);
  namedVolumes.push(volName);
}

const service = {
      name: serviceName,
      image: "mariadb:latest",
      restart: "always",
      ports: [portMapping],
      volumes,
      environment: {
        MYSQL_DATABASE: dbName,
        MYSQL_USER: user,
        MYSQL_PASSWORD: password,
        MYSQL_ROOT_PASSWORD: password,
      },
    };

    return {
      services: [service],
      volumes: namedVolumes,
    };
  },

  buildDockerfile(config = {}, shared = {}) {
    // DB 用の Dockerfile は不要
    return "";
  },
});
