const _ = require('lodash');
const util = require('util');
const wol = require('wake_on_lan');
const keys = require('./model/enum/keys');
const SamsungRemote = require('samsung-remote');

module.exports = class TizenTv {
    constructor(logger, macAddress = null, ip = null) {
        this.connected = false;

        this.macAddress = macAddress;
        this.ip = ip;
        this.logger = logger;

        const remote = new SamsungRemote({ ip });
        remote.isAlive = util.promisify(remote.isAlive.bind(remote));
        remote.send = util.promisify(remote.send.bind(remote));

        this.remote = remote;
    }

    async connect() {
        try {
            await this.remote.isAlive();
            this.connected = true;
        } catch (error) {
            this.logger.info('TV not in network!');
            this.connected = false;
        }
    }

    async request(command) {
        await this.connect();

        if (!this.connected) {
            this.logger.info('Unable to send request. TV not connected!');
        }

        try {
            await this.remote.send(command);
        } catch (error) {
            this.logger.info('Unable to send command', command);
            this.logger.debug('Unable to send command, error:', error.message);
        }
    }

    turnOn() {
        return new Promise((resolve, reject) => {
            wol.wake(this.macAddress, {
                address: this.ip,
                port: 3000
            }, (error) => {
                if (error) {
                    return reject(error);
                }

                return resolve();
            });

            // eslint-disable-next-line no-unused-vars, camelcase
            const magic_packet = wol.createMagicPacket(this.macAddress);
        });
    }

    async turnOff() {
        await this.request(keys.KEY_POWEROFF);
    }

    async setChannelById(channelId) {
        const numbers = toString(channelId).split('');

        for (let i = 0; i < numbers.length; i++) {
            const number = numbers[i];

            const command = keys[`KEY_${number}`];
            try {
                await this.request(command);
            } catch (error) {
                this.logger.error('Unable to set channel');
            }
        }
    }

    /**
     * 
     * @param {UP | DOWN} operation 
     */
    async setVolume(operation) {
        const command = operation === 'UP' ? keys.KEY_VOLUP : keys.KEY_VOLDOWN;
        try {

            for (let i = 0; i < 3; i++) {
                await this.request(command);
                await this.sleep(500);
            }

            this.logger.debug('Volume setted.');
        } catch (error) {
            this.logger.error('Unable to set volume, get following error:', error.message);
        }
    }

    async getVolume() {
        this.logger.info('Not implemented for Tizen TV.');
    }

    async getInputs() {
        this.logger.info('Not implemented for Tizen TV.');
    }

    async getApps() {
        this.logger.info('Not implemented for Tizen TV.');
    }

    async openApp(appId) {
        this.logger.info('Not implemented for Tizen TV.');
    }

    async mediaControl(action) {
        this.logger.info('Not implemented for Tizen TV.');
    }

    timeoutOff() {
        this.logger.info('Not implemented for Tizen TV.');
    }

    async sendButton(tv, button, timeout = 1000) {
        this.logger.info('Not implemented for Tizen TV.');
    }

    async _sendTimeoutOffSequence() {
        this.logger.info('Not implemented for Tizen TV.');
    }

    sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
};
