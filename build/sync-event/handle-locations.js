"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const models_1 = require("../models");
const fetch_locations_1 = require("../wikidata/fetch-locations");
const fetch_claim_value_1 = require("../wikidata/fetch-claim-value");
const insert_location_1 = require("../db/insert-location");
const insert_event_location_relations_1 = require("../db/insert-event-location-relations");
const utils_1 = require("../utils");
const utils_2 = require("../db/utils");
exports.default = (event) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    if (event == null)
        return;
    yield utils_2.execSql('DELETE FROM event__location WHERE event_id = $1', [event.id]);
    let endLocations = [];
    let coordinates = yield fetch_claim_value_1.default(event.wid, 'coordinate location');
    let locations = coordinates
        .map(coor => {
        const location = new models_1.WdLocation();
        location.coordinates = coor;
        return location;
    });
    if (!locations.length) {
        const locationProps = ['place of birth', 'location'];
        const locationPromises = locationProps.map(sp => fetch_locations_1.default(event.wid, sp));
        locations = yield utils_1.promiseAll(locationPromises);
        endLocations = yield fetch_locations_1.default(event.wid, 'place of death');
        locations = locations.concat(coordinates);
    }
    locations = yield Promise.all(locations.map((dl) => tslib_1.__awaiter(this, void 0, void 0, function* () { return yield insert_location_1.default(event, dl); })));
    endLocations = yield Promise.all(endLocations.map((dl) => tslib_1.__awaiter(this, void 0, void 0, function* () { return yield insert_location_1.default(event, dl); })));
    yield insert_event_location_relations_1.default(event, locations, endLocations);
});
