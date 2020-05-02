#!/usr/bin/env node

'use strict';

import { run, insert, inject } from './utils.js';
import {
    gitStatusShort,
    gitCurrentBranch,
    gitLogShort,
    gitOriginAdvance,
    gitFullStatus
} from './git-status.js';

//const gitBranches = runner("git branch -a --format='%(refname:short)'");


gitFullStatus().catch(error => {
    console.log(error);
});



//____end of file____
