"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = require("chalk");
const node_fetch_1 = require("node-fetch");
const constants_1 = require("./constants");
const pkg = require('../package.json');
exports.logError = (title, lines) => console.error(chalk_1.default `{red [ERROR][${title}]}\n{gray ${lines.join('\n')}}\n{red [/ERROR]}`);
exports.logWarning = (title, lines) => console.log(chalk_1.default `{yellow [WARNING][${title}]}\n{gray ${lines.join('\n')}}\n{yellow [/WARNING]}`);
exports.logMessage = (message) => {
    if (message == null || !message.trim().length)
        return;
    console.log(chalk_1.default `{cyan.bold >>> ${message} <<<\n}`);
};
exports.execFetch = (url, options = {}) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let body = null;
    const throwError = (err) => console.log(chalk_1.default `{red [execFetch] Fetch execution failed}\n`, chalk_1.default `{gray [ERROR]\n${err}\n\n[URL]\n${url}}`);
    try {
        const response = yield node_fetch_1.default(url, options);
        body = yield response.json();
        if (body.hasOwnProperty('error'))
            throwError(JSON.stringify(body.error, null, 2));
    }
    catch (err) {
        throwError(err);
    }
    console.log(body);
    return body;
});
function setUserAgent(options) {
    options.headers = Object.assign({}, options.headers, { 'User-Agent': `CivsLogServer/${pkg.version} (https://github.com/RuimDeTijd/civslog-server.git; gijsjanbrouwer@RuimDeTijd.nl)` });
    return options;
}
function fetchFromWikidata(urlPath, options = {}) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return yield exports.execFetch(`${constants_1.WIKIDATA_URL}${urlPath}`, setUserAgent(options));
    });
}
exports.fetchFromWikidata = fetchFromWikidata;
function fetchFromWikimedia(urlPath, options = {}) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return yield exports.execFetch(`${constants_1.WIKIMEDIA_URL}${urlPath}`, setUserAgent(options));
    });
}
exports.fetchFromWikimedia = fetchFromWikimedia;
exports.setUTCDate = (year, month = 0, day = 1, hour = 0, minutes = 0, seconds = 0, milliseconds = 0) => {
    let date = Date.UTC(year, month, day, hour, minutes, seconds, milliseconds);
    if (year > -1 && year < 100) {
        const tmpDate = new Date(date);
        tmpDate.setUTCFullYear(year);
        date = tmpDate.getTime();
    }
    return date;
};
exports.promiseAll = (promises) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const response = yield Promise.all(promises);
    return response
        .filter(result => result.length)
        .reduce((agg, curr) => agg.concat(curr), []);
});
