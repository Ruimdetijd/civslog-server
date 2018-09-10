"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const utils_1 = require("./utils");
const utils_2 = require("../utils");
const constants_1 = require("../constants");
function deleteEvent(x) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let event = x;
        if (typeof x === 'string') {
            event = yield utils_1.selectOne('event', 'wikidata_identifier', event);
        }
        if (event == null) {
            utils_2.logError('deleteEvent', [`Event ${x} does not exist!`]);
            return constants_1.HttpCode.NotFound;
        }
        yield utils_1.execSql(`DELETE FROM event__location WHERE event_id = $1`, [event.id]);
        yield utils_1.execSql(`DELETE FROM event__tag WHERE event_id = $1`, [event.id]);
        yield utils_1.execSql(`DELETE FROM event__event WHERE parent_event_id = $1 OR child_event_id = $1`, [event.id]);
        yield utils_1.execSql(`DELETE FROM event WHERE id = $1`, [event.id]);
        utils_2.logMessage(`Event ${event.label} - ${event.wikidata_identifier} deleted!`);
        return constants_1.HttpCode.NoContent;
    });
}
exports.default = deleteEvent;
