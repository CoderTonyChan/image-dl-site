const fs = require('fs');
const path = require('path');
const request = require('request');
const mkdirp = require('mkdirp');
const cwd = process.cwd();

const { getMeizituList } = require('./routes/meizitu/util');
const { getHentaiDetail } = require('./routes/nhentai/util');

async function download (options, showLog, cb) {
    options = preprocessOptions(options, showLog);
    // 增加option
    if (options.meizitu) {
        options.urls = await getMeizituList(options.meizitu);
    } else if (options.nhentai) {
        const detail = await getHentaiDetail(options.nhentai);
        options.urls = detail.urls;
        console.log(detail);
    }

    if (options === null) return;

    let allDone = (function () {
        let count = options.urls.length;
        let callback = cb || function(){};
        return function () {
            showLog && console.log('Finished. ' + count + ' images are downloaded.');
            callback();
        }
    })();

    showLog && console.log('downloading...')
    let isSingle = options.urls.length === 1;
    let count = options.urls.length;
    options.urls.forEach(url => {
        let filepath;
        let filename = url.split('/').pop();
        if (isSingle && options.filename) {
            filename = options.filename;
        }
        filepath = path.resolve(options.output, filename);
        if (fs.existsSync(filepath)) {
            filename = filename.split('.');
            filename.splice(-1, 0, randomString());
            filename = filename.join('.');
            filepath = path.resolve(options.output, filename);
        }
        request(url)
            .pipe(fs.createWriteStream(filepath))
            .on('close', () => {
                showLog && console.log(url + ': downloaded')
                count--;
                count === 0 && allDone();
            });
    });
}

function preprocessOptions (options, showLog) {
    let opts = Object.assign({}, options);

    // if (!opts.urls || !opts.urls.length) return null;

    opts.output = path.resolve(cwd, opts.output);
    opts.filename = null;
    if (opts.urls.length === 1 && path.extname(opts.output) !== '') {
        opts.filename = path.basename(opts.output);
        opts.output = path.dirname(opts.output);
    }

    if (!fs.existsSync(opts.output)) {
        try {
            mkdirp(opts.output);
        } catch (err) {
            showLog && console.error(err);
            return null;
        }
    }
    return opts;
}

function randomString () {
    return Math.random().toString(36).slice(2, 8);
}

module.exports = download;
