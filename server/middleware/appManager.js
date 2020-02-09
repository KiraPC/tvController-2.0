const _ = require('lodash');

const appMap = {
    CANALI: 'com.webos.app.livetv',
    INFINITY: 'com.5412449.198417',
    NETFLIX: 'netflix',
    TIMVISION: 'timvision3.0',
    AMAZONVIDEO: 'amazon',
    YOUTUBE: 'youtube.leanback.v4',
    SPOTIFY: 'spotify-beehive',
    PS4: 'com.webos.app.hdmi2'
};

/**
 * @param {import("express").Request} req
 */
module.exports.openAppByName = async (req, res) => {
    const tvControllerInterface = req.app.get('tvControllerInterface');

    const { deviceId } = req.params;
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
    const tvControllerInterface = req.app.get('tvControllerInterface');

    const { deviceId } = req.params;

    const command = JSON.stringify({
        type: 'getAppList'
    });

    try {
        const response = await tvControllerInterface.sendCmd(deviceId, command);
        res.send(response);
    } catch (error) {
        res.status(500).send('Error');
    }
};
