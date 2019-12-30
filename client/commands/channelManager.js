const CHANNEL_ID = 'com.webos.app.livetv';

module.exports.openChannelList = async (req, res) => {
    const { tvController } = res.locals;

    try {
        await tvController.openApp(CHANNEL_ID);
        res.send('Success');
    } catch (error) {
        res.status(500).send('Error');
    }
};

module.exports.openChannelByNumber = async (req, res) => {
    const { tvController } = res.locals;

    try {
        await tvController.setChannelById(req.params.channelId);
        res.send('Success');
    } catch (error) {
        res.status(500).send('Error');
    }
};
