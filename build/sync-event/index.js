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
const fetch_entities_1 = require("../wikidata/fetch-entities");
const insert_event_1 = require("../db/insert-event");
const handle_locations_1 = require("./handle-locations");
const fetch_dates_1 = require("./fetch-dates");
exports.default = (wikidataID) => __awaiter(this, void 0, void 0, function* () {
    const entities = yield fetch_entities_1.default([wikidataID]);
    const entity = entities[0];
    const dates = yield fetch_dates_1.default(entity.id);
    const event = yield insert_event_1.default(entity, dates);
    yield handle_locations_1.default(event);
    return event;
});
