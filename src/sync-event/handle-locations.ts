import { WdLocation } from "../models"
import fetchLocations from "../wikidata/fetch-locations"
import fetchClaimValue from "../wikidata/fetch-claim-value"
import insertLocation from "../db/insert-location"
import insertEventLocationRelations from "../db/insert-event-location-relations"
import { promiseAll } from "../utils"
import { execSql } from "../db/utils";
import { RawEv3nt } from 'timeline';

export default async (event: RawEv3nt) => {
	if (event == null) return
	await execSql('DELETE FROM event__location WHERE event_id = $1', [event.id])

	let endLocations: WdLocation[] = []

	// First check for the prop coordinate location
	let coordinates = await fetchClaimValue(event.wid, 'coordinate location')
	let locations: WdLocation[] = coordinates
		.map(coor => {
			const location = new WdLocation()
			location.coordinates = coor
			return location
		})

	// If a coordinate location is found, we use it, so we're done. If not, check for 'location' props.
	if (!locations.length) {
		const locationProps = ['place of birth', 'location']
		const locationPromises = locationProps.map(sp => fetchLocations(event.wid, sp))
		locations = await promiseAll(locationPromises)
		endLocations = await fetchLocations(event.wid, 'place of death')
		locations = locations.concat(coordinates)
	}

	// Insert locations in to the database
	locations = await Promise.all(locations.map(async (dl) => await insertLocation(event, dl)))
	endLocations = await Promise.all(endLocations.map(async (dl) => await insertLocation(event, dl)))

	// Link the event to the location in the database
	await insertEventLocationRelations(event, locations, endLocations)
}