'use strict';
const fs = require('fs');
const path = require('path');

class Data {

    static get(name) {
        const file = __dirname + '/../data/' + name + '.json';
        if (fs.existsSync(file)) {
            var json = JSON.parse(fs.readFileSync(file));
            return json;
        } else
            console.error('Data file ' + file + ' does not exist');
        return null;
    }

    static update(name, data) {
        const file = __dirname + '/../data/' + name + '.json';
        try {
            fs.writeFileSync(file, JSON.stringify(data));
            return true;
        } catch (err) {
            console.error(err.message);
        }
        return false;
    }

    static updateTOC(toc, update) {
        for (var i = 0; i < toc.length; i++) {
            if (toc[i].ref == update.ref) {
                if (update.range == 0) {
                    var spliced = toc.splice(i, 1);
                    console.log('Deleted ' + JSON.stringify(spliced));
                } else if (update.range[0] == '+') {
                    update.range.substring(1);
                    var spliced = toc.splice(i, 0, update);
                    console.log('Added ' + JSON.stringify(spliced));
                } else {
                    toc[i].topics = update.topics.trim();
                    toc[i].range = (update.range + '').trim();
                    toc[i].tags = (update.tags + '').trim();
                    console.log('Updated ' + JSON.stringify(toc[i]));
                }
                break;
            }
        }
        Data.update('toc', toc);
        update.status = 200;
        update.statusText = "Updated Ref " + update.ref;
        return update;
    }

}

module.exports = Data;