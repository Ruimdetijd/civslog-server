"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const utils_1 = require("./utils");
const constants_1 = require("../constants");
function insertTag(tag) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (tag == null || tag.label == null || tag.id == null)
            return constants_1.HttpCode.BadRequest;
        const sql = `INSERT INTO tag
					(label, description, wikidata_identifier)
				VALUES
					($1, $2, $3)
				ON CONFLICT (wikidata_identifier)
				DO UPDATE SET
					label = $1,
					description = $2
				RETURNING *`;
        yield utils_1.execSql(sql, [tag.label, tag.description, tag.id]);
        return constants_1.HttpCode.NoContent;
    });
}
exports.default = insertTag;
