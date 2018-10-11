export type EventType = 'human' | 'battle'

export class WdDate {
	dateString: string = null
	granularity: string = null
	timestamp: number = null
}

export class WdEntity {
	label: string
	description: string
	id: string

	constructor(entity) {
		this.id = entity.id	
		this.label = this.getProp(entity.labels)
		this.description = this.getProp(entity.descriptions)
	}

	private getProp(prop: any): string {
		if (prop == null) return

		function test(lang) {
			return prop.hasOwnProperty(lang) && prop[lang].hasOwnProperty('value')
		} 

		if (test('en')) return prop.en.value // English
		if (test('de')) return prop.de.value // German
		if (test('fr')) return prop.fr.value // French
		if (test('nl')) return prop.nl.value // Dutch
		if (test('ru')) return prop.ru.value // Russian
		if (test('es')) return prop.es.value // Spanish
		if (test('ca')) return prop.ca.value // Catalan
		if (test('it')) return prop.it.value // Italian
		if (test('pl')) return prop.pl.value // Polish
		if (test('pt')) return prop.pt.value // Portugese
		if (test('ceb')) return prop.ceb.value // Cebuano
		if (test('sv')) return prop.sv.value // Swedish
	}
}

export class WdLocation {
	coordinates: string
	date?: number
	description: string = null
	end_date?: number
	id?: string
	label: string = null
	wikidata_identifier: string = null
}

// export class Ev3nt {
// 	date: number
// 	date_min: number
// 	date_granulirity: string
// 	date_min_granularity: string
// 	description: string
// 	end_date: number
// 	end_date_max: number
// 	end_date_granularity: string
// 	end_date_max_granularity: string
// 	id: string
// 	label: string
// 	tags?: string[]
// 	wikidata_identifier: string
// }