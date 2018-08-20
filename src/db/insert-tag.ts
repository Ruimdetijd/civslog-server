import { execSql } from './utils';
import { HttpCode } from '../constants';
import { WdEntity } from '../models';

export default async function insertTag(tag: WdEntity): Promise<HttpCode> {
	if (tag == null || tag.label == null || tag.id == null) return HttpCode.BadRequest

	const sql = `INSERT INTO tag
					(label, description, wikidata_identifier)
				VALUES
					($1, $2, $3)
				ON CONFLICT (wikidata_identifier)
				DO UPDATE SET
					label = $1,
					description = $2
				RETURNING *`

	// TODO handle error
	await execSql(sql, [tag.label, tag.description, tag.id])

	return HttpCode.NoContent
}