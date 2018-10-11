import { execSql, selectEventByWid } from "./utils";
import { logMessage, logError } from "../utils";
import { HttpCode } from "../constants";
import { RawEv3nt } from 'timeline';

// TODO use transactions
 async function deleteEvent(x: string): Promise<HttpCode>
 async function deleteEvent(x: RawEv3nt): Promise<HttpCode>
 async function deleteEvent(x) {
	let event: RawEv3nt = x

	if (typeof event === 'string') {
		event = await selectEventByWid(event)
	}

	if (event == null) {
		logError('deleteEvent', [`Event ${event} does not exist!`])
		return HttpCode.NotFound
	}

	await execSql(`DELETE FROM event__location WHERE event_id = $1`, [event.id])
	await execSql(`DELETE FROM event__tag WHERE event_id = $1`, [event.id])
	await execSql(`DELETE FROM event__event WHERE parent_event_id = $1 OR child_event_id = $1`, [event.id])
	await execSql(`DELETE FROM event WHERE id = $1`, [event.id])

	logMessage(`Event ${event.lbl} - ${event.wid} deleted!`)
	return HttpCode.NoContent
}

export default deleteEvent