import createPool from './pool'
import { logError } from '../utils'
import { selectEventsSql } from '../sql';
import { QueryResult } from 'pg';

export function hasRows(result: QueryResult) {
	return (result != null && result.hasOwnProperty('rows') && result.rows.length)
}

export const byMissing = (where) => async (req, res) => {
	where = `(${where}) AND (event.updated IS NULL OR event.updated < NOW() - INTERVAL '7 days')`
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