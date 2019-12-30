/* eslint-disable class-methods-use-this */
const _ = require('lodash');

/**
 * An object that contains the weigth of the single level
 */
const levelsVal = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
};

const levels = Object.keys(levelsVal);

/**
 * The Logger object
 */
class Logger {
    /**
     * @constructor
     *
     * @param {String} level                The level wich the logger will instantiate [error, warn, info, debug]
     *
     * @throws {Error} If the level is not in allowd range
     */
    constructor(level, destination = process.stdout) {
        if (!_.includes(levels, _.toLower(level))) {
            throw new Error(`Unsupported Level ${level}`);
        }

        this.stdout = destination;
        this.level = _.toLower(level);
    }

    /**
     * @private
     */
    _isEnabled(level) {
        return levelsVal[this.level] >= levelsVal[level];
    }

    /**
     * @private
     */
    _getOptionsFromMessage(messages) {
        const options = _.isObject(messages[messages.length - 1]) ? messages.pop() : {};

        return options;
    }

    /**
     * @private
     */
    _getTimestamp() {
        const d = new Date();
        const timestamp = new Date(d.getTime() - (d.getTimezoneOffset() * 60 * 1000));
        return timestamp.toISOString().replace('T', ' ').replace('Z', '');
    }

    /**
     * @private
     */
    _getFormattedMessage(message, options) {
        return `ts: ${this._getTimestamp()} logLevel: ${_.toUpper(options.levelName)} |`
               + ` EventType: ${options.eventType} |`
               + ` message: ${message.join(' ')}`;
    }

    /**
     *
     * @private
     *
     * @param {String}  level       The log level
     * @param {String}  eventType   The event that the log is tracking
     * @param {Array}   msg         The list of messages, the last element should be an object that contains the options to log
     *
     * The private method that send the string to the standard output if the level is enabled
     */
    log(level, eventType, ...msg) {
        if (!this._isEnabled(_.toLower(level))) {
            return;
        }

        const options = this._getOptionsFromMessage(msg);

        options.eventType = eventType;
        options.levelName = level;

        const message = this._getFormattedMessage(msg, options);

        this.stdout.write(`${message}\n`);
    }

    /**
     *
     * @param {String} level    The level wich the logger will update [error, warn, info, debug]
     */
    updateLevel(level) {
        if (_.includes(levels, _.toLower(level))) {
            this.level = _.toLower(level);
        }
    }
}

module.exports = Logger;
