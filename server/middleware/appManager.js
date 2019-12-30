const _ = require('lodash');

const appMap = {
    CANALI: 'com.webos.app.livetv',
    INFINITY: 'com.5412449.198417',
    NETFLIX: 'netflix',
    TIMVISION: 'timvision3.0',
    AMAZONVIDEO: 'amazon',
    YOUTUBE: 'youtube.leanback.v4',
    SPOTIFY: 'spotify-beehive'
};

/**
 * @param {import("express").Request} req
 */
module.exports.openAppByName = async (req, res) => {
    const tvControllerInterface = req.app.get('tvControllerInterface');

    const deviceId = _.toUpper(req.params.deviceId);
    const appName = _.toUpper(req.params.appName);

    const appId = appMap[appName];

    if (!appId) {
        res.status(400).send('Invalid appName!');
    }

    const command = JSON.stringify({
        type: 'setApp',
        query: {
            appId
        }
    });

    try {
        await tvControllerInterface.sendCmd(deviceId, command);
        res.send('Success');
    } catch (error) {
        res.status(500).send('Error');
    }
};

/**
 * Not Supported yet!
 */
module.exports.getAppList = async (req, res) => {
    const wss = req.app.get('wss');

    const deviceId = _.toUpper(req.params.deviceId);

    const list = await wss.sendCmd(deviceId, 'CMD');
    res.json(list);
};
