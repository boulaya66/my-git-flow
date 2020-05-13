'use strict';

import git from './git-commands.js';
import { log, silent, colors } from './utils.js';
import inquirer from 'inquirer';
import { localBranch, gitBranches } from './git-branch.js';
import { gitStatusShort, gitFullStatus, gitOriginAdvance } from './git-status.js';

/**
 * gitAdd
 * git add -v .
 */
async function gitAdd(options) {
    log.info('git add -v . :', options.verbose);
    try {
        const data = await git.add.unsafe();
        log(data, options.verbose);
        await gitStatusShort(options);
    } catch (error) {
        log.error(error.message);
    }
}

/**
 *
 * commit -am "msg"
 */
async function gitCommit(msg, options) {
    if (!msg) {
        log.enable();
        const answers = await inquirer.prompt({
            type: 'input',
            name: 'msg',
            message: colors.prompt('What\'s the commit message')
        });
        if (!answers.msg) {
            log.error('Abort => do not commit.');
            return;
        }
        msg = answers.msg;
    }

    log.info(`Commit staged changes with msg "${colors.data(msg)}"`, options.verbose);
    try {
        const data = await git.commit.unsafe(msg);
        log(data, options.verbose);
        await gitFullStatus(options);
    } catch (error) {
        log.error(error.message);
    }
}

/**
 * gitPush
 * push (-u origin)
 */
async function gitPush(options) {
    log.info(`git push ${options.origin ? '-u origin' : ''}`, options.verbose);
    try {
        const data = await git.push.unsafe(options.origin ? '-u origin' : '');
        log(data, options.verbose);
        await gitOriginAdvance(localBranch, options);
    } catch (error) {
        log.error(error.message);
    }
}

/**
 * gitFetch
 * fetch (--all)
 */
async function gitFetch(options) {
    log.info(`git fetch ${options.all ? '--all' : ''}`, options.verbose);
    try {
        const data = await git.fetch.unsafe(options.all ? '--all' : '');
        log(data, options.verbose);
        await gitFullStatus(options);
    } catch (error) {
        log.error(error.message);
    }
}

/**
 * gitPull
 * pull
 */
async function gitPull(options) {
    log.info('git pull :', options.verbose);
    try {
        const data = await git.pull.unsafe();
        log(data, options.verbose);
        await gitFullStatus(options);
    } catch (error) {
        log.error(error.message);
    }
}

/**
 * gitRebaseLocal
 * git rebase -i $(git merge-base $branch master)
 */
async function gitRebaseLocal(branch, options) {
    if (!branch) {
        log.enable();
        const branches = (await gitBranches(silent())).filter(b => b !== localBranch);
        const choices = [];
        branches.forEach(item => {
            choices.push({
                name: item.match(/^origin/) ? colors.error(item) : colors.info(item),
                value: item
            });
        });
        choices.push(new inquirer.Separator());
        choices.push({ name: colors.debug('Abort'), short: ' ', value: '' });

        const answers = await inquirer.prompt({
            type: 'list',
            name: 'branch',
            message: colors.prompt('Select branch'),
            choices: choices,
            default: 'origin/master',
            pageSize: 20
        });
        branch = answers.branch;
    }
    if (!branch) {
        log.error('Abort => do not rebase.');
        return;
    }
    log.info(`Rebase local from the point at which ${localBranch} forked "${branch}"`, options.verbose);
    try {
        log(`git merge-base ${localBranch} ${branch}`, options.verbose);
        const lines1 = await git.forkPoint.unsafe(localBranch, branch);
        const fork = lines1.split('\n').filter(line => !!line.trim())[0];

        log(`git rebase -i ${fork}`, options.verbose);
        const lines2 = await git.rebase.unsafe(fork);
        log(lines2, options.verbose);
        await gitFullStatus(options);
    } catch (error) {
        log.error(error.message);
    }
}

/**
 * gitRebase
 * git rebase -i $branch
 */
async function gitRebase(branch, options) {
    if (!branch) {
        log.enable();
        const branches = (await gitBranches(silent())).filter(b => b !== localBranch);
        const choices = [];
        branches.forEach(item => {
            choices.push({
                name: item.match(/^origin/) ? colors.error(item) : colors.info(item),
                value: item
            });
        });
        choices.push(new inquirer.Separator());
        choices.push({ name: colors.debug('Abort'), short: ' ', value: '' });

        const answers = await inquirer.prompt({
            type: 'list',
            name: 'branch',
            message: colors.prompt('Select branch'),
            choices: choices,
            default: 'origin/master',
            pageSize: 20
        });
        branch = answers.branch;
    }
    if (!branch) {
        log.error('Abort => do not rebase.');
        return;
    }
    log.info(`Rebase local from "${branch}"`, options.verbose);
    try {
        log(`git rebase -i ${branch}`, options.verbose);
        const lines = await git.rebase.unsafe(branch);
        log(lines, options.verbose);
        await gitFullStatus(options);
    } catch (error) {
        log.error(error.message);
    }
}

// TODO: git merge $branch
/**
 * gitMerge
 * git merge <branch>
 */
async function gitMerge(branch, options) {
    if (!branch) {
        log.enable();
        /* TODO: filter branch to merge
        const branches = (await gitBranches(silent())).filter(b => b !== localBranch);
        const choices = [];
        branches.forEach(item => {
            choices.push({
                name: item.match(/^origin/) ? colors.error(item) : colors.info(item),
                value: item
            });
        });
        choices.push(new inquirer.Separator());
        choices.push({ name: colors.debug('Abort'), short: ' ', value: '' });
        */

        const answers = await inquirer.prompt({
            type: 'list',
            name: 'branch',
            message: colors.prompt('Select branch'),
            // choices: choices,
            default: 'Abort',
            pageSize: 20
        });
        branch = answers.branch;
    }
    if (!branch) {
        log.error('Abort => do not merge.');
        return;
    }
    log.info(`Merge local from "${branch}"`, options.verbose);
    try {
        log(`git merge ${branch}`, options.verbose);
        const lines = await git.merge.unsafe(branch);
        log(lines, options.verbose);
        await gitFullStatus(options);
    } catch (error) {
        log.error(error.message);
    }
}

// TODO: git reset --soft HEAD~1
// const data = await git.reset.unsafe(nb)
async function gitResetSoft(nb, options) {
    if (!nb) {
        // to implement
    }
    if (!nb) {
        log.error('Abort => do not reset.');
        return;
    }
    log.info(`Reset "${nb}" commits back from HEAD`, options.verbose);
    try {
        log(`git reset --soft HEAD~${nb}`, options.verbose);
        const lines = await git.reset.unsafe(nb);
        log(lines, options.verbose);
        await gitFullStatus(options);
    } catch (error) {
        log.error(error.message);
    }
}

/**
 * gitCommitAmend
 * amend last commit
 */
async function gitCommitAmend(options) {
    log.info('amend last commit :', options.verbose);
    try {
        const data = await git.amend.unsafe();
        log(data, options.verbose);
        await gitFullStatus(options);
    } catch (error) {
        log.error(error.message);
    }
}

/**
 * register
 * create program subcommands
 */
function register(program) {
    program
        .command('add')
        .alias('a')
        .description('Add all files to index')
        .action(gitAdd)
        .category('Commit');

    program
        .command('commit [msg]')
        .alias('cm')
        .description('Commit changes in local branch')
        .action(gitCommit)
        .category('Commit');

    program
        .command('push')
        .alias('ph')
        .option('-u, --origin', 'specify remote')
        .description('Push commits to remote')
        .action(gitPush)
        .category('Commit');

    program
        .command('fetch')
        .alias('f')
        .option('-a, --all', 'to fetch all barnches')
        .description('Fetch remote objects and refs')
        .action(gitFetch)
        .category('Commit');

    program
        .command('pull')
        .alias('pl')
        .description('Pull commits from remote')
        .action(gitPull)
        .category('Commit');

    program
        .command('amend')
        .alias('am')
        .description('Amend last commit (keep msg)')
        .action(gitCommitAmend)
        .category('Commit');

    program
        .command('rebaseLocal [branch]')
        .alias('rl')
        .description('Rebase local branch')
        .action(gitRebaseLocal)
        .category('Commit');

    program
        .command('rebase [branch]')
        .alias('r')
        .description('Rebase local branch from other')
        .action(gitRebase)
        .category('Commit');

    program
        .command('merge [branch]')
        .alias('m')
        .description('Merge local branch from other')
        .action(gitMerge)
        .category('Commit');

    program
        .command('reset [nb]')
        .alias('rs')
        .description('Reset soft n steps from HEAD')
        .action(gitResetSoft)
        .category('Commit');
}

export {
    register
};

// ____end of file____
