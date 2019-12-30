const WebOSController = require('./webOS');
const tvConfig = require('../../config').tv;

const controllers = {
    webos: WebOSController
};

class TVController extends controllers[tvConfig.tvType] {
    constructor(logger) {
        super(logger, tvConfig.macAddress, tvConfig.ip);
    }
}

module.exports = TVController;
