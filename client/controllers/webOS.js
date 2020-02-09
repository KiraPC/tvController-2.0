const _ = require('lodash');
const wol = require('wake_on_lan');
const WebOSTv = require('./core/webOS');

const actionMap = {
    PLAY: 'play',
    PAUSE: 'pause',
    STOP: 'stop'
};

const BUTTON = {
    EXIT: 'EXIT',
    MENU: 'MENU',
    UP: 'UP',
    ENTER: 'ENTER',
    RIGHT: 'RIGHT',
    DOWN: 'DOWN'
};

module.exports = class WebOSController extends WebOSTv {
    constructor(logger, macAddress, ip) {
        super(logger, macAddress, ip);
        logger.debug('Initializing WebOS controller');
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
        await this.request('ssap://system/turnOff');
    }

    async setChannelById(channelId) {
        try {
            await this.request('ssap://tv/openChannel', { channelNumber: channelId });
            this.logger.debug('Setted channel', channelId);
        } catch (error) {
            this.logger.error('Unable to set channel, get following error:', error.message);
        }
    }

    async setVolume(volumelevel) {
        try {
            await this.request('ssap://audio/setVolume', { volume: volumelevel });
            this.logger.debug('Volume setted to', volumelevel);
        } catch (error) {
            this.logger.error('Unable to set volume, get following error:', error.message);
        }
    }

    async getVolume() {
        try {
            const volumeConfig = await this.request('ssap://audio/getVolume');

            return volumeConfig.volume;
        } catch (error) {
            return this.logger.error('Unable to get volume, get following error:', error.message);
        }
    }

    async getInputs() {
        const inputs = {};

        try {
            const extInputList = await this.request('ssap://tv/getExternalInputList');
            const { devices } = extInputList;

            for (let i = devices.length - 1; i >= 0; i--) {
                const device = devices[i];
                inputs[device.id] = device.icon;
            }

            return inputs;
        } catch (error) {
            return this.logger.error('Unable to get Inputs, get following error:', error.message);
        }
    }

    async getApps() {
        const appList = {};
        try {
            const response = await this.request('ssap://com.webos.applicationManager/listLaunchPoints');

            const launchpoints = response.launchPoints;
            for (let i = launchpoints.length - 1; i >= 0; i--) {
                const launchpoint = launchpoints[i];
                appList[launchpoint.title] = launchpoint.id;
            }

            return appList;
        } catch (error) {
            return this.logger.error('Unable to get Apps, get following error:', error.message);
        }
    }

    async openApp(appId) {
        try {
            await this.request('ssap://system.launcher/launch', { id: appId });
        } catch (error) {
            this.logger.error('Unable to open app, get following error:', error.message);
        }
    }

    async mediaControl(action) {
        const actionValue = actionMap[_.toUpper(action)];

        if (!actionValue) {
            return this.logger.debug('Unable to control media: Wrong action!');
        }

        try {
            return await this.request(`ssap://media.controls/${actionValue}`);
        } catch (err) {
            return this.logger.error('Unable to control media:', err);
        }
    }

    timeoutOff() {
        this.lgtv.getSocket('ssap://com.webos.service.networkinput/getPointerInputSocket', this._sendTimeoutOffSequence.bind(this));
    }

    async sendButton(tv, button, timeout = 1000) {
        this.logger.debug('Sending button', button);

        return new Promise((resolve) => {
            setTimeout(() => {
                tv.send('button', { name: button.toUpperCase() });
                resolve();
            }, timeout);
        });
    }

    async _sendTimeoutOffSequence(err, tv) {
        if (err) {
            this.logger.error('Unable to send timeout off sequence, error:', err);
        }

        await this.sendButton(tv, BUTTON.EXIT);
        await this.sendButton(tv, BUTTON.MENU);
        await this.sendButton(tv, BUTTON.DOWN);
        await this.sendButton(tv, BUTTON.DOWN);
        await this.sendButton(tv, BUTTON.DOWN);
        await this.sendButton(tv, BUTTON.DOWN);
        await this.sendButton(tv, BUTTON.DOWN);
        await this.sendButton(tv, BUTTON.ENTER);
        await this.sendButton(tv, BUTTON.RIGHT);
        await this.sendButton(tv, BUTTON.RIGHT);
        await this.sendButton(tv, BUTTON.ENTER);
        await this.sendButton(tv, BUTTON.EXIT);
    }
};
