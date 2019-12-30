// @ts-ignore
const config = require('../config/client.json');
const TvClientInterface = require('./lib/TvClientInterface');

// eslint-disable-next-line no-new
new TvClientInterface(config.endpoint, config.deviceId);
