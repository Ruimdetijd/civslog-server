"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const utils_1 = require("./utils");
exports.default = (event, startLocations, endLocations = []) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    startLocations = startLocations
        .filter(sl => sl != null)
        .map(bl => {
        bl.date = (event.dmin != null) ? event.dmin : event.d;
        bl.end_date = (event.dmin != null) ? event.d : null;
        return bl;
    });
    if (!endLocations.length) {
        startLocations = startLocations.map(bl => {
            bl.date = (event.dmin != null) ? event.dmin : event.d;
            bl.end_date = (event.dmax != null) ? event.dmax : event.ed;
            return bl;
        });
    }
    endLocations = endLocations
        .filter(sl => sl != null)
        .map(dl => {
        dl.date = event.ed;
        dl.end_date = (event.dmax != null) ? event.dmax : null;
        return dl;
    });
    const locations = startLocations.concat(endLocations).filter(l => l.date != null);
    if (!locations.length)
        return;
    const locStrings = locations.map(loc => {
        const d = event.d == null ? null : `'${event.d}'`;
        const ed = event.ed == null ? null : `'${event.ed}'`;
        return `(${event.id}, ${loc.id}, ${d}, ${ed})`;
    });
    const sql = `INSERT INTO event__location
					(event_id, location_id, d, ed)
				VALUES
					${locStrings}
				ON CONFLICT DO NOTHING`;
    const result = yield utils_1.execSql(sql);
    if (utils_1.hasRows(result)) {
        console.log(`${result.rows.length} location(s) inserted/updated in db!`);
    }
});
