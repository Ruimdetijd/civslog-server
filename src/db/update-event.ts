import { execSql } from './utils';

export default async function updateEvent(id: string, field: string, value: string) {
	const sql = `UPDATE event
				SET ${field} = $1
				WHERE id = $2`
	const result = await execSql(sql, [value, id])
	return result
}