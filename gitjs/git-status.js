'use strict';

import chalk from 'chalk';
import { gitCurrentBranch, localBranch } from './git-branch.js';
import git from './git-commands.js';
import { insert, log, silent } from './utils.js';

var localStatus = {};

/**
 * gitStatusShort
 * git status short
 */
async function gitStatusShort(options) {
    let items = [];

    const { data } = await git.status();

    localStatus.staged = 0;
    localStatus.modified = 0;
    localStatus.untracked = 0;

    items = data
        .split('\n')
        .filter(line => !!line.trim())
        .map(line => insert(line, 1, ' '))
        .map(line => {
            const wd = line.charAt(2);
            if (wd === ' ') {
                localStatus.staged++;
                return chalk.green(line);
            } else if (wd === '?') {
                localStatus.untracked++;
                return chalk.yellow(line);
            } else {
                localStatus.modified++;
                return chalk.red(line);
            }
        });

    if (items.length === 0)
        items = [chalk.green('nothing to commit')];

    log.info('git repo status :', options.verbose);
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
    const { data } = await git.log();

    items = data
        .split('\n')
        .filter(line => !!line.trim());

    log.info('git repo log formated :', options.verbose);
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
    const { data } = await git.graph();

    commits = data
        .split('\n')
        .filter(line => !!line.trim());

    log.info('git repo graph formated :', options.verbose);
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
    const { data } = await git.advance(branch);

    counts = data
        .split('\t')
        .map(count => parseInt(count));
    if (counts.length !== 2)
        throw new Error('invalid result');

    log.info('Commits behind - ahead / upstream :', options.verbose);
    if (counts.length === 2)
        if (counts[0] === 0 && counts[1] === 0)
            log(chalk`{green    equal      ${counts[0]} - ${counts[1]}}`, options.verbose);
        else if (counts[0] > 0 && counts[1] > 0)
            log(chalk`{red    diverged   ${counts[0]} - ${counts[1]}}`, options.verbose);
        else if (counts[0] > 0)
            log(chalk`{red    behind     ${counts[0]} - ${counts[1]}}`, options.verbose);
        else
            log(chalk`{yellow    ahead      ${counts[0]} - ${counts[1]}}`, options.verbose);
    else
        log.error('    no upstream', options.verbose);

    localStatus.behind = counts[0];
    localStatus.ahead = counts[1];

    return counts;
}

/**
 * gitFullStatus
 * outputs full of current branch
 */
async function gitFullStatus(options) {
    if (!localBranch)
        await gitCurrentBranch(silent());
    if (!localBranch) {
        log.error('Current dir is not a git repo.');
        return '';
    }

    const paths = await gitStatusShort(silent());
    const commits = await gitGraphShort(silent()); // gitLogShort();
    const advance = await gitOriginAdvance(localBranch, silent());

    log('--------------------------------------------------------------------');
    log.info(chalk`Current branch is {green ${localBranch}}`);
    log(chalk.blue('  Commits log of the branch :'));
    commits.forEach(commit => log(`  ${commit}`));
    log(chalk.blue('  Differences between HEAD, index and working tree :'));
    paths.forEach(path => log(`    ${path}`));
    log(chalk.blue('  Commits behind - ahead / upstream :'));
    if (advance.length === 2)
        if (advance[0] === 0 && advance[1] === 0)
            log(chalk`{green    equal      ${advance[0]} - ${advance[1]}}`, options.verbose);
        else if (advance[0] > 0 && advance[1] > 0)
            log(chalk`{red    diverged   ${advance[0]} - ${advance[1]}}`, options.verbose);
        else if (advance[0] > 0)
            log(chalk`{red    behind     ${advance[0]} - ${advance[1]}}`, options.verbose);
        else
            log(chalk`{yellow    ahead      ${advance[0]} - ${advance[1]}}`, options.verbose);
    else
        log.error('    no upstream');
    log('--------------------------------------------------------------------');

    return localBranch;
}

/**
 * register
 * create program subcommands
 */
function register(program) {
    program
        .command('status')
        .alias('ss')
        .description('Short status of local branch')
        .action(gitStatusShort)
        .category('Status');

    program
        .command('log')
        .alias('lo')
        .description('Short log of local branch')
        .action(gitLogShort)
        .category('Log');

    program
        .command('graph')
        .alias('lg')
        .description('Graph of the local branch')
        .action(gitGraphShort)
        .category('Log');

    program
        .command('advance <branch>')
        .alias('ad')
        .description('Behind-ahead remote/<branch>')
        .action(gitOriginAdvance)
        .category('Status');

    program
        .command('status-full')
        .alias('sf')
        .description('Full status of local branch')
        .action(gitFullStatus)
        .category('Status');
}

export { gitStatusShort, gitLogShort, gitGraphShort, gitOriginAdvance, gitFullStatus, localStatus, register };

// ____end of file____
