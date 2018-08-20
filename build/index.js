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
const express = require("express");
const timeline_1 = require("timeline");
const sql_1 = require("./sql");
const sync_event_1 = require("./sync-event");
const utils_1 = require("./db/utils");
const insert_tag_1 = require("./db/insert-tag");
const delete_event_1 = require("./db/delete-event");
const insert_event_tag_relations_1 = require("./db/insert-event-tag-relations");
const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.post('/events/:wikidataID', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const event = yield sync_event_1.default(req.params.wikidataID);
    const fullEvent = yield utils_1.selectOne('event', 'id', event.id);
    res.json(fullEvent);
}));
app.post('/events/:wikidataID/tags', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const tags = req.body;
    const event = yield utils_1.selectOne('event', 'wikidata_identifier', req.params.wikidataID);
    const code = yield insert_event_tag_relations_1.default(event.id, tags);
    res.status(code).end();
}));
app.get('/events/:wikidataID', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const event = yield utils_1.selectOne('event', 'wikidata_identifier', req.params.wikidataID);
    res.json(event);
}));
app.delete('/events/:wikidataID', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const code = yield delete_event_1.default(req.params.wikidataID);
    res.status(code).end();
}));
app.get('/tags', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const result = yield utils_1.execSql('SELECT * FROM tag');
    res.json(result.rows);
}));
app.post('/tags', (req, res) => __awaiter(this, void 0, void 0, function* () {
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
const missingEverythingWhere = `${missingLocationWhere} AND ${missingLabelWhere} ${missingDateWhere.slice("event.label IS NOT NULL".length)}`;
app.get('/events/by-missing/everything', utils_1.byMissing(missingEverythingWhere));
app.delete('/events/by-missing/everything', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const config = { where: missingEverythingWhere };
    let result = yield utils_1.execSql(sql_1.selectEventsSql(config));
    for (const event of result.rows) {
        yield delete_event_1.default(event);
    }
    res.end();
}));
app.get('/events/by-tag/:tag', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { limit, viewportWidth, zoomLevel } = req.query;
    const config = {
        from: ['event__tag', 'tag'],
        limit,
        where: 'event__tag.tag_id = tag.id AND event__tag.event_id = event.id AND tag.label = $1'
    };
    const result = yield utils_1.execSql(sql_1.selectEventsSql(config), [req.params.tag]);
    const events = result.rows.filter(e => !(e.date_min == null && e.date == null && e.end_date == null && e.end_date_max == null));
    const from = events[0].date_min || events[0].date;
    const to = events.reduce((prev, curr) => {
        return Math.max(prev, curr.end_date || -Infinity, curr.end_date_max || -Infinity);
    }, -Infinity);
    const pixelsPerMillisecond = timeline_1.calcPixelsPerMillisecond(viewportWidth, zoomLevel, to - from);
    res.json(timeline_1.orderEvents(events, pixelsPerMillisecond));
}));
const PORT = 3377;
app.listen(PORT);
console.log(`Civ's Log server on port ${PORT}`);
