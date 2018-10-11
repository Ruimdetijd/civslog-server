"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const utils_1 = require("./utils");
function updateEvent(id, field, value) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const sql = `UPDATE event
				SET ${field} = $1
				WHERE id = $2`;
        const result = yield utils_1.execSql(sql, [value, id]);
        return result;
    });
}
exports.default = updateEvent;
