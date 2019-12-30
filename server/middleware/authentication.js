// @ts-ignore
const userConfig = require('../../config/user.json');

module.exports = (req, res, next) => {
    if (!userConfig.isBasicAuthEnabled) {
        return next();
    }

    const { username, password } = req.body;

    if (userConfig.userInfo.username === username && userConfig.userInfo.password === password) {
        return next();
    }

    return res.status(400).send('Forbidden');
};
