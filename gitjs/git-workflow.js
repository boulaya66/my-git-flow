'use strict';

// import 'colors';
// import { run, silent, log } from './utils.js';
// import { gitCurrentBranch } from './git-branch.js';

// TODO: check message pattern

// TODO: check branch name pattern

// TODO: start session

// TODO: stash: commit temp

// TODO: stash: reset stash

// TODO: stash: refresh

/**
 *
 *
 */
async function fn(options) {

}

/**
 * register
 * create program subcommands
 */
function register(program) {
    program
        .command('stash')
        .alias('sh')
        .description('commit save unfinished work')
        .action(fn)
        .category('Stash');
}

export {
    register
};

// ____end of file____
