import chalk from 'chalk'
import { execSql, hasRows } from './utils'
import { WdLocation } from '../models'
import { RawEv3nt } from 'timeline';

export default async (event: RawEv3nt, location: WdLocation): Promise<WdLocation> => {
	if (location.coordinates == null) return 

	const coor = location.coordinates.split(' ').reverse().join(' ')

	const sql = `INSERT INTO location
					(lbl, dsc, coor, coor4326, wid)
				VALUES
					($1, $2, ST_Transform(ST_GeomFromText('POINT(${coor})',4326),3857), ST_GeogFromText('SRID=4326;POINT(${coor})'), $3)
				ON CONFLICT (wid)
				DO UPDATE SET
					lbl = $1,
					dsc = $2,
					wid = $3
				RETURNING *`

	const result = await execSql(sql, [location.label, location.description, location.wikidata_identifier])

	if (hasRows(result)) {
		console.log(chalk`\n{green [DB] Inserted location:}
{gray label}\t\t\t${location.label}
{gray description}\t\t${location.description}
{gray coordinates}\t\t${location.coordinates}
{gray wikidata entity ID}\t${location.wikidata_identifier}\n\n`
		)
		location = result.rows[0]
	}

	return location
}