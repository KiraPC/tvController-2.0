require('dotenv').config();

function getUserInfo() {
    const userInfo = {};

    const devicesUsers = process.env.DEVICES_USERS || '';

    const devicesUsersList = devicesUsers.split('||');

    for (let index = 0; index < devicesUsersList.length; index++) {
        const {
            0: device,
            1: username,
            2: password
        } = devicesUsersList[index].split('::');

        userInfo[device] = { username, password };
    }
}

module.exports = {
    client: {
        endpoint: process.env.ENDPOINT,
        deviceId: process.env.DEVICEID
    },
    tv: {
        macAddress: process.env.MACADDRESS,
        ip: process.env.TV_IP,
        tvType: 'webos'
    },
    users: {
        isBasicAuthEnabled: true,
        userInfo: getUserInfo()
    }
};
