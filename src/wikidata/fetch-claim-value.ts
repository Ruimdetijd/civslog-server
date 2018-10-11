import chalk from 'chalk'
import { WdDate } from '../models'
import { fetchFromWikidata, setUTCDate } from '../utils'

const propertyIdByName: { [key: string]: string } = {
	'image': 'P18',
	'place of birth': 'P19',
	'place of death': 'P20',
	'location': 'P276',
	'date of birth': 'P569',
	'date of death': 'P570',
	'point in time': 'P585',
	'inception': 'P571',
	'dissolved, abolished or demolished': 'P576',
	'start time': 'P580',
	'end time': 'P582',
	'coordinate location': 'P625',
}

const granularityByPrecision: { [key: number]: string } = {
	7: 'CENTURY',
	8: 'DECADE',
	9: 'YEAR',
	10: 'MONTH',
	11: 'DAY',
}
function toISOString(timestamp) {
	if (timestamp == null) return timestamp
	const d = new Date(parseInt(timestamp, 10))
	let year = d.getUTCFullYear() < 0 ? d.getUTCFullYear() * -1 : d.getUTCFullYear()
	// @ts-ignore
	year = year.toString().padStart(4, '0')
	const BCAD = d.getUTCFullYear() < 0 ? 'BC' : 'AD'
	return `${year}-${d.getUTCMonth() + 1}-${d.getUTCDate()} 00:00:00+00 ${BCAD}`
}

const parseDataValueTime = (value): WdDate => {
	if (!granularityByPrecision.hasOwnProperty(value.precision)) {
		console.error(chalk`{red Unknown date precision "${value.precision}"}`)
		return
	}

	const granularity = granularityByPrecision[value.precision]

	const bc = (value.time.charAt(0) === '-') ? '-' : ''
	const dateString = (value.time.charAt(0) === '+' || value.time.charAt(0) === '-') ? value.time.slice(1) : value.time
	let dateParts = dateString.split(/-|T/)
	dateParts[0] = `${bc}${dateParts[0]}`
	if (granularity === 'YEAR') dateParts = dateParts.slice(0, 1)
	else if (granularity === 'MONTH') dateParts = dateParts.slice(0, 2)
	else if (granularity === 'DAY') dateParts = dateParts.slice(0, 3)

	// Months are zero-based indexed
	if (dateParts.length > 1) {
		dateParts[1] = parseInt(dateParts[1], 10) - 1
	}

	// @ts-ignore
	const timestamp = setUTCDate(...dateParts)

	return {
		dateString: toISOString(timestamp),
		granularity,
		timestamp
	}
}

const parseDataValueEntity = (value) => {
	return value.id
}

const parseDateValueCoordinate = (value) => {
	return `${value.latitude} ${value.longitude}`
}

const parseDataValue = (dataValue) => {
	if (dataValue == null) return null
	const { type, value } = dataValue
	if (type === 'string') {
		return value.hasOwnProperty('value') ? value.value : value
	}
	if (type === 'time') return parseDataValueTime(value)
	if (type === 'wikibase-entityid') return parseDataValueEntity(value)
	if (type === 'globecoordinate') return parseDateValueCoordinate(value)
	console.error(chalk`{red Unknown data value type: "${type}"}`)
}

export default async (wdEntityID: string, wdPropertyName: string): Promise<any[]> => {
	const wdPropertyId = propertyIdByName[wdPropertyName]
	const json = await fetchFromWikidata(`?action=wbgetclaims&entity=${wdEntityID}&property=${wdPropertyId}&format=json`)
	if (json == null || !json.hasOwnProperty('claims') || !Object.keys(json.claims).length) return []
	return json.claims[wdPropertyId]
		.map(c => parseDataValue(c.mainsnak.datavalue))
		.filter(c => c != null)
}
