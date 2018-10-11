import { WdLocation } from '../models'
import { execSql, hasRows } from './utils';
import { RawEv3nt } from 'timeline';

export default async (event: RawEv3nt, startLocations: WdLocation[], endLocations: WdLocation[] = []) => {
	startLocations = startLocations
		.filter(sl => sl != null)
		.map(bl => {
			bl.date = (event.dmin != null) ? event.dmin : event.d
			bl.end_date = (event.dmin != null) ? event.d : null
			return bl
		})

	if (!endLocations.length) {
		startLocations = startLocations.map(bl => {
			bl.date = (event.dmin != null) ? event.dmin : event.d
			bl.end_date = (event.dmax != null) ? event.dmax : event.ed
			return bl
		})
	}

	endLocations = endLocations
		.filter(sl => sl != null)
		.map(dl => {
			dl.date = event.ed
			dl.end_date = (event.dmax != null) ? event.dmax : null
			return dl
		})

	const locations = startLocations.concat(endLocations).filter(l => l.date != null)
	if (!locations.length) return

	const locStrings = locations.map(loc => {
		const d = event.d == null ? null : `'${event.d}'`	
		const ed = event.ed == null ? null : `'${event.ed}'`	
		return `(${event.id}, ${loc.id}, ${d}, ${ed})`
	})

	const sql = `INSERT INTO event__location
					(event_id, location_id, d, ed)
				VALUES
					${locStrings}
				ON CONFLICT DO NOTHING`

	const result = await execSql(sql)

	if (hasRows(result)) {
		console.log(`${result.rows.length} location(s) inserted/updated in db!`)
	} 
}
