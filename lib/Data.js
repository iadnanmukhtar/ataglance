'use strict';
const { cache } = require('ejs');
const fs = require('fs');
const path = require('path');

class Data {

    static get(name) {
        if (!cache[name]) {
            const file = __dirname + '/../data/' + name + '.json';
            if (fs.existsSync(file)) {
                var json = JSON.parse(fs.readFileSync(file));
                return json;
            } else
                console.error('Data file ' + file + ' does not exist');
        }
        return null;
    }

}

module.exports = Data;