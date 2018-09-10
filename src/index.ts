import { performance } from 'perf_hooks'
import * as express from 'express'
import { calcPixelsPerMillisecond, orderEvents } from 'timeline'
import { selectEventsSql } from './sql';
import syncEvent from './sync-event'
import { execSql, selectOne, byMissing } from './db/utils'
import insertTag from './db/insert-tag'
import deleteEvent from './db/delete-event';
import insertEventTagRelations from './db/insert-event-tag-relations';
import { HttpCode } from './constants';
import fetchImage from './wikidata/fetch-image';

const app = express()
app.disable('x-powered-by')
app.use(express.json())

app.post('/events/:wikidataID', async (req, res) => {
	const event = await syncEvent(req.params.wikidataID)
	if (event == null) {
		res.status(HttpCode.NotFound).end()
		return
	}
	const fullEvent = await selectOne('event', 'id', event.id)
	res.json(fullEvent)
})

app.post('/events/:wikidataID/tags', async (req, res) => {
	const tags = req.body
	const event = await selectOne('event', 'wikidata_identifier', req.params.wikidataID)
	const code = await insertEventTagRelations(event.id, tags)
	res.status(code).end()
})

app.get('/events/:wikidataID', async (req, res) => {
	const event = await selectOne('event', 'wikidata_identifier', req.params.wikidataID)
	if (event == null) res.status(HttpCode.NotFound).end()
	else res.json(event)
})

const missingImageWhere = "event.has_image IS NULL OR event.has_image = 'none'"
app.get('/events/by-missing/image', byMissing(missingImageWhere))

app.get('/events/:wikidataID/image', async (req, res) => {
	const code = await fetchImage({ id: req.params.wikidataID })
	res.status(code).end()
})

app.delete('/events/:wikidataID', async (req, res) => {
	const code = await deleteEvent(req.params.wikidataID)
	res.status(code).end()
})

app.get('/tags', async (req, res) => {
	const result = await execSql('SELECT * FROM tag')
	res.json(result.rows)
})

app.post('/tags', async (req, res) => {
	const tag = req.body
	const code = await insertTag(tag)
	res.status(code).end()
})

const missingLabelWhere = 'event.label IS NULL'
app.get('/events/by-missing/label', byMissing(missingLabelWhere))

const missingDateWhere = `event.label IS NOT NULL 
				AND event.date_min IS NULL
				AND event.date IS NULL
				AND event.end_date IS NULL
				AND event.end_date_max IS NULL`
app.get('/events/by-missing/date', byMissing(missingDateWhere))

const missingLocationWhere = `NOT EXISTS (SELECT * FROM event__location WHERE event__location.event_id = event.id)`
app.get('/events/by-missing/location', byMissing(missingLocationWhere))

const missingEverythingWhere = `${missingLocationWhere} AND ${missingImageWhere} ${missingDateWhere.slice("event.label IS NOT NULL".length)}`
app.get('/events/by-missing/everything', byMissing(missingEverythingWhere))
app.delete('/events/by-missing/everything', async (req, res) => {
	const config = { where: missingEverythingWhere }
	let result = await execSql(selectEventsSql(config))
	for (const event of result.rows) {
		await deleteEvent(event)
	}
	res.end()	
})

app.get('/events/by-tag/:tag', async (req, res) => {
	const { limit, viewportWidth, zoomLevel } = req.query

	const config = {
		from: ['event__tag', 'tag'],
		limit,
		where: 'event__tag.tag_id = tag.id AND event__tag.event_id = event.id AND tag.label = $1'
	}
	const result = await execSql(selectEventsSql(config), [req.params.tag])

	const events = result.rows

	const from = events[0].date_min || events[0].date
	const to = events.reduce((prev, curr) => {
		return Math.max(prev, curr.end_date || -Infinity, curr.end_date_max || -Infinity)
	}, -Infinity)

	const pixelsPerMillisecond = calcPixelsPerMillisecond(viewportWidth, zoomLevel, to - from)

	const t0 = performance.now()
	const json = orderEvents(events, pixelsPerMillisecond)
	const t1 = performance.now(); console.log('Performance order events: ', `${t1 - t0}ms`)
	res.json(json)
})

const PORT = 3377
app.listen(PORT)
console.log(`Civ's Log server on port ${PORT}`)
