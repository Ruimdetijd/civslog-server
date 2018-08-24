interface Props {
	from?: string[]
	limit?: number
	where?: string
}
export const selectEventsSql = (props: Props) => {
	const from = props.from != null && Array.isArray(props.from) ? props.from.concat('event') : ['event']

	const part1 =
		`SELECT
			event.*,
			(
				SELECT json_agg(tag.label)
				FROM tag, event__tag
				WHERE tag.id = event__tag.tag_id
					AND event__tag.event_id = event.id
			) AS tags,
			(
				SELECT json_agg((ST_AsGeoJson(location.coordinates), event__location.date, event__location.end_date))
				FROM location, event__location
				WHERE event__location.event_id = event.id
					AND event__location.location_id = location.id
			) AS locations
		FROM ${from}`

	const where = props.where == null ? ' ' : ` WHERE ${props.where} `

	const part2 =
		`GROUP BY event.id
		ORDER BY
			CASE
				WHEN event.date_min IS NOT NULL THEN event.date_min
				WHEN event.date IS NOT NULL THEN event.date
			END,
			CASE
				WHEN event.end_date IS NOT NULL THEN event.end_date
				WHEN event.end_date_max IS NOT NULL THEN event.end_date_max
			END`

	const limit = props.limit == null ? '' : ` LIMIT ${props.limit}`

	const sql = part1 + where + part2 + limit

	return sql
}
