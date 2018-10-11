interface Props {
	from?: string[]
	limit?: number
	locations?: boolean
	where?: string
}

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
	) AS locs`

export const selectEventsSql = (props: Props) => {
	const from = props.from != null && Array.isArray(props.from) ? props.from.concat('event') : ['event']
	const locations = props.locations == null || props.locations !== false ? locationsSubSelect : ''
	const where = props.where == null ? '' : ` WHERE ${props.where} `
	const limit = props.limit == null ? '' : ` LIMIT ${props.limit}`

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
		${limit}`
}

// CASE WHEN event.dmin IS NOT NULL THEN event.dmin WHEN event.d IS NOT NULL THEN event.d END, CASE WHEN event.ed IS NOT NULL THEN event.ed WHEN event.dmax IS NOT NULL THEN event.dmax END
// export const selectEventsSql = (props: Props) => {
// 	const from = props.from != null && Array.isArray(props.from) ? props.from.concat('event') : ['event']

// 	const part1 =
// 		`SELECT
// 			event.*,
// 			(
// 				SELECT json_agg(tag.label)
// 				FROM tag, event__tag
// 				WHERE tag.id = event__tag.tag_id
// 					AND event__tag.event_id = event.id
// 			) AS tags,
// 			(
// 				SELECT json_agg((ST_AsGeoJson(location.coordinates), event__location.date, event__location.end_date))
// 				FROM location, event__location
// 				WHERE event__location.event_id = event.id
// 					AND event__location.location_id = location.id
// 			) AS locations
// 		FROM ${from}`


// 	const part2 =
// 		`GROUP BY event.id
// 		ORDER BY
// 			CASE
// 				WHEN event.date_min IS NOT NULL THEN event.date_min
// 				WHEN event.date IS NOT NULL THEN event.date
// 			END,
// 			CASE
// 				WHEN event.end_date IS NOT NULL THEN event.end_date
// 				WHEN event.end_date_max IS NOT NULL THEN event.end_date_max
// 			END`

// 	const limit = props.limit == null ? '' : ` LIMIT ${props.limit}`

// 	const sql = part1 + where + part2 + limit
		
// 	return sql