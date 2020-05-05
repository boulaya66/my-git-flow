'use strict';

import 'colors';
import { run, insert, silent, log } from './utils.js';
import { gitCurrentBranch } from './git-branch.js';

/**
 * gitStatusShort
 * git status short
 */
async function gitStatusShort(options) {
    let items = [];

    try {
        const { stdout } = await run('git status -s');

        items = stdout
            .split('\n')
            .filter(line => !!line.trim())
            .map(line => insert(line, 1, ' '))
            .map(line => {
                const wd = line.charAt(2);
                if (wd === ' ')
                    return line.green;
                else if (wd === '?')
                    return line.yellow;
                else
                    return line.red;
            });
    } catch (error) {
    }

    if (items.length === 0)
        items = ['nothing to commit'.green];

    log('git repo status :'.cyan, options.verbose);
    items.forEach(item => {
        log(item, options.verbose);
    });

    return items;
};

/**
 * gitLogShort
 * git log short formated
 */
async function gitLogShort(options) {
    let items = [];
    try {
        const { stdout } = await run("git log --date=format:%x %X --full-history --decorate --all --pretty='format:%h %<|(40,trunc)%s %cd %cN'");

        items = stdout
            .split('\n')
            .filter(line => !!line.trim());
    } catch (error) {
    }

    log('git repo log formated :'.cyan, options.verbose);
    items.forEach(item => {
        log(item, options.verbose);
    });

    return items;
}

/**
 * gitGraphShort
 * git log graph formated
 */
async function gitGraphShort(options) {
    let commits = [];
    try {
        const { stdout } = await run("git log --date='format:%x %X' --full-history --decorate --all --pretty='format:%h %<|(40,trunc)%s %cd %cN' --graph ");

        commits = stdout
            .split('\n')
            .filter(line => !!line.trim());
    } catch (error) {
    }

    log('git repo graph formated :'.cyan, options.verbose);
    commits.forEach(item => {
        log(item, options.verbose);
    });

    return commits;
}

/**
 * gitOriginAdvance
 * outputs commits behind - ahead / upstream
 */
async function gitOriginAdvance(branch, options) {
    let counts = [];
    try {
        const { stdout } = await run(`git rev-list --count --left-right origin/${branch}...HEAD`);

        counts = stdout
            .split('\t')
            .map(count => parseInt(count));
        if (counts.length !== 2)
            throw new Error('invalid result');
    } catch (error) {

    }

    log('Commits behind - ahead / upstream :'.cyan, options.verbose);
    if (counts.length === 2)
        if (counts[0] === 0 && counts[1] === 0)
            log(`    equal      ${counts[0]} - ${counts[1]}`.green, options.verbose);
        else if (counts[0] > 0 && counts[1] > 0)
            log(`    diverged   ${counts[0]} - ${counts[1]}`.red, options.verbose);
        else if (counts[0] > 0)
            log(`    behind     ${counts[0]} - ${counts[1]}`.red, options.verbose);
        else
            log(`    ahead      ${counts[0]} - ${counts[1]}`.yellow, options.verbose);
    else
        log('    no upstream'.red, options.verbose);

    return counts;
}

/**
 * gitFullStatus
 * outputs full of current branch
 */
async function gitFullStatus(options) {
    const branch = await gitCurrentBranch(silent());
    if (!branch) {
        log('Current dir is not a git repo.'.red);
        return '';
    }

    const paths = await gitStatusShort(silent());
    const commits = await gitGraphShort(silent()); // gitLogShort();
    const advance = await gitOriginAdvance(branch, silent());

    log('--------------------------------------------------------------------');
    log(`Current branch is ${branch.green}`.cyan.bold);
    log('  Commits log of the branch :'.blue);
    commits.forEach(commit => log(`  ${commit}`));
    log('  Differences between HEAD, index and working tree :'.blue);
    paths.forEach(path => log(`    ${path}`));
    log('  Commits behind - ahead / upstream :'.blue);
    if (advance.length === 2)
        if (advance[0] === 0 && advance[1] === 0)
            log(`    equal      ${advance[0]} - ${advance[1]}`.green);
        else if (advance[0] > 0 && advance[1] > 0)
            log(`    diverged   ${advance[0]} - ${advance[1]}`.red);
        else if (advance[0] > 0)
            log(`    behind     ${advance[0]} - ${advance[1]}`.red);
        else
            log(`    ahead      ${advance[0]} - ${advance[1]}`.yellow);
    else
        log('    no upstream'.red);
    log('--------------------------------------------------------------------');

    return branch;
}

/**
 * register
 * create program subcommands
 */
function register(program) {
    program
        .command('status')
        .alias('ss')
        .description('git status short')
        .action(gitStatusShort);

    program
        .command('log')
        .alias('lg')
        .description('git log short')
        .action(gitLogShort);

    program
        .command('graph')
        .alias('gr')
        .description('git log graph short')
        .action(gitGraphShort);

    program
        .command('advance <branch>')
        .alias('ad')
        .description('commits behind - ahead / upstream')
        .action(gitOriginAdvance);

    program
        .command('status-full')
        .alias('sf')
        .description('outputs full of current branch')
        .action(gitFullStatus);
}

export {
    gitStatusShort,
    gitLogShort,
    gitGraphShort,
    gitOriginAdvance,
    register
};

// ____end of file____
