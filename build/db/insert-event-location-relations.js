"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const utils_1 = require("./utils");
exports.default = (event, startLocations, endLocations = []) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    startLocations = startLocations
        .filter(sl => sl != null)
        .map(bl => {
        bl.date = (event.date_min != null) ? event.date_min : event.date;
        bl.end_date = (event.date_min != null) ? event.date : null;
        return bl;
    });
    if (!endLocations.length) {
        startLocations = startLocations.map(bl => {
            bl.date = (event.date_min != null) ? event.date_min : event.date;
            bl.end_date = (event.end_date_max != null) ? event.end_date_max : event.end_date;
            return bl;
        });
    }
    endLocations = endLocations
        .filter(sl => sl != null)
        .map(dl => {
        dl.date = event.end_date;
        dl.end_date = (event.end_date_max != null) ? event.end_date_max : null;
        return dl;
    });
    const locations = startLocations.concat(endLocations).filter(l => l.date != null);
    if (!locations.length)
        return;
    const sql = `INSERT INTO event__location
					(event_id, location_id, date, end_date)
				VALUES
					${locations.map(location => `(${event.id}, ${location.id}, ${location.date}, ${location.end_date})`)}
				ON CONFLICT DO NOTHING`;
    const result = yield utils_1.execSql(sql);
    if (utils_1.hasRows(result)) {
        console.log(`${result.rows.length} location(s) inserted/updated in db!`);
    }
});
