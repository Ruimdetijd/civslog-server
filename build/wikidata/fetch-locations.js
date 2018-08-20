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
const fetch_claim_value_1 = require("./fetch-claim-value");
const fetch_entities_1 = require("./fetch-entities");
const utils_1 = require("../utils");
exports.default = (wdEntityID, wdPropertyName) => __awaiter(this, void 0, void 0, function* () {
    const locationIds = yield fetch_claim_value_1.default(wdEntityID, wdPropertyName);
    const locations = yield fetch_entities_1.default(locationIds);
    const createLocation = (p) => __awaiter(this, void 0, void 0, function* () {
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
