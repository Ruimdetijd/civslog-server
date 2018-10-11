// import { performance } from 'perf_hooks'
import * as express from 'express'
import { OrderedTimeline, RawEv3nt } from 'timeline'
import syncEvent from './sync-event'
import { execSql, byMissing, selectChildren, selectByClass, selectEvent, selectEventByWid } from './db/utils'
// import insertTag from './db/insert-tag'
import deleteEvent from './db/delete-event';
// import insertEventTagRelations from './db/insert-event-tag-relations';
import { HttpCode } from './constants';
import fetchImage from './wikidata/fetch-image';
import { selectEventsSql } from './db/select-events';
import updateEvent from './db/update-event';

const app = express()
app.disable('x-powered-by')
app.use(express.json())

app.post('/events/by-wikidata-id/:wikidataID', async (req, res) => {
	const event = await syncEvent(req.params.wikidataID)
	if (event == null) {
		res.status(HttpCode.NotFound).end()
		return
	}
	const fullEvent = await selectEvent(event.id)
	res.json(fullEvent)
})

app.get('/events/by-wikidata-id/:wikidataID', async (req, res) => {
	const event = await selectEventByWid(req.params.wikidataID)
	if (event == null) res.status(HttpCode.NotFound).end()
	else res.json(event)
})

app.post('/events/:id/classes', async (req, res) => {
	if (!Array.isArray(req.body)) {
		res.status(HttpCode.BadRequest).end()
		return
	}

	const event = await selectEvent(req.params.id)
	const classes = `{${req.body.join(',')}}`
	await updateEvent(event.id, 'class', classes)
	res.end()
})

app.get('/events/:id', async (req, res) => {
	const event = await selectEvent(req.params.id)
	if (event == null) {
		res.status(HttpCode.NotFound).end()
		return
	}
	const children = await selectChildren(req.params.id)

	res.json({
		event,
		children
	})
})

app.get('/events/by-wikidata-id/:wikidataID/image', async (req, res) => {
	const code = await fetchImage({ id: req.params.wikidataID })
	res.status(code).end()
})

app.delete('/events/by-wikidata-id/:wikidataID', async (req, res) => {
	const code = await deleteEvent(req.params.wikidataID)
	res.status(code).end()
})

app.get('/classes', async (req, res) => {
	const result = await execSql('SELECT enum_range(NULL::classtype)')
	if (result == null || !result.hasOwnProperty('rows') || !result.rows.length) {
		res.status(HttpCode.InternalServerError).end()
		return
	}

	const classes = result.rows[0]['enum_range']
		.slice(1, -1)
		.split(',')
		.map(t => {
			if (t.charAt(0) === '"') t = t.slice(1)
			if (t.charAt(t.length - 1) === '"') t = t.slice(0, -1)
			return t
		})

	res.json(classes)
})

const missingImageWhere = "event.img IS NULL"
app.get('/events/by-missing/image', byMissing(missingImageWhere))

const missingLabelWhere = 'event.lbl IS NULL'
app.get('/events/by-missing/label', byMissing(missingLabelWhere))

const missingDateWhere = `event.lbl IS NOT NULL 
				AND event.dmin IS NULL
				AND event.d IS NULL
				AND event.ed IS NULL
				AND event.dmax IS NULL`
app.get('/events/by-missing/date', byMissing(missingDateWhere))

const missingLocationWhere = `NOT EXISTS (SELECT * FROM event__location WHERE event__location.event_id = event.id)`
app.get('/events/by-missing/location', byMissing(missingLocationWhere))

const missingEverythingWhere = `${missingLocationWhere} AND ${missingImageWhere} ${missingDateWhere.slice("event.lbl IS NOT NULL".length)}`
app.get('/events/by-missing/everything', byMissing(missingEverythingWhere))
app.delete('/events/by-missing/everything', async (req, res) => {
	const config = { where: missingEverythingWhere }
	let result = await execSql(selectEventsSql(config))
	for (const event of result.rows) {
		await deleteEvent(event)
	}
	res.end()	
})

app.get('/events/by-class/:class', async (req, res) => {
	let [events, code] = await selectByClass(req.params.class)
	if (code != HttpCode.OK) {
		res.status(code).end()
		return
	}

	// const from = events[0].dmin || events[0].d
	// const to = events.reduce((prev, curr) => {
	// 	return Math.max(prev, curr.ed || -Infinity, curr.dmax || -Infinity)
	// }, -Infinity)

	// const { viewportWidth, zoomLevel } = req.query
	// const pixelsPerMillisecond = calcPixelsPerMillisecond(viewportWidth, zoomLevel, to - from)

	// const t0 = performance.now()
	// const json = orderEvents({
	// 	children: events,
	// 	viewportWidth: req.query.viewportWidth,
	// 	zoomLevel: req.query.zoomLevel
	// })
	// const t1 = performance.now(); console.log('Performance order events: ', `${t1 - t0}ms`)
	res.json(events)
})

app.get('/ordered-event/:id', async (req, res) => {
	const parent: RawEv3nt = await selectEvent(req.params.id)
	if (parent == null) {
		res.status(HttpCode.NotFound).end()
		return
	}

	const children = await selectChildren(req.params.id)
	if (!children.length) {
		res.json({ parent, children: new OrderedTimeline() })
		return
	}

	// const t0 = performance.now()
	// // const orderedEvents = orderEvents(events, pixelsPerMillisecond)
	// const options = {
	// 	parent,
	// 	children,
	// 	viewportWidth: req.query.viewportWidth,
	// 	zoomLevel: req.query.zoomLevel
	// }
	// const orderedEvents = orderEvents(options)
	// const t1 = performance.now(); console.log('Performance order events: ', `${t1 - t0}ms`)

	// res.json(orderedEvents)
	res.json({
		parent,
		children,
	})
})

const PORT = 3377
app.listen(PORT)
console.log(`Civ's Log server on port ${PORT}`)
