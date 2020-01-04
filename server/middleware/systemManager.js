module.exports.turnOff = async (req, res) => {
    const tvControllerInterface = req.app.get('tvControllerInterface');

    const { deviceId } = req.params;

    const command = JSON.stringify({
        type: 'turnOff'
    });

    try {
        await tvControllerInterface.sendCmd(deviceId, command);
        res.send('Success');
    } catch (error) {
        res.status(500).send('Error');
    }
};

module.exports.turnOn = async (req, res) => {
    const tvControllerInterface = req.app.get('tvControllerInterface');

    const { deviceId } = req.params;

    const command = JSON.stringify({
        type: 'turnOn'
    });

    try {
        await tvControllerInterface.sendCmd(deviceId, command);
        res.send('Success');
    } catch (error) {
        res.status(500).send('Error');
    }
};

module.exports.turnOffWithTimeout = async (req, res) => {
    const tvControllerInterface = req.app.get('tvControllerInterface');

    const { deviceId } = req.params;

    const command = JSON.stringify({
        type: 'turnOffwithTimeout'
    });

    try {
        await tvControllerInterface.sendCmd(deviceId, command);
        res.send('Success');
    } catch (error) {
        res.status(500).send('Error');
    }
};

// not implemented yet
module.exports.clearTimeout = async (req, res) => {
    const tvControllerInterface = req.app.get('tvControllerInterface');
    tvControllerInterface.logger.info('Timeout cleared');

    res.send('Success');
};
