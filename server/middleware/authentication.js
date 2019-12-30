// @ts-ignore
const userConfig = require('../../config/user.json');

module.exports = (req, res, next) => {
    if (!userConfig.isBasicAuthEnabled) {
        return next();
    }

    const { deviceId } = req.params;

    const user = userConfig.userInfo[deviceId];

    if (!user) {
        return res.status(500).send('No user for given device configured!');
    }

    const { username, password } = req.body;

    if (user.username === username && user.password === password) {
        return next();
    }

    return res.status(400).send('Forbidden');
};
