const os = require('os');
const dns = require('dns');
const _ = require('lodash');
const ping = require('ping');
const arp = require('node-arp');
const ipManager = require('ip');
const Bluebird = require('bluebird');
const request = require('request-promise');

const options = {
    timeout: 15,
    vendor: true,
    min: 1,
    max: 255
};

function getMac(ip) {
    return new Promise((resolve) => {
        arp.getMAC(ip, (err, mac) => {
            if (err || !mac) {
                return resolve('Error on get mac');
            }

            return resolve(mac.replace(/:([^:]{1}):/g, ':0$1:'));
        });
    });
}

function getHost(ip) {
    return new Promise((resolve) => {
        dns.reverse(ip, (err, host) => {
            if (err) {
                return resolve('Error on get hostname');
            }

            return resolve(host && host.length ? host[0] : null);
        });
    });
}

function getInfo(ip) {
    const result = {
        ip,
        alive: false
    };

    return new Promise(async (resolve) => {
        const probeOptions = {
            timeout: options.timeout
        };

        const response = await ping.promise.probe(ip, probeOptions);

        if (!response.alive) {
            return resolve(result);
        }

        result.alive = true;

        const getExntedInfoRequests = {};

        getExntedInfoRequests.host = options.host ? getHost(ip) : null;

        getExntedInfoRequests.mac = options.mac ? getMac(ip) : null;

        const { host, mac } = await Bluebird.props(getExntedInfoRequests);

        if (!_.isNull(host)) {
            result.hostname = host;
        }

        if (!_.isNull(mac)) {
            result.mac = mac;
        }

        if (!options.vendor || !result.mac) {
            return resolve(result);
        }

        try {
            const vendor = await request.get(`https://macvendors.co/api/${result.mac}/json`);

            const cont = JSON.parse(vendor);

            if (cont && cont.result && cont.result.company) {
                result.vendor = cont.result.company;
            }
        } catch (error) {
            result.vendor = 'Error on get vendor';
        }

        return resolve(result);
    });
}

function checkIp(ip) {
    const _aIp = ip.split('.');

    if (_aIp.length !== 3) {
        throw new Error('IP should be xxx.xxx.xxx');
    }
}

function checkName(name) {
    const interfaces = os.networkInterfaces();
    const interfaceNames = Object.keys(interfaces);

    if (!_.includes(interfaceNames, name)) {
        throw new Error(`No network interface with name ${name} available interfaces are: ${interfaceNames}`);
    }
}

function getBaseIp(interfaceName) {
    checkName(interfaceName);

    const ipAddress = ipManager.address(interfaceName);

    if (ipAddress) {
        const aIp = ipAddress.split('.');
        if (aIp.length === 4) {
            return aIp.slice(0, -1).join('.');
        }
    }

    throw new Error('No IP address');
}

async function scan(opts) {
    if (opts.ip) {
        checkIp(opts.ip);
    } else {
        opts.ip = getBaseIp(opts.interfaceName);
    }

    Object.assign(options, opts);

    const aIps = [];
    for (let i = options.min; i < options.max; i++) {
        const ip = `${options.ip}.${i}`;
        aIps.push(getInfo(ip));
    }

    const devices = await Bluebird.all(aIps);

    return options.alive ? devices.filter(((device) => { return device.alive; })) : devices;
}

module.exports = scan;
