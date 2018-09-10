"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const utils_1 = require("../utils");
const models_1 = require("../models");
exports.default = (wdEntityIDs) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    if (!wdEntityIDs.length)
        return [];
    const json = yield utils_1.fetchFromWikidata(`?action=wbgetentities&ids=${wdEntityIDs.join('|')}&props=labels|descriptions&format=json`);
    return Object.keys(json.entities).map(k => json.entities[k]).map(e => new models_1.WdEntity(e));
});
