'use strict';

import fs from 'fs';

function getCurrentVersion() {
    const content = fs.readFileSync('package.json');
    return JSON.parse(content).version;
}

export {
    getCurrentVersion
};

// ____end of file____
