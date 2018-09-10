import fetchClaimValue from "./fetch-claim-value";
import { logError, fetchFromWikimedia, logMessage } from "../utils";
import { HttpCode } from "../constants";
import fetch from 'node-fetch'
import * as getFileType from 'file-type'
import { execSql } from '../db/utils'
import Jimp = require('jimp')
import chalk from 'chalk';

const IMAGE_HEIGHTS = [256, 128, 64, 32]
const IMAGE_FILE_TYPES = ['jpg', 'png', 'gif', 'svg']

interface Options {
	id: string
	outputPath?: string
	updateEvent?: boolean
}
const defaultOptions: Partial<Options> = {
	outputPath: '/app/images',
	updateEvent: true,
}
export default async function fetchImage(options: Options): Promise<HttpCode> {
	options = { ...defaultOptions, ...options }
	const images = await fetchClaimValue(options.id, 'image')
	const imageFileName = encodeURIComponent(images[0])
	const urlPath = `?action=query&titles=Image:${imageFileName}&prop=imageinfo&iiprop=url&iiurlheight=${IMAGE_HEIGHTS[0]}&format=json`
	const response = await fetchFromWikimedia(urlPath)

	if (response.hasOwnProperty('query') && response.query.hasOwnProperty('pages')) {
		const pagesIDs = Object.keys(response.query.pages)
		if (pagesIDs == null || !pagesIDs.length) return HttpCode.NotFound
		const page = response.query.pages[pagesIDs[0]]
		if (page.imageinfo == null || !page.imageinfo.length) return HttpCode.NotFound
		const url = page.imageinfo[0].thumburl

		let imgResponse
		try {
			imgResponse = await fetch(url)
		} catch (error) {
			logError('fetchImage', [error])
			return HttpCode.BadRequest	
		}

		let imgBuffer, img
		try {
			imgBuffer = await imgResponse.buffer()
			img = await Jimp.read(imgBuffer)
		} catch (err) {
			logError('fetchImage', [err])	
		}

		const fileType = getFileType(imgBuffer)
		if (fileType == null || IMAGE_FILE_TYPES.indexOf(fileType.ext) === -1) {
			logError('fetchImage', [`Unknown file type ${JSON.stringify(fileType)}`])
			return HttpCode.NotFound
		}
		const ext = fileType.ext === 'gif' ? 'jpg' : fileType.ext

		for (const height of IMAGE_HEIGHTS) {
			const path = `${options.outputPath}/${options.id}__${height}.${ext}`
			img
				.scaleToFit(height, height)
				.quality(75)
				.write(path)
		}

		if (options.updateEvent) {
			const sql = `UPDATE event
						SET has_image = $1
						WHERE wikidata_identifier = $2`
			await execSql(sql, [ext, options.id])
		}

		logMessage(`Fetched image for ${chalk.magenta(options.id)} to ${chalk.magenta(options.outputPath)}`)

		return HttpCode.NoContent
	}
}