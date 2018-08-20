"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WdDate {
    constructor() {
        this.dateString = null;
        this.granularity = null;
        this.timestamp = null;
    }
}
exports.WdDate = WdDate;
class WdEntity {
    constructor(entity) {
        this.id = entity.id;
        if (entity.hasOwnProperty('labels') && entity.labels.hasOwnProperty('en') && entity.labels.en.hasOwnProperty('value'))
            this.label = entity.labels.en.value;
        if (entity.hasOwnProperty('descriptions') && entity.descriptions.hasOwnProperty('en') && entity.descriptions.en.hasOwnProperty('value'))
            this.description = entity.descriptions.en.value;
    }
}
exports.WdEntity = WdEntity;
class WdLocation {
    constructor() {
        this.description = null;
        this.label = null;
        this.wikidata_identifier = null;
    }
}
exports.WdLocation = WdLocation;
class Ev3nt {
}
exports.Ev3nt = Ev3nt;
