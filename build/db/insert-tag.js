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
const constants_1 = require("../constants");
function insertTag(tag) {
    return __awaiter(this, void 0, void 0, function* () {
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
