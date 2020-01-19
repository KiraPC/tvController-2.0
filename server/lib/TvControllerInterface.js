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

        // Start socket IO server
        this.io = socketIO.listen(this.server, WSS_OPTIONS);
        this.io.on('connection', this._onConnection.bind(this));
    }

    _onConnection(socket) {
        const {
            deviceId
        } = socket.handshake.query;

        /*
         *
         * Add newly joined client to the room with the same name as that of connectionId.
         * Websocket will create a new socketId everytime a user opens a connection even if it's the
         * second tab on the same browser. By emitting messages to room we make sure that user gets
         * notification even if he has multiple tabs or multiple devices connected to the websocket.
         *
         */
        socket.join(deviceId);
        this.logger.info(`Device ${deviceId} connected.`);

        socket.on('disconnect', () => {
            this.logger.info(`Device ${deviceId} disconnected.`);
            socket.leave(deviceId);
        });
    }

    sendCmd(connectionId, command) {
        if (!this._isClientConnected(connectionId)) {
            this.logger.info(`${connectionId} not connected`);
            return this;
        }

        this.logger.info(`Sending command to ${connectionId}`);

        this.io.to(connectionId).emit('cmd', command);

        return this;
    }

    _isClientConnected(connectionId) {
        return _.get(this.io, `sockets.adapter.rooms[${connectionId}]`, false);
    }
};
