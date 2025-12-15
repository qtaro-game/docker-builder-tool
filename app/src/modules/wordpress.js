// WordPress モジュール  Ver2.0
// src/modules/wordpress.js

registerModule({
  id: "wordpress",
  label: "WordPress（CMS）",
  description:
    "世界で広く利用されている CMS、Web サイト構築に利用できる WordPress コンテナを追加します。",

  iconPath: "src/modules/wordpress.png",
  category: "app",

  // DB（MySQL / MariaDB）が必須
  requires: ["db"],

  fields: [
    {
      name: "port",
      label: "公開ポート（ホスト側）",
      type: "number",
      default: 8080,
      min: 1,
      max: 65535,
      isPort: true,
      protocol: "tcp",
      placeholder: "8080",
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
      default: "wordpress-data",
      placeholder: "wordpress-data",
      visibleWhen: { field: "dataStoreType", equals: "named" },
    },
    {
      name: "dataStorePath",
      label: "バインドマウント（ホストパス）",
      type: "text",
      default: "./wp-data",
      placeholder: "./wp-data",
      visibleWhen: { field: "dataStoreType", equals: "bind" },
      isDir: true,
      browseEnabledWhen: { field: "dataStoreType", equals: "bind" },
    },
  ],


  buildCompose(config = {}, shared = {}) {
    const projectName =
      shared.projectName || config.projectName || "myapp";

    const hostPort =
      Number(config.port) > 0 ? Number(config.port) : 8080;
    const protocol =
      (config.portProtocol || "tcp").toString().toLowerCase() === "udp"
        ? "udp"
        : "tcp";

    const dataPathRaw =
      (config.dataPath || "./wordpress-data").toString();
    const dataPath = dataPathRaw.replace(/\\/g, "/");

    const dbHost =
      config.dbHost && String(config.dbHost).trim() !== ""
        ? String(config.dbHost).trim()
        : `${projectName}-mysql`;

    const dbName = config.dbName || "appdb";
    const dbUser = config.dbUser || "appuser";
    const dbPassword = config.dbPassword || "secret";

    const serviceName = `${projectName}-wordpress`;

    const portMapping =
      protocol === "udp"
        ? `${hostPort}:80/udp`
        : `${hostPort}:80`;

    const volumes = [];
const namedVolumes = [];

// データ保存方式（named / bind）
const storeType = String(config.dataStoreType || "named");
const storeName = String(config.dataStoreName || "").trim();
const storePath = String(config.dataStorePath || "./wp-data").trim();

if (storeType === "bind") {
  const spec = storePath || "./wp-data";
  volumes.push(`${spec}:/var/www/html`);
} else {
  const key = (storeName || "wordpress-data").replace(/[^\w.-]/g, "-");
  const volName = `${projectName}-${key}`;
  volumes.push(`${volName}:/var/www/html`);
  namedVolumes.push(volName);
}

const service = {
      name: serviceName,
      image: "wordpress:latest",
      restart: "always",
      ports: [portMapping],
      volumes,
      environment: {
        WORDPRESS_DB_HOST: dbHost,
        WORDPRESS_DB_NAME: dbName,
        WORDPRESS_DB_USER: dbUser,
        WORDPRESS_DB_PASSWORD: dbPassword,
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
