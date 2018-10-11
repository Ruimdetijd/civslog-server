import createPool from './pool'
import { logError } from '../utils'
import { QueryResult } from 'pg';
import { HttpCode } from '../constants';
import { selectEventsSql } from './select-events';
import { RawEv3nt } from 'timeline';
import parseEvent from '../parse-event';

export function hasRows(result: QueryResult) {
	return (result != null && result.hasOwnProperty('rows') && result.rows.length)
}

export const byMissing = (where) => async (req, res) => {
	where = `(${where}) AND (event.upd IS NULL OR event.upd < NOW() - INTERVAL '7 days')`
	const { limit } = req.query
	const config = { limit, where }
	let eventsResult = await execSql(selectEventsSql(config))

	const countResult = await execSql(`SELECT COUNT(*) FROM event WHERE ${where}`)
	const count = countResult.rows[0].count

	res.json({ events: eventsResult.rows, count })
}

export const selectOne = async (table, field, value): Promise<any> => {
	const sql = `SELECT *
				FROM ${table}
				WHERE ${field}=$1`
	const result = await execSql(sql, [value])
	return result.rows[0]
}

export async function selectEventByWid(id: string) {
	return await selectEvent(id, true)
}
export async function selectEvent(id: string, wid: boolean = false): Promise<RawEv3nt> {
	const field = wid ? 'wid' : 'id'

	const sql = selectEventsSql({
		where: `${field} = $1`
	})
	const result = await execSql(sql, [id])

	return parseEvent(result.rows[0])
}

export async function selectChildren(id: string): Promise<RawEv3nt[]> {
	const sql = selectEventsSql({
		from: ['event__event'],
		where: 'event__event.parent_event_id = $1 AND event__event.child_event_id = event.id'
	})
	const result = await execSql(sql, [id])
	return result.rows.map(parseEvent)
}

export async function selectByClass(klass: string): Promise<[RawEv3nt[], HttpCode]> {
	const sql = selectEventsSql({
		where: `class @> '{${klass}}'`
	})
	const result = await execSql(sql)

	if (result == null) return [[], HttpCode.InternalServerError]

	return [result.rows.map(parseEvent), HttpCode.OK]
}

export const execSql = async (sql: string, values: (string | number)[] = []) : Promise<QueryResult> => {
	let result

	const pool = createPool()

	try {
		result = await pool.query(sql, values)
	} catch (err) {
		logError('execSql', ['SQL execution failed', sql, values.map((v, i) => `${i}: ${v}\n`).join(''), err])		
	}

	await pool.end()

	return result
}