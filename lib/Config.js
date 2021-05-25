'use strict';
const fs = require('fs');
const HOMEDIR = require('os').homedir();

const CONFIG = JSON.parse(fs.readFileSync(HOMEDIR + '/.ataglance.json'));

class Config {

    static get(name) {
        return CONFIG[name];
    }

    static isAdmin(token) {
        return this.get('edit') == token;
    }

}

module.exports = Config;