import { RawEv3nt } from 'timeline';

function parseDateString(value: string): number {
	if (value == null) return null

	if (value.slice(-2) === 'BC') {
		const firstDashIndex = value.indexOf('-')
		let year = value.slice(0, firstDashIndex)
		// @ts-ignore
		year = year.padStart(6, '0')
		value = `-${year}${value.slice(firstDashIndex, -2)}`.trim()
	}

	return new Date(value).getTime()
}
function parseDateObject(dateObject: Object): number {
	if (dateObject == null) return null
	let value = dateObject.toString()
	return parseDateString(value)
}

export default function parseEvent(event: any): RawEv3nt {
	if (event == null) return null

	event.dmin = parseDateString(event.dmin)
	event.d = parseDateString(event.d)
	event.ed = parseDateString(event.ed)
	event.dmax = parseDateString(event.dmax)

	if (Array.isArray(event.locs)) {
		event.locs = event.locs.map(loc => {
			loc.coor = JSON.parse(loc.coor)
			loc.coor4326 = JSON.parse(loc.coor4326)
			loc.dmin = parseDateObject(loc.dmin)
			loc.d = parseDateObject(loc.d)
			loc.ed = parseDateObject(loc.ed)
			loc.dmax = parseDateObject(loc.dmax)
			return loc
		})
	}

	if (event.class != null && event.class.length > 1) {
		event.class = event.class.slice(1, -1).split(',')
	}

	delete event.upd

	return event
}