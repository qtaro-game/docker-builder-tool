// Portainer（コンテナ管理 GUI）モジュール  Ver2.0
// src/modules/portainer.js

registerModule({
  id: "portainer",
  label: "Portainer（コンテナ管理 GUI）",
  description:
    "Docker コンテナをブラウザから管理できる Portainer CE を追加します。",

  iconPath: "src/modules/portainer.png",
  category: "management",

  fields: [
    {
      name: "httpPort",
      label: "HTTP ポート（ホスト側）",
      type: "number",
      default: 9000,
      min: 1,
      max: 65535,
      isPort: true,
      protocol: "tcp",
      placeholder: "9000",
    },
    {
      name: "httpsPort",
      label: "HTTPS ポート（ホスト側）",
      type: "number",
      default: 9443,
      min: 1,
      max: 65535,
      isPort: true,
      protocol: "tcp",
      placeholder: "9443",
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
      default: "portainer-data",
      placeholder: "portainer-data",
      visibleWhen: { field: "dataStoreType", equals: "named" },
    },
    {
      name: "dataStorePath",
      label: "バインドマウント（ホストパス）",
      type: "text",
      default: "./portainer-data",
      placeholder: "./portainer-data",
      visibleWhen: { field: "dataStoreType", equals: "bind" },
      isDir: true,
      browseEnabledWhen: { field: "dataStoreType", equals: "bind" },
    },
  ],


  buildCompose(config = {}, shared = {}) {
    const projectName =
      shared.projectName || config.projectName || "myapp";

    const httpPort =
      Number(config.httpPort) > 0 ? Number(config.httpPort) : 9000;
    const httpsPort =
      Number(config.httpsPort) > 0 ? Number(config.httpsPort) : 9443;

    const httpProto =
      (config.httpPortProtocol || "tcp")
        .toString()
        .toLowerCase() === "udp"
        ? "udp"
        : "tcp";
    const httpsProto =
      (config.httpsPortProtocol || "tcp")
        .toString()
        .toLowerCase() === "udp"
        ? "udp"
        : "tcp";

    const dataPathRaw =
      (config.dataPath || "./portainer-data").toString();
    const dataPath = dataPathRaw.replace(/\\/g, "/");

    const serviceName = `${projectName}-portainer`;

    const ports = [];
    ports.push(
      httpProto === "udp"
        ? `${httpPort}:9000/udp`
        : `${httpPort}:9000`
    );
    ports.push(
      httpsProto === "udp"
        ? `${httpsPort}:9443/udp`
        : `${httpsPort}:9443`
    );

    const volumes = [];
const namedVolumes = [];

// データ保存方式（named / bind）
const storeType = String(config.dataStoreType || "named");
const storeName = String(config.dataStoreName || "").trim();
const storePath = String(config.dataStorePath || "./portainer-data").trim();

if (storeType === "bind") {
  const spec = storePath || "./portainer-data";
  volumes.push(`${spec}:/data`);
} else {
  const key = (storeName || "portainer-data").replace(/[^\w.-]/g, "-");
  const volName = `${projectName}-${key}`;
  volumes.push(`${volName}:/data`);
  namedVolumes.push(volName);
}

const service = {
      name: serviceName,
      image: "portainer/portainer-ce:latest",
      restart: "always",
      ports,
      volumes,
    };

    return {
      services: [service],
      volumes: namedVolumes,
    };
  },

  buildDockerfile(config = {}, shared = {}) {
    // 独自 Dockerfile は不要
    return "";
  },
});
