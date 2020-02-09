const _ = require('lodash');
const util = require('util');
const ping = require('ping');
const LGTV = require('lgtv2');
const guid = require('uuid/v1');
const scanner = require('../netScanner');

module.exports = class WebOsTv {
    constructor(logger, macAddress = null, ip = null) {
        this.started = false;
        this.connected = false;

        this.macAddress = macAddress;
        this.ip = ip;
        this.logger = logger;

        this.pendingRequests = {};
    }

    isWrongKeyError(error) {
        try {
            return error.message.indexOf('Sec-WebSocket-Accept') > -1;
        } catch (err) {
            this.logger.debug(`isWrongKeyError got error: ${err}`);
            return false;
        }
    }

    async onError(err) {
        // skip always Sec-WebSocket-Accept errors
        if (this.isWrongKeyError(err)) return;

        if (!this.started) {
            this.logger.debug(`Starting error: ${err}`);
            this.reject();
            return;
        }

        this.logger.warn(`TV disconnected for error: ${err}`);

        const response = await ping.promise.probe(this.ip, { timeout: 100 });

        if (!response.alive) {
            this.logger.warn(`TV not in network.`);
            this.connected = false;
            return;
        }

        this.logger.debug(`TV disconnected for error: ${err}, Try to reconnect!`);
        this.lgtv.connect(this.host);
    }

    onConnect() {
        this.connected = true;

        if (!this.started) {
            this.started = true;
            this.logger.info(`Connected to webOS TV and IP is ${this.ip}`);
        } else {
            this.logger.info('Re-Connected!');
        }

        this.resolve();
    }

    async onConnecting() {
        this.logger.info('Connecting to TV ...');

        const response = await ping.promise.probe(this.ip, { timeout: 100 });

        if (!response.alive) {
            this.logger.warn('TV not in the network. Closing connections.');
            this.lgtv.disconnect();
            this.connected = false;
        }
    }

    onClose() {
        this.connected = false;
        this.logger.warn('Connection closed!');
    }

    onPrompt() {
        this.logger.warn('Check TV and accept the connection!');
    }

    /**
     * @returns {Promise<Array<Object>>}
     */
    async _getActiveDevices() {
        const allDevices = await scanner({
            interfaceName: 'Wi-Fi',
            mac: true,
            alive: true
        });

        this.logger.info('Search for devices ...');
        return allDevices.filter(((el) => { return el.alive; }));
    }

    /**
     * @returns {Promise<String>}
     */
    async _getIpFromNetwork() {
        const activeDevices = await this._getActiveDevices();

        const webOsTv = activeDevices.find((device) => { return device.mac === this.macAddress; });

        if (!webOsTv) {
            throw new Error('Not tv found for given macAddres!');
        }

        return webOsTv.ip;
    }

    getIp() {
        return this.ip;
    }

    async setIP() {
        if (!this.ip) {
            this.ip = await this._getIpFromNetwork();
        }
    }

    connect() {
        return new Promise(async (resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;

            if (!this.ip) {
                this.logger.info('Ip not provided, search ip in the network!');
                await this.setIP();
            }

            if (!this.macAddress) {
                this.logger.info('MacAddress not provided, getting info from ip');
                this.macAddress = await scanner.getMac(this.ip);
                this.logger.debug('MacAddress found:', this.macAddress);
            }

            this.host = `ws://${this.ip}:3000`;

            this.lgtv = new LGTV({
                url: this.host,
                reconnect: 1500
            });

            this.lgtv.connect(this.host);

            // @ts-ignore
            this.lgtv.on('connect', this.onConnect.bind(this));
            // @ts-ignore
            this.lgtv.on('connecting', this.onConnecting.bind(this));
            // @ts-ignore
            this.lgtv.on('error', this.onError.bind(this));
            // @ts-ignore
            this.lgtv.on('prompt', this.onPrompt.bind(this));
            // @ts-ignore
            this.lgtv.on('close', this.onClose.bind(this));

            this.sendRequest = util.promisify(this.lgtv.request.bind(this.lgtv));
        });
    }

    disconnect() {
        this.logger.info('Disconnecting from TV!');
        this.lgtv.disconnect();
    }

    async request(uri, payload = {}, uuid) {
        if (!uuid) {
            uuid = guid();
            this.pendingRequests[uuid] = { uri, payload };
        } else {
            ({ uri = uri, payload = payload } = this.pendingRequests[uuid]);
        }

        try {
            if (!this.connected) {
                await this.connect();
            }

            this.logger.debug(`sending request: ${uri} | ${JSON.stringify(payload)}`);
            const response = await this.sendRequest(uri, payload);
            this.logger.debug(`request response: ${JSON.stringify(response)}`);

            if (_.isNil(response) || _.isEmpty(response) || response.returnValue === false) {
                throw new Error('request response was null, empty or returnValue was false');
            }

            delete this.pendingRequests[uuid];
            return response;
        } catch (error) {
            this.logger.debug(`request error: ${error}`);
            throw error;
        }
    }

    flushRequests() {
        const requestIds = Object.keys(this.pendingRequests);

        for (let i = 0; i < requestIds.length; i++) {
            const requestId = requestIds[i];
            this.request(null, null, requestId);
        }
    }
};
