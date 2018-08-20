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
const utils_1 = require("../utils");
const models_1 = require("../models");
const constants_1 = require("../constants");
exports.default = (wdEntityIDs) => __awaiter(this, void 0, void 0, function* () {
    if (!wdEntityIDs.length)
        return [];
    const json = yield utils_1.execFetch(`${constants_1.WIKIDATA_URL}?action=wbgetentities&ids=${wdEntityIDs.join('|')}&props=labels|descriptions&languages=en&format=json`);
    return Object.keys(json.entities).map(k => json.entities[k]).map(e => new models_1.WdEntity(e));
});
