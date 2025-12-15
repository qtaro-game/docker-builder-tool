// MySQL（DB サーバ）モジュール

registerModule({
  id: "mysql",
  label: "MySQL（DB サーバ）",
  description: "アプリケーション用の MySQL データベースコンテナを追加します。",
  iconPath: "src/modules/mysql.png",
  category: "db",
  requires: [],

  fields: [
    {
      name: "hostPort",
      label: "公開ポート（ホスト側）",
      type: "number",
      default: 3306,
      min: 1,
      max: 65535,
      isPort: true,
      protocol: "tcp",
      placeholder: "3306",
    },
    {
      name: "database",
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

    // === データ保存方式 ===
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
      default: "mysql-data",
      placeholder: "mysql-data",
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
      Number(config.hostPort) > 0 ? Number(config.hostPort) : 3306;

    const dbName = config.database || "appdb";
    const dbUser = config.user || "appuser";
    const dbPass = config.password || "secret";

    const serviceName = `${projectName}-mysql`;
    const volumes = [];
    const namedVolumes = [];

    const storeType = String(config.dataStoreType || "named");
    const storeName = String(config.dataStoreName || "").trim();
    const storePath = String(config.dataStorePath || "./db-data").trim();

    if (storeType === "bind") {
      volumes.push(`${storePath}:/var/lib/mysql`);
    } else {
      const key = (storeName || "mysql-data").replace(/[^\w.-]/g, "-");
      const volName = `${projectName}-${key}`;
      volumes.push(`${volName}:/var/lib/mysql`);
      namedVolumes.push(volName);
    }

    return {
      services: [
        {
          name: serviceName,
          image: "mysql:8.0",
          restart: "always",
          ports: [`${hostPort}:3306`],
          volumes,
          environment: {
            MYSQL_DATABASE: dbName,
            MYSQL_USER: dbUser,
            MYSQL_PASSWORD: dbPass,
            MYSQL_ROOT_PASSWORD: dbPass,
          },
        },
      ],
      volumes: namedVolumes,
    };
  },

  buildDockerfile() {
    return "";
  },
});
