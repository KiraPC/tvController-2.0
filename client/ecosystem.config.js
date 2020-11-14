module.exports = {
    apps: [
        {
            name: "tv-controller-client",
            script: "./client/index.js",
            out_file: 'logs.log',
            watch: false,
            ignore_watch: [
                ".git",
                "logs.log",
                "store.db.json",
                "node_modules"
            ],
            env_dev: {
                BASIC_AUTH: 'N',
                TV_TYPE: 'tizen',
                TV_IP: '192.168.1.29',
                LOG_LEVEL: "debug",
                NODE_OPTIONS: "--inspect"
            },
            env_prod: {
                ENDPOINT: '',
                DEVICEID: '',
                TV_TYPE: 'tizen',
                TV_IP: '',
                LOG_LEVEL: "info",
                ENV: "prod",
            }
        }
    ]
}