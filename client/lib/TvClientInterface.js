const _ = require('lodash');
const io = require('socket.io-client');
const Logger = require('../../logger');
const config = require('../../config').client;
const TVController = require('../controllers');
const ConnectionManager = require('./ConnectionManager');

const IO_CLIENT_OPTIONS = {
    path: '/tv-controller/kira',
    autoConnect: false,
    transports: config.transports
};

module.exports = class TvClientInterface {
    constructor(endpoint, deviceId) {
        this.options = Object.assign(IO_CLIENT_OPTIONS, { query: { deviceId } });
        this.logger = new Logger();
        this.tvController = new TVController(this.logger);

        this.client = io(endpoint, this.options);
        this.client.on('connect', this.onConnect.bind(this));
        this.client.on('disconnect', this.onDisconnect.bind(this));
        this.client.on('reconnect', this.onReconnect.bind(this));
        this.client.on('connect_error', this.onConnectError.bind(this));
        this.client.on('connect_timeout', this.onConnectTimeout.bind(this));
        this.client.on('cmd', this.onCmd.bind(this));

        this.connectionManager = new ConnectionManager(endpoint, config.connectionTimeout);
        this.connectionManager.on('internetAvailable', this.onInternetAvailable.bind(this));
        this.connectionManager.on('internetUnavailable', this.onInternetUnavailable.bind(this));

        this.connectionManager.test();
    }

    onInternetAvailable() {
        this.internetAvailable = true;

        // connect when internet is available
        this.client.open();
    }

    onInternetUnavailable() {
        this.internetAvailable = false;

        // do not try to connect if internet is not available
        this.client.close();
    }

    /**
     * call this function to connect to the TV
     */
    async connect() {
        try {
            await this.tvController.connect();
        } catch (error) {
            if (!this.internetAvailable) {
                this.tvController.disconnect();
            }
            this.logger.error('Unable to connected to TV.', error);
        }
    }

    onConnect() {
        this.logger.info('Connected to TvControllerServer!');
    }

    onDisconnect(reason) {
        this.logger.info('Disconnected from TvControllerServer!');
        this.logger.debug('Disconnected reason:', reason);

        /* 
         * check if disconnection reasone was because of internet not avaible, 
         * try to reconnect if not 
         */
        this.connectionManager.test();
    }

    onReconnect(attemptNumber) {
        this.logger.debug('Reconnecting to TvControllerServer, attemptNumber:', attemptNumber);
    }

    onConnectTimeout() {
        this.logger.warn('Connection timeout exceeded');

        /* 
         * check if disconnection reasone was because of internet not avaible, 
         * try to reconnect if not 
         */
        this.connectionManager.test();
    }

    onConnectError(error) {
        this.logger.error('Connection error:', error.message);

        /* 
         * check if disconnection reasone was because of internet not avaible, 
         * try to reconnect if not 
         */
        this.connectionManager.test();
    }

    async onCmd(command, cb) {
        const cmd = JSON.parse(command);

        const { type, query } = cmd;
        this.logger.info('Received command', type);

        try {
            const exec = this.getCmd(type);
            const response = await exec.call(this, query);
            cb(null, response);
        } catch (error) {
            this.logger.error('Unable to send command ...', error);
            cb(error);
        }
    }

    getCmd(cmdType) {
        return this[cmdType];
    }

    async setApp(query) {
        const { appId } = query;

        try {
            await this.tvController.openApp(appId);
            this.logger.info('App changed correctly!');
        } catch (error) {
            this.logger.error('Unable to change app ...', error);
        }
    }

    async openChannelList() {
        const CHANNEL_ID = 'com.webos.app.livetv';

        try {
            await this.tvController.openApp(CHANNEL_ID);
            this.logger.info('Set Channel source!');
        } catch (error) {
            this.logger.error('Unable to set channel source ...', error);
        }
    }

    async openChannelByNumber(query) {
        const { channelId } = query;

        try {
            await this.tvController.setChannelById(channelId);
            this.logger.info('Channel changed correctly!');
        } catch (error) {
            this.logger.error('Unable to change channel ...', error);
        }
    }

    async setVolumeByLevel(query) {
        const volumeLevel = _.toInteger(query.volumeLevel);

        try {
            await this.tvController.setVolume(volumeLevel);
            this.logger.info('Volume changed correctly!');
        } catch (error) {
            this.logger.error('Unable to change Volume ...', error);
        }
    }

    async volumeDown() {
        try {
            await this.tvController.volumeDown();
            this.logger.info('Volume changed correctly!');
        } catch (error) {
            this.logger.error('Unable to change Volume ...', error);
        }
    }

    async volumeUp() {
        try {
            await this.tvController.volumeUp();
            this.logger.info('Volume changed correctly!');
        } catch (error) {
            this.logger.error('Unable to change Volume ...', error);
        }
    }

    async turnOn() {
        try {
            await this.tvController.turnOn();
            this.logger.info('TV on!');
        } catch (error) {
            this.logger.error('Unable to turn on the TV ...', error);
        }
    }

    async turnOff() {
        try {
            await this.tvController.turnOff();
            this.logger.info('TV off!');
        } catch (error) {
            this.logger.error('Unable to turn off the TV ...', error);
        }
    }

    async turnOffwithTimeout() {
        try {
            await this.tvController.timeoutOff();
            this.logger.info('TV off timout setted!');
        } catch (error) {
            this.logger.error('Unable to turn off the TV ...', error);
        }
    }

    async mediaControl(query) {
        try {
            await this.tvController.mediaControl(query.action);
            this.logger.info(`Command ${query.action} sent!`);
        } catch (error) {
            this.logger.error(`Unable to send command ${query.action}`, error);
        }
    }

    async getAppList() {
        try {
            const response = await this.tvController.getApps();
            this.logger.info(`Sending app list ...`);
            return response;
        } catch (error) {
            this.logger.error(`Unable to retrieve appList`, error);
        }
    }
};
