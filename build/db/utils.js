"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const pool_1 = require("./pool");
const utils_1 = require("../utils");
const constants_1 = require("../constants");
const select_events_1 = require("./select-events");
const parse_event_1 = require("../parse-event");
function hasRows(result) {
    return (result != null && result.hasOwnProperty('rows') && result.rows.length);
}
exports.hasRows = hasRows;
exports.byMissing = (where) => (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    where = `(${where}) AND (event.upd IS NULL OR event.upd < NOW() - INTERVAL '7 days')`;
    const { limit } = req.query;
    const config = { limit, where };
    let eventsResult = yield exports.execSql(select_events_1.selectEventsSql(config));
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
function selectEventByWid(id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return yield selectEvent(id, true);
    });
}
exports.selectEventByWid = selectEventByWid;
function selectEvent(id, wid = false) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const field = wid ? 'wid' : 'id';
        const sql = select_events_1.selectEventsSql({
            where: `${field} = $1`
        });
        const result = yield exports.execSql(sql, [id]);
        return parse_event_1.default(result.rows[0]);
    });
}
exports.selectEvent = selectEvent;
function selectChildren(id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const sql = select_events_1.selectEventsSql({
            from: ['event__event'],
            where: 'event__event.parent_event_id = $1 AND event__event.child_event_id = event.id'
        });
        const result = yield exports.execSql(sql, [id]);
        return result.rows.map(parse_event_1.default);
    });
}
exports.selectChildren = selectChildren;
function selectByClass(klass) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const sql = select_events_1.selectEventsSql({
            where: `class @> '{${klass}}'`
        });
        const result = yield exports.execSql(sql);
        if (result == null)
            return [[], constants_1.HttpCode.InternalServerError];
        return [result.rows.map(parse_event_1.default), constants_1.HttpCode.OK];
    });
}
exports.selectByClass = selectByClass;
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
