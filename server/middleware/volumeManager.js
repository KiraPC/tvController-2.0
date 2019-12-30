const _ = require('lodash');

module.exports.setVolumeByLevel = async (req, res) => {
    const tvControllerInterface = req.app.get('tvControllerInterface');

    const { deviceId } = req.params;
    const volumeLevel = _.toInteger(req.params.volumeLevel);

    const command = JSON.stringify({
        type: 'setVolumeByLevel',
        query: {
            volumeLevel
        }
    });

    try {
        await tvControllerInterface.sendCmd(deviceId, command);
        res.send('Success');
    } catch (error) {
        res.status(500).send('Error');
    }
};

module.exports.volumeDown = async (req, res) => {
    const tvControllerInterface = req.app.get('tvControllerInterface');

    const { deviceId } = req.params;

    const command = JSON.stringify({
        type: 'volumeDown'
    });

    try {
        await tvControllerInterface.sendCmd(deviceId, command);
        res.send('Success');
    } catch (error) {
        res.status(500).send('Error');
    }
};

module.exports.volumeUp = async (req, res) => {
    const tvControllerInterface = req.app.get('tvControllerInterface');

    const { deviceId } = req.params;

    const command = JSON.stringify({
        type: 'volumeUp'
    });

    try {
        await tvControllerInterface.sendCmd(deviceId, command);
        res.send('Success');
    } catch (error) {
        res.status(500).send('Error');
    }
};
