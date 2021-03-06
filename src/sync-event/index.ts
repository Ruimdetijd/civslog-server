import fetchEntities from "../wikidata/fetch-entities"
import insertEvent from "../db/insert-event"
import handleLocations from "./handle-locations"
import fetchDates from "./fetch-dates"
import { RawEv3nt } from 'timeline';

export default async (wikidataID: string): Promise<RawEv3nt> => {
	const entities = await fetchEntities([wikidataID])
	const entity = entities[0]
	const dates = await fetchDates(entity.id)
	const event = await insertEvent(entity, dates)
	await handleLocations(event)
	return event
}