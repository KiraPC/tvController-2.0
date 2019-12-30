const Logger = require('../../logger');
const tvController = require('')

const logger = new Logger();

module.exports = async (query) => {
    const { appId } = query;

    try {
        await tvController.openApp(appId);
        logger.info('App changed correctly!');
    } catch (error) {
        logger.error('Unable to change app ...', error);
    }
};
