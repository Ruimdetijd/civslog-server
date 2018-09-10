"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fetch_entities_1 = require("../wikidata/fetch-entities");
const insert_event_1 = require("../db/insert-event");
const handle_locations_1 = require("./handle-locations");
const fetch_dates_1 = require("./fetch-dates");
exports.default = (wikidataID) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const entities = yield fetch_entities_1.default([wikidataID]);
    const entity = entities[0];
    const dates = yield fetch_dates_1.default(entity.id);
    const event = yield insert_event_1.default(entity, dates);
    yield handle_locations_1.default(event);
    return event;
});
