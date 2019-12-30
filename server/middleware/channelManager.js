module.exports.openChannelList = async (req, res) => {
    const tvControllerInterface = req.app.get('tvControllerInterface');

    const { deviceId } = req.params;

    const command = JSON.stringify({
        type: 'openChannelList'
    });

    try {
        await tvControllerInterface.sendCmd(deviceId, command);
        res.send('Success');
    } catch (error) {
        res.status(500).send('Error');
    }
};

module.exports.openChannelByNumber = async (req, res) => {
    const tvControllerInterface = req.app.get('tvControllerInterface');

    const { deviceId, channelId } = req.params;

    const command = JSON.stringify({
        type: 'openChannelByNumber',
        query: {
            channelId
        }
    });

    try {
        await tvControllerInterface.sendCmd(deviceId, command);
        res.send('Success');
    } catch (error) {
        res.status(500).send('Error');
    }
};
