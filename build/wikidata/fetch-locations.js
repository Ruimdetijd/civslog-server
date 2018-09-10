"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fetch_claim_value_1 = require("./fetch-claim-value");
const fetch_entities_1 = require("./fetch-entities");
const utils_1 = require("../utils");
exports.default = (wdEntityID, wdPropertyName) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const locationIds = yield fetch_claim_value_1.default(wdEntityID, wdPropertyName);
    const locations = yield fetch_entities_1.default(locationIds);
    const createLocation = (p) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const label = p.label;
        const rawCoordinates = yield fetch_claim_value_1.default(p.id, 'coordinate location');
        let coordinates;
        if (rawCoordinates.length) {
            if (rawCoordinates.length > 1)
                utils_1.logError('fetchLocations', [`Multiple coordinates for location "${label}"`, `values: ${JSON.stringify(rawCoordinates)}`]);
            coordinates = rawCoordinates[0];
        }
        const location = {
            coordinates,
            description: p.description,
            label,
            wikidata_identifier: p.id,
        };
        return location;
    });
    return yield Promise.all(locations.map(createLocation));
});
