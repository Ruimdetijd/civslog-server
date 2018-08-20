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
const utils_1 = require("./utils");
exports.default = (eventId, tagIds) => __awaiter(this, void 0, void 0, function* () {
    if (eventId == null || !tagIds.length)
        return;
    const rows = yield utils_1.execSql(`INSERT INTO event__tag
									(event_id, tag_id)
								VALUES
									${tagIds.map(id => `(${eventId}, ${id})`)}
								ON CONFLICT DO NOTHING`);
    if (rows.length)
        console.log(chalk_1.default `{green ${rows.length.toString()} tag(s) inserted/updated in db!}`);
});
