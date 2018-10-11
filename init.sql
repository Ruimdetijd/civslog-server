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
	wid TEXT UNIQUE, -- wikidata ID
	lbl TEXT, -- label
	dsc TEXT, -- description
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

CREATE INDEX battle_event_index ON event(class) WHERE class @> '{battle}';
CREATE INDEX war_event_index ON event(class) WHERE class @> '{war}';
CREATE INDEX human_event_index ON event(class) WHERE class @> '{human}';
CREATE INDEX male_event_index ON event(class) WHERE class @> '{male}';
CREATE INDEX female_event_index ON event(class) WHERE class @> '{female}';
CREATE INDEX explorer_event_index ON event(class) WHERE class @> '{explorer}';
CREATE INDEX naval_battle_event_index ON event(class) WHERE class @> '{naval battle}';
CREATE INDEX aerial_battle_event_index ON event(class) WHERE class @> '{aerial battle}';
CREATE INDEX military_campaign_event_index ON event(class) WHERE class @> '{military campaign}';
CREATE INDEX military_operation_event_index ON event(class) WHERE class @> '{military operation}';

CREATE TABLE location (
	id SERIAL PRIMARY KEY,
	wid TEXT UNIQUE, -- wikidate ID
	lbl TEXT, -- label
	dsc TEXT, -- description
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