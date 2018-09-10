"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const perf_hooks_1 = require("perf_hooks");
const express = require("express");
const timeline_1 = require("timeline");
const sql_1 = require("./sql");
const sync_event_1 = require("./sync-event");
const utils_1 = require("./db/utils");
const insert_tag_1 = require("./db/insert-tag");
const delete_event_1 = require("./db/delete-event");
const insert_event_tag_relations_1 = require("./db/insert-event-tag-relations");
const constants_1 = require("./constants");
const fetch_image_1 = require("./wikidata/fetch-image");
const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.post('/events/:wikidataID', (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const event = yield sync_event_1.default(req.params.wikidataID);
    if (event == null) {
        res.status(constants_1.HttpCode.NotFound).end();
        return;
    }
    const fullEvent = yield utils_1.selectOne('event', 'id', event.id);
    res.json(fullEvent);
}));
app.post('/events/:wikidataID/tags', (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const tags = req.body;
    const event = yield utils_1.selectOne('event', 'wikidata_identifier', req.params.wikidataID);
    const code = yield insert_event_tag_relations_1.default(event.id, tags);
    res.status(code).end();
}));
app.get('/events/:wikidataID', (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const event = yield utils_1.selectOne('event', 'wikidata_identifier', req.params.wikidataID);
    if (event == null)
        res.status(constants_1.HttpCode.NotFound).end();
    else
        res.json(event);
}));
const missingImageWhere = "event.has_image IS NULL OR event.has_image = 'none'";
app.get('/events/by-missing/image', utils_1.byMissing(missingImageWhere));
app.get('/events/:wikidataID/image', (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const code = yield fetch_image_1.default({ id: req.params.wikidataID });
    res.status(code).end();
}));
app.delete('/events/:wikidataID', (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const code = yield delete_event_1.default(req.params.wikidataID);
    res.status(code).end();
}));
app.get('/tags', (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const result = yield utils_1.execSql('SELECT * FROM tag');
    res.json(result.rows);
}));
app.post('/tags', (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const tag = req.body;
    const code = yield insert_tag_1.default(tag);
    res.status(code).end();
}));
const missingLabelWhere = 'event.label IS NULL';
app.get('/events/by-missing/label', utils_1.byMissing(missingLabelWhere));
const missingDateWhere = `event.label IS NOT NULL 
				AND event.date_min IS NULL
				AND event.date IS NULL
				AND event.end_date IS NULL
				AND event.end_date_max IS NULL`;
app.get('/events/by-missing/date', utils_1.byMissing(missingDateWhere));
const missingLocationWhere = `NOT EXISTS (SELECT * FROM event__location WHERE event__location.event_id = event.id)`;
app.get('/events/by-missing/location', utils_1.byMissing(missingLocationWhere));
const missingEverythingWhere = `${missingLocationWhere} AND ${missingImageWhere} ${missingDateWhere.slice("event.label IS NOT NULL".length)}`;
app.get('/events/by-missing/everything', utils_1.byMissing(missingEverythingWhere));
app.delete('/events/by-missing/everything', (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const config = { where: missingEverythingWhere };
    let result = yield utils_1.execSql(sql_1.selectEventsSql(config));
    for (const event of result.rows) {
        yield delete_event_1.default(event);
    }
    res.end();
}));
app.get('/events/by-tag/:tag', (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const { limit, viewportWidth, zoomLevel } = req.query;
    const config = {
        from: ['event__tag', 'tag'],
        limit,
        where: 'event__tag.tag_id = tag.id AND event__tag.event_id = event.id AND tag.label = $1'
    };
    const result = yield utils_1.execSql(sql_1.selectEventsSql(config), [req.params.tag]);
    const events = result.rows;
    const from = events[0].date_min || events[0].date;
    const to = events.reduce((prev, curr) => {
        return Math.max(prev, curr.end_date || -Infinity, curr.end_date_max || -Infinity);
    }, -Infinity);
    const pixelsPerMillisecond = timeline_1.calcPixelsPerMillisecond(viewportWidth, zoomLevel, to - from);
    const t0 = perf_hooks_1.performance.now();
    const json = timeline_1.orderEvents(events, pixelsPerMillisecond);
    const t1 = perf_hooks_1.performance.now();
    console.log('Performance order events: ', `${t1 - t0}ms`);
    res.json(json);
}));
const PORT = 3377;
app.listen(PORT);
console.log(`Civ's Log server on port ${PORT}`);
