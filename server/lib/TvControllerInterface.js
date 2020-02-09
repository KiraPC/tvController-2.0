const _ = require('lodash');
const socketIO = require('socket.io');
const Logger = require('../../logger');

const WSS_OPTIONS = {
    path: '/tv-controller/kira',
    transports: ['websocket', 'polling']
};

module.exports = class WSS {
    constructor(server, port) {
        this.logger = new Logger();
        this.server = server;
        this.port = port;

        // store the connected clients
        this.clients = {};

        // Start socket IO server
        this.io = socketIO.listen(this.server, WSS_OPTIONS);
        this.io.on('connection', this._onConnection.bind(this));
    }

    _onConnection(client) {
        const {
            deviceId
        } = client.handshake.query;

        /*
         *
         * Add newly joined client to the room with the same name as that of connectionId.
         * Websocket will create a new socketId everytime a user opens a connection even if it's the
         * second tab on the same browser. By emitting messages to room we make sure that user gets
         * notification even if he has multiple tabs or multiple devices connected to the websocket.
         *
         */
        this.clients[deviceId] = client;
        this.logger.info(`Device ${deviceId} connected.`);

        client.on('disconnect', () => {
            this.logger.info(`Device ${deviceId} disconnected.`);
            delete this.clients[deviceId];
        });
    }

    sendCmd(deviceId, command) {
        if (!this._isClientConnected(deviceId)) {
            this.logger.info(`${deviceId} not connected`);
            return this;
        }

        this.logger.info(`Sending command to ${deviceId}`);

        return new Promise((res, rej) => {
            this.clients[deviceId].emit('cmd', command, (err, response) => {
                if (err) {
                    return rej(err);
                }

                res(response);
            });
        });
    }

    _isClientConnected(deviceId) {
        return !_.isNil(this.clients[deviceId]);
    }
};
