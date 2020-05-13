'use strict';

// import 'colors';
import { runUnsafe } from './utils.js';
// import { gitCurrentBranch } from './git-branch.js';

// TODO: check message pattern

// TODO: check branch name pattern
async function lastBranchNumber() {
    let max = 0;

    const branches = await runUnsafe("git branch -a --format='%(refname:short)'");
    branches.split('\n').forEach(item => {
        if (!item)
            return;
        const match = item.match(/^((origin)\/)?((.{3})#(\d{3})-)?(.+)/);
        const idx = parseInt(match[5], 10);
        if (idx > max)
            max = idx;
    });

    const commits = await runUnsafe("git log master --pretty='format:%s'");
    commits.split('\n').forEach(item => {
        if (!item)
            return;
        const match = item.match(/.{3}#\d{3}/g);
        if (match && match.length > 0)
            match.forEach(found => {
                const idx = parseInt(found.substr(4, 3));
                if (idx > max)
                    max = idx;
            });
    });

    return max;
}

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
    register,
    lastBranchNumber
};

// ____end of file____
