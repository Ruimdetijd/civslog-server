import { WdDate } from "../models"
import fetchClaimValue from "../wikidata/fetch-claim-value"
import { setUTCDate, promiseAll, logError } from "../utils"

function onDate(a: WdDate, b: WdDate): -1 | 0 | 1 {
	if (a.timestamp > b.timestamp) return 1
	if (a.timestamp < b.timestamp) return -1
	return 0
}

function toEndDate(wdDate: WdDate): WdDate {
	const date = new Date(wdDate.timestamp)
	let nextDate

	if (wdDate.granularity === 'DAY') nextDate = setUTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999)
	else if (wdDate.granularity === 'MONTH') nextDate = setUTCDate(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999)
	else if (wdDate.granularity === 'YEAR') nextDate = setUTCDate(date.getUTCFullYear(), 11, 31, 23, 59, 59, 999)
	else {
		logError('fetchDates', [`Unhandled granularity "${wdDate.granularity}"`])
	}

	if (nextDate != null) {
		wdDate.timestamp = nextDate
	}

	console.log(wdDate)
	return wdDate
}

type DateRange = [WdDate, WdDate, WdDate, WdDate]
export default async (wdEntityID: string): Promise<DateRange> => {
	// Arrange dates in an array: [date_min, date, end_date, end_date_max]
	const dates: DateRange = [new WdDate(), new WdDate(), new WdDate(), new WdDate()]

	// Fetch and sort start dates
	const startProps = ['start time', 'date of birth']
	const startPropsPromises = startProps.map(sp => fetchClaimValue(wdEntityID, sp))
	let startDates: WdDate[] = await promiseAll(startPropsPromises)

	// Fetch and sort end dates
	const endProps = ['end time', 'date of death']
	const endPropsPromises = endProps.map(sp => fetchClaimValue(wdEntityID, sp))
	let endDates: WdDate[] = await promiseAll(endPropsPromises)
	endDates = endDates.map(toEndDate)

	let pointsInTime: WdDate[] = await fetchClaimValue(wdEntityID, 'point in time')
	pointsInTime.sort(onDate)
	if (pointsInTime.length) {
		if (pointsInTime.length === 1) {
			startDates.push(pointsInTime[0])
		}
		else if (pointsInTime.length > 1) {
			if (startDates.length || endDates.length) {
				logError('fetchDates', ['Too many dates found', JSON.stringify(pointsInTime), JSON.stringify(startDates), JSON.stringify(endDates)])
				return dates
			}

			dates[0] = pointsInTime[0]
			const endDateMax = pointsInTime[pointsInTime.length - 1]
			dates[3] = toEndDate(endDateMax)
			return dates
		}
	}

	startDates.sort(onDate)
	endDates.sort(onDate)

	if (startDates.length > 1) dates[0] = startDates[0]
	if (startDates.length) dates[1] = startDates[startDates.length - 1]
	if (endDates.length) dates[2] = endDates[0]
	if (endDates.length > 1) dates[3] = endDates[endDates.length - 1]

	return dates
}