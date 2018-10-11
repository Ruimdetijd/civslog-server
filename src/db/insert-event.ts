import chalk from 'chalk'
import { WdDate, WdEntity } from '../models'
import { execSql, hasRows } from './utils';
import { logWarning } from '../utils';
import { RawEv3nt } from 'timeline';

export default async (entity: WdEntity, dates: WdDate[]): Promise<RawEv3nt> => {
	let event: RawEv3nt

	if (dates.every(d => d.timestamp == null)) {
		logWarning('insertEvent', [`Entity '${entity.label}' (${entity.id}) has no dates`])
	}
	const [dateMin, date, endDate, endDateMax] = dates

	const sql = `INSERT INTO event
					(lbl, dsc, dmin, d, ed, dmax, dmin_g, d_g, ed_g, dmax_g, wid, upd)
				VALUES
					($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
				ON CONFLICT (wid)
				DO UPDATE SET
					lbl = $1,
					dsc = $2,
					dmin = $3,
					d = $4,
					ed = $5,
					dmax = $6,
					dmin_g = $7,
					d_g = $8,
					ed_g = $9,
					dmax_g = $10,
					upd = NOW()
				RETURNING *`

	const result = await execSql(sql, [
		entity.label,
		entity.description,
		dateMin.dateString,
		date.dateString,
		endDate.dateString,
		endDateMax.dateString,
		dateMin.granularity,
		date.granularity,
		endDate.granularity,
		endDateMax.granularity,
		entity.id
	])

	if (hasRows(result)) {
		console.log(chalk`\n{green [DB] Inserted event:}
{gray label}\t\t\t\t${entity.label}
{gray description}\t\t\t${entity.description}
{gray date min}\t\t\t${dateMin.dateString} (${dateMin.timestamp ? new Date(dateMin.timestamp).toISOString() : ''})
{gray date}\t\t\t\t${date.dateString} (${date.timestamp ? new Date(date.timestamp).toISOString() : ''})
{gray end date}\t\t\t${endDate.dateString} (${endDate.timestamp ? new Date(endDate.timestamp).toISOString() : ''})
{gray end date max}\t\t\t${endDateMax.dateString} (${endDateMax.timestamp ? new Date(endDateMax.timestamp).toISOString() : ''})
{gray date min granularity}\t\t${dateMin.granularity}
{gray date granularity}\t\t${date.granularity}
{gray end date granularity}\t\t${endDate.granularity}
{gray end date max granularity}\t${endDateMax.granularity}
{gray wikidata entity ID}\t\t${entity.id}\n\n`
		)

		event = result.rows[0]
	}


	return event
}