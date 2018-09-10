"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const pool_1 = require("./pool");
const utils_1 = require("../utils");
const sql_1 = require("../sql");
function hasRows(result) {
    return (result != null && result.hasOwnProperty('rows') && result.rows.length);
}
exports.hasRows = hasRows;
exports.byMissing = (where) => (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    where = `(${where}) AND (event.updated IS NULL OR event.updated < NOW() - INTERVAL '7 days')`;
    const { limit } = req.query;
    const config = { limit, where };
    let eventsResult = yield exports.execSql(sql_1.selectEventsSql(config));
    const countResult = yield exports.execSql(`SELECT COUNT(*) FROM event WHERE ${where}`);
    const count = countResult.rows[0].count;
    res.json({ events: eventsResult.rows, count });
});
exports.selectOne = (table, field, value) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const sql = `SELECT *
				FROM ${table}
				WHERE ${field}=$1`;
    const result = yield exports.execSql(sql, [value]);
    return result.rows[0];
});
exports.execSql = (sql, values = []) => tslib_1.__awaiter(this, void 0, void 0, function* () {
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
