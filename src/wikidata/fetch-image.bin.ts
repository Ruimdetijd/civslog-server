import * as path from 'path'
import fetchImage from './fetch-image'
import { logError } from '../utils';

let id
if (process.argv[2] != null) id = process.argv[2]

let outputPath
if (process.argv[3] != null) outputPath = path.resolve(process.cwd(), process.argv[3])

if (id != null && outputPath != null) {
	fetchImage({
		id,
		outputPath,
		updateEvent: false,
	})
} else {
	logError('fetchImage', ['No wikidata ID or outputPath given', 'Usage: `node fetch-image.bin.js Q123456 ./images`'])
}
