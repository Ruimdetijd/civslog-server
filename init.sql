DROP DATABASE IF EXISTS timeline_new;

CREATE DATABASE timeline_new;

\c timeline_new

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE granularity AS ENUM (
	'MILLISECOND',
	'MILLISECOND_10',
	'MILLISECOND_50',
	'MILLISECOND_100',
	'MILLISECOND_500',
	'SECOND',
	'MINUTE',
	'HOUR',
	'DAY',
	'WEEK',
	'MONTH',
	'YEAR',
	'YEAR_5',
	'DECADE',
	'DECADE_5',
	'CENTURY',
	'CENTURY_5',
	'MILLENIUM'
);

CREATE TYPE imagefiletype AS ENUM (
	'jpg',
	'png',
	'svg'
);

CREATE TYPE classtype AS ENUM (
	'battle',
	'war',
	'human',
	'male',
	'female',
	'explorer',
	'naval battle',
	'aerial battle',
	'military campaign',
	'military operation'
);

CREATE TABLE event (
	id SERIAL PRIMARY KEY,
	old_id BIGINT,
	wid TEXT UNIQUE, -- wikidata ID
	lbl TEXT, -- label
	descr TEXT, -- description
	class classtype [],
	dmin TIMESTAMP WITH TIME ZONE, -- date min
	dmin_g granularity,
	d TIMESTAMP WITH TIME ZONE, -- date
	d_g granularity,
	ed TIMESTAMP WITH TIME ZONE, -- end date
	ed_g granularity,
	dmax TIMESTAMP WITH TIME ZONE, -- date max
	dmax_g granularity,
	img imagefiletype, -- image
	upd TIMESTAMP WITH TIME ZONE -- updated
);

CREATE TABLE location (
	id SERIAL PRIMARY KEY,
	old_id BIGINT,
	wid TEXT UNIQUE, -- wikidate ID
	lbl TEXT, -- label
	descr TEXT, -- description
	coor geometry(Point,3857),
	coor4326 geography(Point,4326)
);

CREATE TABLE event__location (
	event_id SERIAL REFERENCES event,
	location_id SERIAL REFERENCES location,
	dmin TIMESTAMP WITH TIME ZONE, -- date min
	dmin_g granularity,
	d TIMESTAMP WITH TIME ZONE, -- date
	d_g granularity,
	ed TIMESTAMP WITH TIME ZONE, -- end date
	ed_g granularity,
	dmax TIMESTAMP WITH TIME ZONE, -- date max
	dmax_g granularity,
	upd TIMESTAMP WITH TIME ZONE -- updated
);

CREATE TABLE event__event (
	parent_event_id SERIAL REFERENCES event,
	child_event_id SERIAL REFERENCES event,
	PRIMARY KEY (parent_event_id, child_event_id)
);