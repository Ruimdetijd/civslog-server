"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg = require("pg");
pg.types.setTypeParser(20, function (value) {
    return parseInt(value);
});
const fs_1 = require("fs");
function getSecret(name) {
    const path = `/run/secrets/${name}`;
    if (fs_1.existsSync(path)) {
        return fs_1.readFileSync(path, 'utf8').trim();
    }
}
exports.default = () => new pg.Pool({
    database: getSecret('civslog_db_name') || 'timeline',
    host: process.env.PGHOST,
    password: getSecret('civslog_db_password') || 'postgis',
    user: getSecret('civslog_db_user') || 'postgres'
});
