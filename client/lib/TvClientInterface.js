const _ = require('lodash');
const io = require('socket.io-client');
const Logger = require('../../logger');
const TVController = require('../controllers');

module.exports = class TvClientInterface {
    constructor(endpoint, deviceId) {
        this.options = { query: { deviceId } };
        this.logger = new Logger();
        this.tvController = new TVController(this.logger);

        this.client = io(endpoint, this.options);
        this.client.on('connect', this.onConnect.bind(this));
        this.client.on('cmd', this.onCmd.bind(this));
    }

    async onConnect() {
        this.logger.info('Connected to TvControllerServer!');

        try {
            await this.tvController.connect();
        } catch (error) {
            this.logger.error('Unable to connected to TV.', error);
        }
    }

    onCmd(command) {
        const cmd = JSON.parse(command);

        const { type, query } = cmd;
        this.logger.info('Received command', type);

        try {
            const exec = this.getCmd(type);
            exec.call(this, query);
        } catch (error) {
            this.logger.error('Unable to send command ...', error);
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
            const volumeLevel = await this.tvController.getVolume();
            await this.tvController.setVolume(volumeLevel - 3);
            this.logger.info('Volume changed correctly!');
        } catch (error) {
            this.logger.error('Unable to change Volume ...', error);
        }
    }

    async volumeUp() {
        try {
            const volumeLevel = await this.tvController.getVolume();
            await this.tvController.setVolume(volumeLevel + 3);
            this.logger.info('Volume changed correctly!');
        } catch (error) {
            this.logger.error('Unable to change Volume ...', error);
        }
    }
};
