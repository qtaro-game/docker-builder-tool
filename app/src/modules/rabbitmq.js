// RabbitMQ（メッセージキュー）モジュール Ver2.0
// src/modules/rabbitmq.js

registerModule({
  id: "rabbitmq",
  label: "RabbitMQ（メッセージキュー）",
  description:
    "キュー／PubSub などに使える RabbitMQ（管理コンソール付き）コンテナを追加します。",

  iconPath: "src/modules/rabbitmq.png",
  category: "queue",

  fields: [
    {
      name: "amqpPort",
      label: "AMQP ポート（ホスト側）",
      type: "number",
      default: 5672,
      min: 1,
      max: 65535,
      isPort: true,
      protocol: "tcp",
      placeholder: "5672",
    },
    {
      name: "httpPort",
      label: "管理コンソール（HTTP ポート・ホスト側）",
      type: "number",
      default: 15672,
      min: 1,
      max: 65535,
      isPort: true,
      protocol: "tcp",
      placeholder: "15672",
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
      default: "rabbitmq-data",
      placeholder: "rabbitmq-data",
      visibleWhen: { field: "dataStoreType", equals: "named" },
    },
    {
      name: "dataStorePath",
      label: "バインドマウント（ホストパス）",
      type: "text",
      default: "./rabbitmq-data",
      placeholder: "./rabbitmq-data",
      visibleWhen: { field: "dataStoreType", equals: "bind" },
      isDir: true,
      browseEnabledWhen: { field: "dataStoreType", equals: "bind" },
    },
  ],


  buildCompose(config = {}, shared = {}) {
    const projectName =
      shared.projectName || config.projectName || "myapp";

    const amqpPort =
      Number(config.amqpPort) > 0 ? Number(config.amqpPort) : 5672;
    const httpPort =
      Number(config.httpPort) > 0 ? Number(config.httpPort) : 15672;

    const amqpProto =
      (config.amqpPortProtocol || "tcp").toLowerCase() === "udp"
        ? "udp"
        : "tcp";
    const httpProto =
      (config.httpPortProtocol || "tcp").toLowerCase() === "udp"
        ? "udp"
        : "tcp";

    const dataPathRaw =
      (config.dataPath || "./rabbitmq-data").toString();
    const dataPath = dataPathRaw.replace(/\\/g, "/");

    const serviceName = `${projectName}-rabbitmq`;

    const ports = [];
    ports.push(
      amqpProto === "udp"
        ? `${amqpPort}:5672/udp`
        : `${amqpPort}:5672`
    );
    ports.push(
      httpProto === "udp"
        ? `${httpPort}:15672/udp`
        : `${httpPort}:15672`
    );

    const volumes = [];
const namedVolumes = [];

// データ保存方式（named / bind）
const storeType = String(config.dataStoreType || "named");
const storeName = String(config.dataStoreName || "").trim();
const storePath = String(config.dataStorePath || "./rabbitmq-data").trim();

if (storeType === "bind") {
  const spec = storePath || "./rabbitmq-data";
  volumes.push(`${spec}:/var/lib/rabbitmq`);
} else {
  const key = (storeName || "rabbitmq-data").replace(/[^\w.-]/g, "-");
  const volName = `${projectName}-${key}`;
  volumes.push(`${volName}:/var/lib/rabbitmq`);
  namedVolumes.push(volName);
}

const service = {
      name: serviceName,
      image: "rabbitmq:3-management",
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
    return "";
  },
});
