const http = require('http');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const expressListRoutes = require('express-list-routes');
const router = require('../router');
const Logger = require('../../logger');
const TvControllerInterface = require('./TvControllerInterface');

module.exports = class TvControllerApp {
    constructor() {
        this.logger = new Logger();
        this.app = express();
        this.port = process.env.PORT || 3000;

        this.app.set('logger', this.logger);

        this.app.use(bodyParser.json());
        this.app.use(this.logRequest.bind(this));

        // should return an html entry
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, './view/index.html'));
        });

        const routes = router.getRoutes();
        this.app.use('/', routes);

        this.server = http.createServer(this.app);

        this.tvControllerInterface = new TvControllerInterface(this.server);
        this.app.set('tvControllerInterface', this.tvControllerInterface);

        expressListRoutes({ prefix: '' }, 'APIs:', routes);
    }

    logRequest(req, res, next) {
        this.logger.inRequest(req.method, req.path);
        next();
    }

    listen() {
        return new Promise((resolve, reject) => {
            this.server.listen(this.port, (error) => {
                if (error) {
                    return reject(error);
                }

                this.logger.info(`TvController is running on port: ${this.port}`);
                return resolve();
            });
        });
    }
};
