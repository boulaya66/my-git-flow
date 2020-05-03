#!/usr/bin/env node

'use strict';

import {
    run,
    insert,
    inject
} from './utils.js';
import 'colors';

async function gitBranches() {
    const { stdout } = await run("git branch -a --format='%(refname:short)'");

    let items = stdout
        .split('\n')
        .filter(line => !!line.trim());

        console.log(items)

    return items;
}

export {
    gitBranches
}

//____end of file____
