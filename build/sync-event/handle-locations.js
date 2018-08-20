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
const models_1 = require("../models");
const fetch_locations_1 = require("../wikidata/fetch-locations");
const fetch_claim_value_1 = require("../wikidata/fetch-claim-value");
const insert_location_1 = require("../db/insert-location");
const insert_event_location_relations_1 = require("../db/insert-event-location-relations");
const utils_1 = require("../utils");
const utils_2 = require("../db/utils");
exports.default = (event) => __awaiter(this, void 0, void 0, function* () {
    if (event == null)
        return;
    yield utils_2.execSql('DELETE FROM event__location WHERE event_id = $1', [event.id]);
    let endLocations = [];
    let coordinates = yield fetch_claim_value_1.default(event.wikidata_identifier, 'coordinate location');
    let locations = coordinates
        .map(coor => {
        const location = new models_1.WdLocation();
        location.coordinates = coor;
        return location;
    });
    if (!locations.length) {
        const locationProps = ['place of birth', 'location'];
        const locationPromises = locationProps.map(sp => fetch_locations_1.default(event.wikidata_identifier, sp));
        locations = yield utils_1.promiseAll(locationPromises);
        endLocations = yield fetch_locations_1.default(event.wikidata_identifier, 'place of death');
        locations = locations.concat(coordinates);
    }
    locations = yield Promise.all(locations.map((dl) => __awaiter(this, void 0, void 0, function* () { return yield insert_location_1.default(event, dl); })));
    endLocations = yield Promise.all(endLocations.map((dl) => __awaiter(this, void 0, void 0, function* () { return yield insert_location_1.default(event, dl); })));
    yield insert_event_location_relations_1.default(event, locations, endLocations);
});
