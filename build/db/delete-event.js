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
const utils_1 = require("./utils");
const utils_2 = require("../utils");
const constants_1 = require("../constants");
function deleteEvent(x) {
    return __awaiter(this, void 0, void 0, function* () {
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
