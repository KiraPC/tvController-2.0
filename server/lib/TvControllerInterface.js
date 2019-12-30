const _ = require('lodash');
const socketIO = require('socket.io');
const Logger = require('../../logger');

const WSS_OPTIONS = {
    transports: ['polling', 'websocket']
};

module.exports = class WSS {
    constructor(server, port) {
        this.logger = new Logger();
        this.server = server;
        this.port = port;

        // this.port = process.env.WSS_PORT || 3001;
        // this.app = express();
        // this.server = http.createServer(this.app);

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

        socket.emit('message', 'You are connected to websocket.');

        socket.on('disconnect', () => {
            this.logger.info(`Client disconnected.`, socket);
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
