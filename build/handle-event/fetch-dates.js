"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const models_1 = require("../models");
const fetch_claim_value_1 = require("../wikidata/fetch-claim-value");
const utils_1 = require("../utils");
const onDate = (a, b) => {
    if (a.timestamp > b.timestamp)
        return 1;
    if (a.timestamp < b.timestamp)
        return -1;
    return 0;
};
exports.default = (wdEntityID) => __awaiter(this, void 0, void 0, function* () {
    const dates = [new models_1.WdDate(), new models_1.WdDate(), new models_1.WdDate(), new models_1.WdDate()];
    const startProps = ['start time', 'date of birth'];
    const startPropsPromises = startProps.map(sp => fetch_claim_value_1.default(wdEntityID, sp));
    let startDates = yield utils_1.promiseAll(startPropsPromises);
    const endProps = ['end time', 'date of death'];
    const endPropsPromises = endProps.map(sp => fetch_claim_value_1.default(wdEntityID, sp));
    let endDates = yield utils_1.promiseAll(endPropsPromises);
    endDates = endDates.map(dd => {
        const date = new Date(dd.timestamp);
        let nextDate;
        if (dd.granularity === 'DAY')
            nextDate = utils_1.setUTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999);
        else if (dd.granularity === 'MONTH')
            nextDate = utils_1.setUTCDate(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999);
        else if (dd.granularity === 'YEAR')
            nextDate = utils_1.setUTCDate(date.getUTCFullYear(), 11, 31, 23, 59, 59, 999);
        else {
            console.error(chalk_1.default `{red Unhandled granularity "${dd.granularity}"}`);
        }
        if (nextDate != null) {
            dd.timestamp = nextDate;
        }
        return dd;
    });
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
            dates[3] = pointsInTime[pointsInTime.length - 1];
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
