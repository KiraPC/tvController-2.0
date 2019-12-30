const _ = require('lodash');
const util = require('util');
const LGTV = require('lgtv2');
const guid = require('uuid/v1');
const scanner = require('../netScanner');

function isWrongKeyError(error) {
    try {
        return error.message.indexOf('Sec-WebSocket-Accept') > -1;
    } catch (err) {
        this.logger.debug(`isWrongKeyError got error: ${err}`);
        return false;
    }
}

function handleError(err) {
    // skip always Sec-WebSocket-Accept errors
    if (isWrongKeyError(err)) return;

    if (this.started) {
        this.logger.debug(`TV disconnected for error: ${err}, Try to reconnect!`);
        this.lgtv.connect(this.host);
    } else {
        this.logger.debug(`Starting error: ${err}`);
        this.reject();
    }
}

function handleConnect() {
    if (!this.started) {
        this.started = true;
        this.logger.info(`Connected to webOS TV and IP is ${this.ip}`);

        this.resolve();
    } else {
        this.logger.info('Re-Connected!');
        this.logger.debug('Send pending requests ...');
        this.flushRequests();
    }
}

function handleConnecting() {
    this.logger.info('Connecting to TV ...');
}

function handlePrompt() {
    this.logger.warn('Check TV and accept the connection!');
}

module.exports = class WebOsTv {
    constructor(logger, macAddress, ip = null) {
        this.started = false;

        this.macAddress = macAddress;
        this.ip = ip;
        this.logger = logger;

        this.pendingRequests = {};
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

    async connect() {
        return new Promise(async (resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;

            if (!this.ip) {
                this.logger.info('Ip not provided, search ip in the network!');
                await this.setIP();
            }

            this.host = `ws://${this.ip}:3000`;

            this.lgtv = new LGTV({
                url: this.host,
                reconnect: 1500
            });

            this.lgtv.connect(this.host);

            // @ts-ignore
            this.lgtv.on('connect', handleConnect.bind(this));
            // @ts-ignore
            this.lgtv.on('connecting', handleConnecting.bind(this));
            // @ts-ignore
            this.lgtv.on('error', handleError.bind(this));
            // @ts-ignore
            this.lgtv.on('prompt', handlePrompt.bind(this));

            this.sendRequest = util.promisify(this.lgtv.request.bind(this.lgtv));
        });
    }

    async request(uri, payload = {}, uuid) {
        if (!uuid) {
            uuid = guid();
            this.pendingRequests[uuid] = { uri, payload };
        } else {
            ({ uri = uri, payload = payload } = this.pendingRequests[uuid]);
        }

        try {
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
