'use strict';

import 'colors';
import { run, silent, log } from './utils.js';

/**
 * gitBranches
 * list all available branches
 */
async function gitBranches(options) {
    function formatItem(item, branch) {
        let formated = item;
        if (options.extra) {
            let match = item.match(/(^origin)\/(.{3})#(\d{3})-(.+)/);
            if (match)
                match = match.slice(2, 5).join(' | ');
            formated = `${(item === branch) ? '*' : ' '}${item.padEnd(40)}  ${match || '--- | --- | ---'}`;
        }
        if (item === branch)
            formated = formated.green;
        else if (item.match(/^origin/))
            formated = formated.red;
        return formated;
    }

    let branch;
    let items = [];
    try {
        branch = await gitCurrentBranch(silent());
        const { stdout } = await run("git branch -a --format='%(refname:short)'");
        items = stdout
            .split('\n')
            .filter(line => !!line.trim());
    } catch (error) {
    }

    log('Available branches :'.cyan);
    items.forEach(item => {
        log(formatItem(item, branch));
    });

    return items;
}

/**
 * gitCurrentBranch
 *
 */
async function gitCurrentBranch(options) {
    let branch = '';
    try {
        const { stdout } = await run('git symbolic-ref --short HEAD');
        branch = stdout.split('\n')[0];
    } catch (error) {
    }
    const msg = branch ? 'Current branch is '.cyan : 'Current dir is not a git repo.'.red;
    log(`${msg} ${branch.green}`, options.verbose);

    return branch;
}

/**
 * register
 * create program subcommands
 */
function register(program) {
    program
        .command('branch')
        .alias('b')
        .option('-e, --extra', 'extract branch pattern naming')
        .description('list all branches')
        .action(gitBranches);

    program
        .command('current')
        .alias('cur')
        .description('display current branch')
        .action(gitCurrentBranch);
}

export {
    gitBranches,
    gitCurrentBranch,
    register
};

// ____end of file____
