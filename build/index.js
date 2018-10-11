"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express = require("express");
const timeline_1 = require("timeline");
const sync_event_1 = require("./sync-event");
const utils_1 = require("./db/utils");
const delete_event_1 = require("./db/delete-event");
const constants_1 = require("./constants");
const fetch_image_1 = require("./wikidata/fetch-image");
const select_events_1 = require("./db/select-events");
const update_event_1 = require("./db/update-event");
const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.post('/events/by-wikidata-id/:wikidataID', (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const event = yield sync_event_1.default(req.params.wikidataID);
    if (event == null) {
        res.status(constants_1.HttpCode.NotFound).end();
        return;
    }
    const fullEvent = yield utils_1.selectEvent(event.id);
    res.json(fullEvent);
}));
app.get('/events/by-wikidata-id/:wikidataID', (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const event = yield utils_1.selectEventByWid(req.params.wikidataID);
    if (event == null)
        res.status(constants_1.HttpCode.NotFound).end();
    else
        res.json(event);
}));
app.post('/events/:id/classes', (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    if (!Array.isArray(req.body)) {
        res.status(constants_1.HttpCode.BadRequest).end();
        return;
    }
    const event = yield utils_1.selectEvent(req.params.id);
    const classes = `{${req.body.join(',')}}`;
    yield update_event_1.default(event.id, 'class', classes);
    res.end();
}));
app.get('/events/:id', (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const event = yield utils_1.selectEvent(req.params.id);
    if (event == null) {
        res.status(constants_1.HttpCode.NotFound).end();
        return;
    }
    const children = yield utils_1.selectChildren(req.params.id);
    res.json({
        event,
        children
    });
}));
app.get('/events/by-wikidata-id/:wikidataID/image', (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const code = yield fetch_image_1.default({ id: req.params.wikidataID });
    res.status(code).end();
}));
app.delete('/events/by-wikidata-id/:wikidataID', (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const code = yield delete_event_1.default(req.params.wikidataID);
    res.status(code).end();
}));
app.get('/classes', (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const result = yield utils_1.execSql('SELECT enum_range(NULL::classtype)');
    if (result == null || !result.hasOwnProperty('rows') || !result.rows.length) {
        res.status(constants_1.HttpCode.InternalServerError).end();
        return;
    }
    const classes = result.rows[0]['enum_range']
        .slice(1, -1)
        .split(',')
        .map(t => {
        if (t.charAt(0) === '"')
            t = t.slice(1);
        if (t.charAt(t.length - 1) === '"')
            t = t.slice(0, -1);
        return t;
    });
    res.json(classes);
}));
const missingImageWhere = "event.img IS NULL";
app.get('/events/by-missing/image', utils_1.byMissing(missingImageWhere));
const missingLabelWhere = 'event.lbl IS NULL';
app.get('/events/by-missing/label', utils_1.byMissing(missingLabelWhere));
const missingDateWhere = `event.lbl IS NOT NULL 
				AND event.dmin IS NULL
				AND event.d IS NULL
				AND event.ed IS NULL
				AND event.dmax IS NULL`;
app.get('/events/by-missing/date', utils_1.byMissing(missingDateWhere));
const missingLocationWhere = `NOT EXISTS (SELECT * FROM event__location WHERE event__location.event_id = event.id)`;
app.get('/events/by-missing/location', utils_1.byMissing(missingLocationWhere));
const missingEverythingWhere = `${missingLocationWhere} AND ${missingImageWhere} ${missingDateWhere.slice("event.lbl IS NOT NULL".length)}`;
app.get('/events/by-missing/everything', utils_1.byMissing(missingEverythingWhere));
app.delete('/events/by-missing/everything', (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const config = { where: missingEverythingWhere };
    let result = yield utils_1.execSql(select_events_1.selectEventsSql(config));
    for (const event of result.rows) {
        yield delete_event_1.default(event);
    }
    res.end();
}));
app.get('/events/by-class/:class', (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let [events, code] = yield utils_1.selectByClass(req.params.class);
    if (code != constants_1.HttpCode.OK) {
        res.status(code).end();
        return;
    }
    res.json(events);
}));
app.get('/ordered-event/:id', (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const parent = yield utils_1.selectEvent(req.params.id);
    if (parent == null) {
        res.status(constants_1.HttpCode.NotFound).end();
        return;
    }
    const children = yield utils_1.selectChildren(req.params.id);
    if (!children.length) {
        res.json({ parent, children: new timeline_1.OrderedTimeline() });
        return;
    }
    res.json({
        parent,
        children,
    });
}));
const PORT = 3377;
app.listen(PORT);
console.log(`Civ's Log server on port ${PORT}`);
