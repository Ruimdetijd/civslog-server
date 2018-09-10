"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = require("chalk");
const utils_1 = require("./utils");
const constants_1 = require("../constants");
function insertEventTagRelations(eventId, tagIds) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (eventId == null || !tagIds.length)
            return constants_1.HttpCode.BadRequest;
        const result = yield utils_1.execSql(`INSERT INTO event__tag
									(event_id, tag_id)
								VALUES
									${tagIds.map(id => `(${eventId}, ${id})`)}
								ON CONFLICT DO NOTHING`);
        if (utils_1.hasRows(result))
            console.log(chalk_1.default `{green ${result.rows.length.toString()} tag(s) inserted/updated in db!}`);
        return constants_1.HttpCode.NoContent;
    });
}
exports.default = insertEventTagRelations;
