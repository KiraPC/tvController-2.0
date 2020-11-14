const TizenTv = require('./core/Tizen');
const WebOSController = require('./webOS');
const tvConfig = require('../../config').tv;

const controllers = {
    webos: WebOSController,
    tizen: TizenTv
};

class TVController extends controllers[tvConfig.tvType] {
    constructor(logger) {
        super(logger, tvConfig.macAddress, tvConfig.ip);
        this.type = tvConfig.tvType;
    }

    async volumeUp() {
        if (this.type === 'tizen') {
            return this.setVolume('UP');
        }

        const volumeLevel = await this.tvController.getVolume();
        await this.tvController.setVolume(volumeLevel + 3);
    }

    async volumeDown() {
        if (this.type === 'tizen') {
            return this.setVolume('DOWN'); 
        }

        const volumeLevel = await this.tvController.getVolume();
        await this.tvController.setVolume(volumeLevel - 3);
    }
}

module.exports = TVController;
