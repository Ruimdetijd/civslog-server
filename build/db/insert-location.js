"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const utils_1 = require("./utils");
exports.default = (event, location) => __awaiter(this, void 0, void 0, function* () {
    if (location.coordinates == null)
        return;
    const sql = `INSERT INTO location
					(label, description, coordinates, wikidata_identifier)
				VALUES
					($1, $2, ST_GeogFromText('SRID=4326;POINT(${location.coordinates.split(' ').reverse().join(' ')})'), $3)
				ON CONFLICT (coordinates)
				DO UPDATE SET
					label = $1,
					description = $2,
					wikidata_identifier = $3
				RETURNING *`;
    const result = yield utils_1.execSql(sql, [location.label, location.description, location.wikidata_identifier]);
    if (result.rows.length) {
        console.log(chalk_1.default `\n{green [DB] Inserted location:}
{gray label}\t\t\t${location.label}
{gray description}\t\t${location.description}
{gray coordinates}\t\t${location.coordinates}
{gray wikidata entity ID}\t${location.wikidata_identifier}\n\n`);
        location = result.rows[0];
    }
    return location;
});
