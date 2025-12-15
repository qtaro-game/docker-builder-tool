// Memcached（キャッシュ）モジュール
// src/modules/memcached.js

registerModule({
  id: "memcached",
  label: "Memcached（キャッシュ）",
  description:
    "セッションやキャッシュ用途で利用できる Memcached コンテナを追加します。シンプルな KVS に特化した高速キャッシュサーバです。",
  iconPath: "src/modules/memcached.png",
  category: "cache",

  fields: [
    {
      name: "hostPort",
      label: "公開ポート（ホスト側）",
      type: "number",
      default: 11211,
      min: 1,
      max: 65535,
      isPort: true,
      protocol: "tcp",
      placeholder: "11211",
    },

    // === データ保存方式（任意：キャッシュ用途のため通常は不要）===
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
      default: "memcached-data",
      placeholder: "memcached-data",
      visibleWhen: { field: "dataStoreType", equals: "named" },
    },
    {
      name: "dataStorePath",
      label: "バインドマウント（ホストパス）",
      type: "text",
      default: "./memcached-data",
      placeholder: "./memcached-data",
      visibleWhen: { field: "dataStoreType", equals: "bind" },
      isDir: true,
      browseEnabledWhen: { field: "dataStoreType", equals: "bind" },
    },

    {
      name: "memoryMb",
      label: "メモリ上限（MB）",
      type: "number",
      default: 64,
      min: 16,
      max: 4096,
      placeholder: "64",
    },
  ],

  buildCompose(config = {}, shared = {}) {
    const projectName = shared.projectName || "myapp";
    const serviceName = `${projectName}-memcached`;

    const hostPort = Number(config.hostPort) > 0 ? Number(config.hostPort) : 11211;
    const memoryMb = Number(config.memoryMb) > 0 ? Number(config.memoryMb) : 64;

    const volumes = [];
    const namedVolumes = [];

    const storeType = String(config.dataStoreType || "named");
    const storeName = String(config.dataStoreName || "memcached-data").trim();
    const storePath = String(config.dataStorePath || "./memcached-data").trim();

    // memcached 自体は永続化しないが、必要ならログ/一時ファイル用途でマウントできるようにする
    if (storeType === "bind") {
      volumes.push(`${storePath}:/data`);
    } else {
      const key = (storeName || "memcached-data").replace(/[^\w.-]/g, "-");
      const volName = `${projectName}-${key}`;
      volumes.push(`${volName}:/data`);
      namedVolumes.push(volName);
    }

    return {
      services: [
        {
          name: serviceName,
          image: "memcached:1.6-alpine",
          restart: "always",
          ports: [`${hostPort}:11211`],
          command: ["memcached", "-m", String(memoryMb)],
          volumes,
        },
      ],
      volumes: namedVolumes,
    };
  },

  buildDockerfile() {
    return "";
  },
});
