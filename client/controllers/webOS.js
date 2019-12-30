const _ = require('lodash');
const WebOSTv = require('./core/webOS');

const actionMap = {
    PLAY: 'play',
    PAUSE: 'pause',
    STOP: 'stop'
};

module.exports = class WebOSController extends WebOSTv {
    constructor(logger, macAddress, ip) {
        super(logger, macAddress, ip);
        logger.debug('Initializing WebOS controller');
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
            const { devices } = extInputList.payload;

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

            const launchpoints = response.payload.launchPoints;
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
};