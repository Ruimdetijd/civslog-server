"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const locationsSubSelect = `
	, (
		SELECT
			json_agg(
				json_build_object(
					'coor', st_asgeojson(location.coor),
					'coor4326', st_asgeojson(location.coor4326),
					'dmin', event__location.dmin,
					'dmin_g', event__location.dmin_g,
					'd', event__location.d,
					'd_g', event__location.d_g,
					'ed', event__location.ed,
					'ed_g', event__location.ed_g,
					'dmax', event__location.dmax,
					'dmax_g', event__location.dmax_g
				)
			)
		FROM
			location, event__location
		WHERE
			event__location.event_id = event.id and
			event__location.location_id = location.id
	) AS locs`;
exports.selectEventsSql = (props) => {
    const from = props.from != null && Array.isArray(props.from) ? props.from.concat('event') : ['event'];
    const locations = props.locations == null || props.locations !== false ? locationsSubSelect : '';
    const where = props.where == null ? '' : ` WHERE ${props.where} `;
    const limit = props.limit == null ? '' : ` LIMIT ${props.limit}`;
    return `SELECT 
			event.*
			${locations}
		FROM ${from}
		${where}
		ORDER BY
			CASE
				WHEN event.dmin IS NOT NULL THEN event.dmin
				WHEN event.d IS NOT NULL THEN event.d
			END,
			CASE
				WHEN event.ed IS NOT NULL THEN event.ed
				WHEN event.dmax IS NOT NULL THEN event.dmax
			END
		${limit}`;
};
