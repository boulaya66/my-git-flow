'use strict';

import { promisify } from 'util';
import { exec } from 'child_process';

const run = promisify(exec);

const insert = (str, index, value) => str.substr(0, index) + value + str.substr(index);

const inject = (str, obj) => str.replace(/\${(.*?)}/g, (x, g) => obj[g]);

export {
    run,
    insert,
    inject
}

//____end of file____
