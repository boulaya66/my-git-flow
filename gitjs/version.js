'use strict';

import fs from 'fs';

function getCurrentVersion(){
    let content= fs.readFileSync('package.json');
    return JSON.parse(content).version;
}

export {
    getCurrentVersion
}

//____end of file____
