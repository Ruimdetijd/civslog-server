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
const pool_1 = require("./pool");
const utils_1 = require("../utils");
const sql_1 = require("../sql");
exports.byMissing = (where) => (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { limit } = req.query;
    const config = { limit, where };
    let eventsResult = yield exports.execSql(sql_1.selectEventsSql(config));
    const countResult = yield exports.execSql(`SELECT COUNT(*) FROM event WHERE ${where}`);
    const count = countResult.rows[0].count;
    res.json({ events: eventsResult.rows, count });
});
exports.selectOne = (table, field, value) => __awaiter(this, void 0, void 0, function* () {
    const sql = `SELECT *
				FROM ${table}
				WHERE ${field}=$1`;
    const result = yield exports.execSql(sql, [value]);
    return result.rows[0];
});
exports.execSql = (sql, values = []) => __awaiter(this, void 0, void 0, function* () {
    let result;
    const pool = pool_1.default();
    try {
        result = yield pool.query(sql, values);
    }
    catch (err) {
        utils_1.logError('execSql', ['SQL execution failed', sql, values.map((v, i) => `${i}: ${v}\n`).join(''), err]);
    }
    yield pool.end();
    return result;
});
