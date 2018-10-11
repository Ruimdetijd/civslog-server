"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const models_1 = require("../models");
const fetch_claim_value_1 = require("../wikidata/fetch-claim-value");
const utils_1 = require("../utils");
function onDate(a, b) {
    if (a.timestamp > b.timestamp)
        return 1;
    if (a.timestamp < b.timestamp)
        return -1;
    return 0;
}
function toEndDate(wdDate) {
    const date = new Date(wdDate.timestamp);
    let nextDate;
    if (wdDate.granularity === 'DAY')
        nextDate = utils_1.setUTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999);
    else if (wdDate.granularity === 'MONTH')
        nextDate = utils_1.setUTCDate(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999);
    else if (wdDate.granularity === 'YEAR')
        nextDate = utils_1.setUTCDate(date.getUTCFullYear(), 11, 31, 23, 59, 59, 999);
    else {
        utils_1.logError('fetchDates', [`Unhandled granularity "${wdDate.granularity}"`]);
    }
    if (nextDate != null) {
        wdDate.timestamp = nextDate;
    }
    return wdDate;
}
exports.default = (wdEntityID) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const dates = [new models_1.WdDate(), new models_1.WdDate(), new models_1.WdDate(), new models_1.WdDate()];
    const startProps = ['start time', 'date of birth'];
    const startPropsPromises = startProps.map(sp => fetch_claim_value_1.default(wdEntityID, sp));
    let startDates = yield utils_1.promiseAll(startPropsPromises);
    const endProps = ['end time', 'date of death'];
    const endPropsPromises = endProps.map(sp => fetch_claim_value_1.default(wdEntityID, sp));
    let endDates = yield utils_1.promiseAll(endPropsPromises);
    endDates = endDates.map(toEndDate);
    let pointsInTime = yield fetch_claim_value_1.default(wdEntityID, 'point in time');
    pointsInTime.sort(onDate);
    if (pointsInTime.length) {
        if (pointsInTime.length === 1) {
            startDates.push(pointsInTime[0]);
        }
        else if (pointsInTime.length > 1) {
            if (startDates.length || endDates.length) {
                utils_1.logError('fetchDates', ['Too many dates found', JSON.stringify(pointsInTime), JSON.stringify(startDates), JSON.stringify(endDates)]);
                return dates;
            }
            dates[0] = pointsInTime[0];
            const endDateMax = pointsInTime[pointsInTime.length - 1];
            dates[3] = toEndDate(endDateMax);
            return dates;
        }
    }
    startDates.sort(onDate);
    endDates.sort(onDate);
    if (startDates.length > 1)
        dates[0] = startDates[0];
    if (startDates.length)
        dates[1] = startDates[startDates.length - 1];
    if (endDates.length)
        dates[2] = endDates[0];
    if (endDates.length > 1)
        dates[3] = endDates[endDates.length - 1];
    return dates;
});
