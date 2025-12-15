// Let's Encrypt（Certbot）モジュール Ver2.0
// src/modules/certbot.js

registerModule({
  id: "certbot",
  label: "Let's Encrypt（Certbot）",
  description: "Certbot を使って HTTPS 用の証明書を自動取得・更新できます。",

  iconPath: "src/modules/certbot.png",
  category: "ssl",

  fields: [
    {
      name: "email",
      label: "管理者メールアドレス",
      type: "text",
      default: "",
      placeholder: "admin@example.com",
    },
    {
      name: "domain",
      label: "ドメイン名",
      type: "text",
      default: "",
      placeholder: "example.com",
    },
    {
      name: "webrootPath",
      label: "Webroot パス（ホスト側 Nginx/Apache と共有）",
      type: "text",
      default: "./certbot-webroot",
      placeholder: "./certbot-webroot",
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
      default: "letsencrypt",
      placeholder: "letsencrypt",
      visibleWhen: { field: "dataStoreType", equals: "named" },
    },
    {
      name: "dataStorePath",
      label: "バインドマウント（ホストパス）",
      type: "text",
      default: "./letsencrypt",
      placeholder: "./letsencrypt",
      visibleWhen: { field: "dataStoreType", equals: "bind" },
      isDir: true,
      browseEnabledWhen: { field: "dataStoreType", equals: "bind" },
    },
  ],


  buildCompose(config = {}, shared = {}) {
    const projectName =
      shared.projectName || config.projectName || "myapp";

    const email = String(config.email || "").trim();
    const domain = String(config.domain || "").trim();

    const webrootPath = (config.webrootPath || "./certbot-webroot")
      .toString()
      .replace(/\\/g, "/");
    const dataPathRaw =
      (config.dataPath || "./certbot-data").toString();
    const dataPath = dataPathRaw.replace(/\\/g, "/");

    const svcName = `${projectName}-certbot`;

    const volumes = [];
    const namedVolumes = [];

    // /var/www/certbot と /etc/letsencrypt の 2 箇所
    volumes.push(`${webrootPath}:/var/www/certbot`);

    // データ保存方式（named / bind）
const storeType = String(config.dataStoreType || "named");
const storeName = String(config.dataStoreName || "").trim();
const storePath = String(config.dataStorePath || "./letsencrypt").trim();

if (storeType === "bind") {
  const spec = storePath || "./letsencrypt";
  volumes.push(`${spec}:/etc/letsencrypt`);
} else {
  const key = (storeName || "letsencrypt").replace(/[^\w.-]/g, "-");
  const volName = `${projectName}-${key}`;
  volumes.push(`${volName}:/etc/letsencrypt`);
  namedVolumes.push(volName);
}

const args = [
      "certonly",
      "--webroot",
      "-w",
      "/var/www/certbot",
    ];

    if (email) {
      args.push("--email", email);
    } else {
      args.push("--register-unsafely-without-email");
    }

    if (domain) {
      args.push("-d", domain);
    }

    args.push("--agree-tos", "--non-interactive");

    const service = {
      name: svcName,
      image: "certbot/certbot:latest",
      restart: "no",
      volumes,
      command: args,
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
