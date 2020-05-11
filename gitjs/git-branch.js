'use strict';

import inquirer from 'inquirer';
import git from './git-commands.js';
import { silent, log, colors } from './utils.js';
import { gitFullStatus } from './git-status.js';

var localBranch = '';

/**
 * gitCreateBranch
 */
async function gitCreateBranch(branch, options) {
    log.enable();
    if (!localBranch)
        await gitCurrentBranch(silent());
    log.info(`Current branch is {green ${localBranch}}`);

    if (!branch) {
        const questions = {
            type: 'input',
            name: 'branch',
            message: colors.prompt('What\'s the name of the branch to create')
        };
        const answers = await inquirer.prompt(questions);
        if (!answers.branch) {
            log.error('Abort => do not create new branch.');
            return;
        }
        branch = answers.branch;
    }

    log.info(`Switch to branch ${colors.data(branch)}`);
    try {
        const data1 = await git.createBranch.unsafe(branch);
        log(data1);
        // TODO: supprimer le push origin
        const data2 = await git.pushBranch.unsafe(branch);
        log(data2);
        await gitCurrentBranch(silent());
        await gitFullStatus(options);
    } catch (error) {
        log.error(error.message);
    }
}

/**
 * gitDeleteBranch
 * delete branche locally and remotely
 */
async function gitDeleteBranch(branch, options) {
    log.enable();
    if (!localBranch)
        await gitCurrentBranch(silent());
    log.info(`Current branch is ${colors.data(localBranch)}`);

    if (!branch) {
        const answers = await selectBranch(false, false);
        branch = answers.branch;
    }

    if (!branch) {
        log.error('Abort => do not delete branch.');
        return;
    }

    log.info(`Delete branch ${colors.data(branch)}`);
    try {
        const stdout1 = await git.deleteLocalBranch.unsafe(branch);
        log(stdout1);
        const stdout2 = await git.deleteRemoteBranch.unsafe(branch);
        log(stdout2);
        await gitCurrentBranch(silent());
        await gitFullStatus(options);
    } catch (error) {
        log.error(error.message);
    }
}

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
            formated = colors.data(formated);
        else if (item.match(/^origin/))
            formated = colors.error(formated);
        return formated;
    }

    let items = [];
    if (!localBranch)
        await gitCurrentBranch(silent());
    const { data } = await git.branches();
    items = data
        .split('\n')
        .filter(line => !!line.trim());

    log.info('Available branches :', options.verbose);
    items.forEach(item => {
        log(formatItem(item, localBranch), options.verbose);
    });

    return items;
}

/**
 * gitCurrentBranch
 * get current branch
 */
async function gitCurrentBranch(options) {
    let branch = '';
    const { data } = await git.getBranch();
    branch = data.split('\n')[0];
    if (branch)
        log.info(`Current branch is ${colors.data(branch)}`, options.verbose);
    else
        log.error('Current dir is not a git repo.', options.verbose);

    localBranch = branch;

    return branch;
}

/**
 * gitCheckout
 * switch to branch
 */
async function gitCheckout(branch, options) {
    log.enable();
    if (!localBranch)
        await gitCurrentBranch(silent());
    log.info(`Current branch is ${colors.data(localBranch)}`);

    if (!branch) {
        log('git fetch --all ........');
        await git.fetch('--all');
        const branches = await gitBranches(silent());
        process.stdout.write('\u001b[1A');

        const choices = [];
        branches.forEach(item => {
            choices.push({
                name: item,
                pattern: item.match(/^((origin)\/)?((.{3})#(\d{3})-)?(.+)/)
            });
        });
        choices.forEach(choice => {
            if (choice.name === localBranch) {
                choice.disabled = colors.silly('This is the current branch.');
                choice.value = choice.name;
                choice.name = colors.silly(choice.name);
            } else if (choice.pattern[1]) {
                if (choice.name === 'origin/HEAD') {
                    choice.disabled = colors.silly('Not allowed for integrity reason.');
                    choice.value = choice.name;
                    choice.name = colors.silly(choice.name);
                } else if (choices.find(item => {
                    return (!item.pattern[1] && item.pattern[0] === (choice.pattern[3] || '') + choice.pattern[6]);
                })) {
                    choice.disabled = colors.silly('Already in local repo.');
                    choice.value = choice.name;
                    choice.name = colors.silly(choice.name);
                } else {
                    choice.value = (choice.pattern[3] || '') + choice.pattern[6];
                    choice.name = colors.error(choice.value);
                }
            } else {
                choice.value = choice.name;
                choice.name = colors.data(choice.name);
            }
        });
        choices.push(new inquirer.Separator());
        choices.push({ name: colors.debug('Abort'), short: ' ', value: '' });

        const answers = await inquirer.prompt({
            type: 'list',
            name: 'branch',
            message: colors.prompt('Switch to branch'),
            choices: choices,
            default: 'master',
            pageSize: 20
        });
        if (!answers.branch) {
            log.error('Abort => do not change current branch.');
            return;
        }
        branch = answers.branch;
    }

    log.info(`Switch to branch ${colors.data(branch)}`);
    try {
        const data = await git.checkout.unsafe(branch);
        log(data);
        await gitCurrentBranch(silent());
        await gitFullStatus(options);
    } catch (error) {
        log.error(error.message);
    }
}

/**
 * selectBranch
 */
async function selectBranch(allowMaster = true, allowLocal = true, allowAbort = true) {
    const branches = await gitBranches(silent());

    let choices = [];
    branches.forEach(item => {
        if (!item.match(/^origin/))
            choices.push({
                name: colors.info(item),
                value: item
            });
    });
    console.log(`allowMaster:${allowMaster} allowLocal:${allowLocal}`);
    choices = choices.filter(choice => (choice.value !== 'master' || allowMaster) && (choice.value !== localBranch || allowLocal));
    if (allowAbort) {
        choices.push(new inquirer.Separator());
        choices.push({ name: colors.debug('Abort'), short: ' ', value: '' });
    }

    const answers = await inquirer.prompt({
        type: 'list',
        name: 'branch',
        message: colors.prompt('Select branch'),
        choices: choices,
        default: allowMaster ? 'master' : '',
        pageSize: 20
    });

    return answers.branch;
}

/**
 * register
 * create program subcommands
 */
function register(program) {
    program
        .command('branch')
        .alias('lb')
        .option('-e, --extra', 'extract branch pattern naming')
        .description('List all available branches')
        .action(gitBranches)
        .category('Branch');

    program
        .command('current')
        .alias('b')
        .description('Show current branch')
        .action(gitCurrentBranch)
        .category('Branch');

    program
        .command('checkout [branch]')
        .alias('ck')
        .description('Checkout <branch>')
        .action(gitCheckout)
        .category('Branch')
        .category('Branch');

    program
        .command('createbranch [branch]')
        .alias('cb')
        .description('Create branch <branch>')
        .action(gitCreateBranch)
        .category('Branch');

    program
        .command('deletebranch [branch]')
        .alias('d')
        .description('Delete branch <branch>')
        .action(gitDeleteBranch)
        .category('Branch');
}

export {
    localBranch,
    gitBranches,
    gitCurrentBranch,
    gitCheckout,
    selectBranch,
    register
};

// ____end of file____
