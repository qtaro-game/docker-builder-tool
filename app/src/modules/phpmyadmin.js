// phpMyAdmin モジュール  Ver2.0
// src/modules/phpmyadmin.js

registerModule({
  id: "phpmyadmin",
  label: "phpMyAdmin",
  description:
    "MySQL / MariaDB をブラウザから管理するための phpMyAdmin コンテナを追加します。",

  iconPath: "src/modules/phpmyadmin.png",
  category: "db-admin",

  // DB モジュールと組み合わせて使う想定
  requires: ["db"],

  fields: [
    {
      name: "port",
      label: "公開ポート（ホスト側）",
      type: "number",
      default: 8081,            // 旧モジュールの規定値
      min: 1,
      max: 65535,
      isPort: true,
      protocol: "tcp",
      placeholder: "8081",
    },
    {
      name: "dbHost",
      label: "接続先 DB サービス名",
      type: "text",
      default: "",
      placeholder: '未指定時は "<プロジェクト名>-mysql" を自動使用',
    },
    {
      name: "dbUser",
      label: "DB ユーザー名",
      type: "text",
      default: "appuser",
      placeholder: "appuser",
    },
    {
      name: "dbPassword",
      label: "DB パスワード",
      type: "text",
      default: "secret",
      placeholder: "secret",
    },
  ],

  buildCompose(config = {}, shared = {}) {
    const projectName =
      shared.projectName || config.projectName || "myapp";

    const hostPort =
      Number(config.port) > 0 ? Number(config.port) : 8081;
    const protocol =
      (config.portProtocol || "tcp").toString().toLowerCase() === "udp"
        ? "udp"
        : "tcp";

    const dbHost =
      config.dbHost && String(config.dbHost).trim() !== ""
        ? String(config.dbHost).trim()
        : `${projectName}-mysql`;

    const dbUser = config.dbUser || "appuser";
    const dbPassword = config.dbPassword || "secret";

    const serviceName = `${projectName}-phpmyadmin`;

    const portMapping =
      protocol === "udp"
        ? `${hostPort}:80/udp`
        : `${hostPort}:80`;

    const service = {
      name: serviceName,
      image: "phpmyadmin/phpmyadmin:latest",
      restart: "always",
      ports: [portMapping],
      environment: {
        PMA_HOST: dbHost,
        PMA_USER: dbUser,
        PMA_PASSWORD: dbPassword,
      },
      depends_on: [dbHost],
    };

    return {
      services: [service],
      volumes: [],
    };
  },

  buildDockerfile(config = {}, shared = {}) {
    return "";
  },
});
