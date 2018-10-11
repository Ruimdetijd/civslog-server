export const WIKIDATA_URL = 'https://www.wikidata.org/w/api.php'
export const WIKIMEDIA_URL = 'https://commons.wikimedia.org/w/api.php'
export enum HttpCode {
	OK = 200,
	NoContent = 204,
	BadRequest = 400,
	NotFound = 404,
	InternalServerError = 500,
}