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

    static updateTOC(toc, quran, update) {
        for (var i = 0; i < toc.length; i++) {
            if (toc[i].ref == update.ref) {
                if (update.range == 0) {
                    var spliced = toc.splice(i, 1);
                    console.log('Deleted ' + JSON.stringify(spliced));
                } else if (update.range[0] == '^') {
                    update.range = update.range.substring(1);
                    update.sura = toc[i].sura;
                    toc.splice(i, 0, update);
                    console.log('Added ' + JSON.stringify(toc[i]));
                } else if (update.range[0] == 'v') {
                    update.range = update.range.substring(1);
                    update.sura = toc[i].sura;
                    toc.splice(i + 1, 0, update);
                    console.log('Added ' + JSON.stringify(toc[i + 1]));
                } else {
                    toc[i].topics = update.topics.trim();
                    if (update.keys) {
                        toc[i].keys = (update.keys + '').trim();
                        Data.updateKeyAyas(toc[i], quran, update);
                    }
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

    static updateKeyAyas(topic, quran, update) {
        var range = topic.range.split('-');
        var a0 = range[0];
        var a1 = a0 -1;
        if (range.length > 0)
            a1 = range[1] - 1;
        var sura = topic.sura;
        for (var i = a0; i <= a1; i++)
            quran[sura - 1].ayas[i].key = false;
        var ayas = update.keys.split(/\s+/g);
        for (var i = 0; i < ayas.length; i++) {
            quran[sura - 1].ayas[ayas[i] - 1].key = true;
        }
        Data.update('quran', quran);
    }

}

module.exports = Data;