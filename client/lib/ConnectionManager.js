const net = require('net');
const url = require('url');
// @ts-ignore
const Promise = require('bluebird');
const Logger = require('../../logger');
const { EventEmitter } = require('events');

Promise.config({ cancellation: true });

class ConnectionManager extends EventEmitter {
    constructor(endpoint, timeout = 5000) {
        super();

        const urlInfo = url.parse(endpoint);

        if (urlInfo.port === null) {
            if (urlInfo.protocol === 'ftp:') {
                urlInfo.port = '21';
            } else if (['http:', 'ws:'].includes(urlInfo.protocol)) {
                urlInfo.port = '80';
            } else if (['https:', 'wss:'].includes(urlInfo.protocol)) {
                urlInfo.port = '443';
            }
        }

        this.port = Number.parseInt(urlInfo.port || '80');
        this.host = urlInfo.hostname || urlInfo.pathname;;
        this.timeout = timeout;

        this.logger = new Logger();
    }

    async checkServerAvailable() {
        await new Promise((resolve, reject, onCancel) => {
            const client = new net.Socket();

            client.connect({ port: this.port, host: this.host }, () => {
                client.destroy();
                resolve(true);
            });

            client.on('error', (err) => {
                client.destroy();
                reject(err);
            });

            onCancel(() => client.destroy());
        }).timeout(this.timeout);
    }

    test() {
        this.checkServerAvailable()
            .then(this.onResolve.bind(this))
            .catch(this.onReject.bind(this));
    }

    onResolve() {
        this.logger.debug('Internet available!')
        this.emit('internetAvailable');
    }

    onReject() {
        this.logger.debug('No internet connection, check again in 5 sec ...');
        this.emit('internetUnavailable');
        setTimeout(this.test.bind(this), 5000);
    }
}

module.exports = ConnectionManager;
