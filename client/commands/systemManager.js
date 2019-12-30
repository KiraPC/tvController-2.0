const _ = require('lodash');

let timeoutContainer = null;
let count = null;

function reversCout(timeout) {
    count = timeout / 1000;

    const interval = setInterval(() => {
        if (timeoutContainer === null) { clearInterval(interval); return; }

        this.logger.warn(`================ The TV will turn off in ${count} seconds ================`);
        count--;
    }, 1000);

    setTimeout(() => {
        clearInterval(interval);
        count = null;
    }, timeout);
}

module.exports.turnOff = async (req, res) => {
    const { tvController } = res.locals;

    try {
        await tvController.turnOff();
        res.send('Success');
    } catch (error) {
        res.status(500).send(error);
    }
};

module.exports.turnOffWithTimeout = async (req, res) => {
    const { tvController } = res.locals;
    const timeout = _.toInteger(req.params.timeout);

    if (!timeout) {
        return res.send(400).send('Timeout not valid');
    }

    const msTimeout = timeout * (1000 * 60);

    timeoutContainer = setTimeout(tvController.turnOff.bind(tvController), msTimeout);
    tvController.logger.info(`Timeout setted to ${msTimeout} ms`);
    reversCout.bind(tvController)(msTimeout);

    return res.send('Success');
};

module.exports.clearTimeout = async (req, res) => {
    clearTimeout(timeoutContainer);
    timeoutContainer = null;
    res.locals.tvController.logger.info('Timeout cleared');

    res.send('Success');
};
