const express = require('express');
const appManager = require('../middleware/appManager');
const mediaControl = require('../middleware/mediaControl');
const systemManager = require('../middleware/systemManager');
const volumeManager = require('../middleware/volumeManager');
const channelManager = require('../middleware/channelManager');

const router = express.Router();

function getRoutes() {
    // channel list control
    router.put('/:deviceId/channel/:channelId', channelManager.openChannelByNumber);
    router.put('/:deviceId/channelList', channelManager.openChannelList);

    // volume control
    router.put('/:deviceId/volume/:volumeLevel', volumeManager.setVolumeByLevel);
    router.put('/:deviceId/volumeUp', volumeManager.volumeUp);
    router.put('/:deviceId/volumeDown', volumeManager.volumeDown);

    /**
     * action = {play!pause!stop}
     */
    router.put('/:deviceId/media/:action', mediaControl);

    router.get('/:deviceId/apps', appManager.getAppList);
    router.put('/:deviceId/app/:appName', appManager.openAppByName);

    router.put('/:deviceId/tv/off', systemManager.turnOff);
    router.put('/:deviceId/tv/off/:timeout', systemManager.turnOffWithTimeout);
    router.delete('/:deviceId/tv/off/timeout', systemManager.clearTimeout);

    return router;
}

module.exports.getRoutes = getRoutes;
