'use strict';

import fs from 'fs';

// TODO: git tag -a $version -m $version-extended
// TODO: git push --tags

function getCurrentVersion() {
    const content = fs.readFileSync('package.json');
    return JSON.parse(content).version;
}

export {
    getCurrentVersion
};

// ____end of file____
