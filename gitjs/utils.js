'use strict';

import { promisify } from 'util';
import { exec } from 'child_process';

const run = promisify(exec);

const insert = (str, index, value) => str.substr(0, index) + value + str.substr(index);

const inject = (str, obj) => str.replace(/\${(.*?)}/g, (x, g) => obj[g]);

const silent = (options) => Object.assign({}, options, { verbose: false });

const log = (message, verbose = true) => {
    if (verbose && log.enabled)
        console.log(message);
};

log.enabled = true;
log.enable = function () { log.enabled = true };
log.disable = function () { log.enabled = false };

const olderror = console.error;
console.error = (message) => olderror(message.red);

export {
    run,
    insert,
    inject,
    silent,
    log
};

// ____end of file____
