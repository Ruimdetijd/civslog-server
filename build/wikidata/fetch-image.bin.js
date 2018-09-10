"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fetch_image_1 = require("./fetch-image");
const utils_1 = require("../utils");
let id;
if (process.argv[2] != null)
    id = process.argv[2];
let outputPath;
if (process.argv[3] != null)
    outputPath = path.resolve(process.cwd(), process.argv[3]);
if (id != null && outputPath != null) {
    fetch_image_1.default({
        id,
        outputPath,
        updateEvent: false,
    });
}
else {
    utils_1.logError('fetchImage', ['No wikidata ID or outputPath given', 'Usage: `node fetch-image.bin.js Q123456 ./images`']);
}
