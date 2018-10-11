"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fetch_claim_value_1 = require("./fetch-claim-value");
const utils_1 = require("../utils");
const constants_1 = require("../constants");
const node_fetch_1 = require("node-fetch");
const getFileType = require("file-type");
const utils_2 = require("../db/utils");
const Jimp = require("jimp");
const chalk_1 = require("chalk");
const IMAGE_HEIGHTS = [256, 128, 64, 32];
const IMAGE_FILE_TYPES = ['jpg', 'png', 'gif', 'svg'];
const defaultOptions = {
    outputPath: '/app/images',
    updateEvent: true,
};
function fetchImage(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        options = Object.assign({}, defaultOptions, options);
        const images = yield fetch_claim_value_1.default(options.id, 'image');
        const imageFileName = encodeURIComponent(images[0]);
        const urlPath = `?action=query&titles=Image:${imageFileName}&prop=imageinfo&iiprop=url&iiurlheight=${IMAGE_HEIGHTS[0]}&format=json`;
        const response = yield utils_1.fetchFromWikimedia(urlPath);
        if (response.hasOwnProperty('query') && response.query.hasOwnProperty('pages')) {
            const pagesIDs = Object.keys(response.query.pages);
            if (pagesIDs == null || !pagesIDs.length)
                return constants_1.HttpCode.NotFound;
            const page = response.query.pages[pagesIDs[0]];
            if (page.imageinfo == null || !page.imageinfo.length)
                return constants_1.HttpCode.NotFound;
            const url = page.imageinfo[0].thumburl;
            let imgResponse;
            try {
                imgResponse = yield node_fetch_1.default(url);
            }
            catch (error) {
                utils_1.logError('fetchImage', [error]);
                return constants_1.HttpCode.BadRequest;
            }
            let imgBuffer, img;
            try {
                imgBuffer = yield imgResponse.buffer();
                img = yield Jimp.read(imgBuffer);
            }
            catch (err) {
                utils_1.logError('fetchImage', [err]);
            }
            const fileType = getFileType(imgBuffer);
            if (fileType == null || IMAGE_FILE_TYPES.indexOf(fileType.ext) === -1) {
                utils_1.logError('fetchImage', [`Unknown file type ${JSON.stringify(fileType)}`]);
                return constants_1.HttpCode.NotFound;
            }
            const ext = fileType.ext === 'gif' ? 'jpg' : fileType.ext;
            for (const height of IMAGE_HEIGHTS) {
                const path = `${options.outputPath}/${options.id}__${height}.${ext}`;
                img
                    .scaleToFit(height, height)
                    .quality(75)
                    .write(path);
            }
            if (options.updateEvent) {
                const sql = `UPDATE event
						SET img = $1
						WHERE wid = $2`;
                yield utils_2.execSql(sql, [ext, options.id]);
            }
            utils_1.logMessage(`Fetched image for ${chalk_1.default.magenta(options.id)} to ${chalk_1.default.magenta(options.outputPath)}`);
            return constants_1.HttpCode.NoContent;
        }
    });
}
exports.default = fetchImage;
