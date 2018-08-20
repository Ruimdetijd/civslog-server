import chalk from 'chalk'
import { execSql } from './utils';
import { HttpCode } from '../constants';

export default async function insertEventTagRelations(eventId, tagIds): Promise<HttpCode> {
	if (eventId == null || !tagIds.length) return HttpCode.BadRequest

	const result = await execSql(`INSERT INTO event__tag
									(event_id, tag_id)
								VALUES
									${tagIds.map(id => `(${eventId}, ${id})`)}
								ON CONFLICT DO NOTHING`)

	if (result.rows.length) console.log(chalk`{green ${result.rows.length.toString()} tag(s) inserted/updated in db!}`)

	return HttpCode.NoContent
}