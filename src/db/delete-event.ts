import { execSql, selectOne } from "./utils";
import { logMessage, logError } from "../utils";
import { Ev3nt } from "../models";
import { HttpCode } from "../constants";

// TODO use transactions
 async function deleteEvent(x: string): Promise<HttpCode>
 async function deleteEvent(x: Ev3nt): Promise<HttpCode>
 async function deleteEvent(x) {
	let event: Ev3nt = x

	if (typeof x === 'string') {
		event = await selectOne('event', 'wikidata_identifier', event)
	}

	if (event == null) {
		logError('deleteEvent', [`Event ${x} does not exist!`])
		return HttpCode.NotFound
	}

	await execSql(`DELETE FROM event__location WHERE event_id = $1`, [event.id])
	await execSql(`DELETE FROM event__tag WHERE event_id = $1`, [event.id])
	await execSql(`DELETE FROM event__event WHERE parent_event_id = $1 OR child_event_id = $1`, [event.id])
	await execSql(`DELETE FROM event WHERE id = $1`, [event.id])

	logMessage(`Event ${event.label} - ${event.wikidata_identifier} deleted!`)
	return HttpCode.NoContent
}

export default deleteEvent