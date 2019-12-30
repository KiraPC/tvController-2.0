const _ = require('lodash');

module.exports.setVolumeByLevel = async (req, res) => {
    const { tvController } = res.locals;
    const volumeLevel = _.toInteger(req.params.volumeLevel);

    try {
        await tvController.setVolume(volumeLevel);
        res.send('Success');
    } catch (error) {
        res.status(500).send('Error');
    }
};

module.exports.volumeDown = async (req, res) => {
    const { tvController } = res.locals;

    try {
        const volumeLevel = await tvController.getVolume();
        await tvController.setVolume(volumeLevel - 3);
        res.send('Success');
    } catch (error) {
        res.status(500).send('Error');
    }
};

module.exports.volumeUp = async (req, res) => {
    const { tvController } = res.locals;

    try {
        const volumeLevel = await tvController.getVolume();
        await tvController.setVolume(volumeLevel + 3);
        res.send('Success');
    } catch (error) {
        res.status(500).send('Error');
    }
};
