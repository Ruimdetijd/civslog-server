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
        this.label = this.getProp(entity.labels);
        this.description = this.getProp(entity.descriptions);
    }
    getProp(prop) {
        if (prop == null)
            return;
        function test(lang) {
            return prop.hasOwnProperty(lang) && prop[lang].hasOwnProperty('value');
        }
        if (test('en'))
            return prop.en.value;
        if (test('de'))
            return prop.de.value;
        if (test('fr'))
            return prop.fr.value;
        if (test('nl'))
            return prop.nl.value;
        if (test('ru'))
            return prop.ru.value;
        if (test('es'))
            return prop.es.value;
        if (test('ca'))
            return prop.ca.value;
        if (test('it'))
            return prop.it.value;
        if (test('pl'))
            return prop.pl.value;
        if (test('pt'))
            return prop.pt.value;
        if (test('ceb'))
            return prop.ceb.value;
        if (test('sv'))
            return prop.sv.value;
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
