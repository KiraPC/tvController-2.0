const Logger = require('./core');

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const destinationMap = {
    console: process.stdout
};

/**
 * The logger object
 */
module.exports = class TVLogger {
    /**
     * @constructor
     *
     */
    constructor() {
        this.loggers = [
            new Logger(LOG_LEVEL, destinationMap.console)
        ];
    }

    log(level, event, ...msg) {
        for (let i = 0; i < this.loggers.length; i++) {
            this.loggers[i].log(level, event, ...msg);
        }
    }

    /**
     *
     * @param  {Array} msg
     *
     * Log the messages with level info
     */
    info(...msg) {
        this.log('info', 'NONE', ...msg);
    }

    /**
     *
     * @param  {Array} msg
     *
     * Log the messages with level debug
     */
    debug(...msg) {
        this.log('debug', 'NONE', ...msg);
    }

    /**
     *
     * @param  {Array} msg
     *
     * Log the messages with level warn
     */
    warn(...msg) {
        this.log('warn', 'NONE', ...msg);
    }

    /**
     *
     * @param  {Array} msg
     *
     * Log the messages with level error
     */
    error(...msg) {
        this.log('error', 'SYSERROR', ...msg);
    }

    inRequest(...msg) {
        this.log('info', 'IN_REQUEST', ...msg);
    }

    outResponse(...msg) {
        this.log('info', 'SEND_RESPONSE', ...msg);
    }
};

/**
 * Handle an uncaughtException and log the error in the choised trasport
 */
process.on('uncaughtException', (error) => {
    new Logger('error').log('error', 'SYSERROR', error.stack);
});
