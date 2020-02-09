module.exports = async (req, res) => {
    const tvControllerInterface = req.app.get('tvControllerInterface');

    const { 
        deviceId, 
        action 
    } = req.params;

    if (!['play', 'pause', 'stop'].includes(action)) {
        res.status(400).send('Invalid action!');
    }

    const command = JSON.stringify({
        type: 'mediaControl',
        query: {
            action
        }
    });

    try {
        await tvControllerInterface.sendCmd(deviceId, command);
        res.send('Success');
    } catch (error) {
        res.status(500).send('Error');
    }
};
