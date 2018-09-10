import { fetchFromWikidata } from "../utils"
import { WdEntity } from "../models"

export default async (wdEntityIDs: string[]): Promise<WdEntity[]> => {
	if (!wdEntityIDs.length) return []
	const json = await fetchFromWikidata(`?action=wbgetentities&ids=${wdEntityIDs.join('|')}&props=labels|descriptions&format=json`)
	return Object.keys(json.entities).map(k => json.entities[k]).map(e => new WdEntity(e))
}
