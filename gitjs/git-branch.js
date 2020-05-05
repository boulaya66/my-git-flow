'use strict';

import 'colors';
import inquirer from 'inquirer';
import { run, silent, log } from './utils.js';
import { gitFullStatus } from './git-status.js';

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

    log('Available branches :'.cyan, options.verbose);
    items.forEach(item => {
        log(formatItem(item, branch), options.verbose);
    });

    return items;
}

/**
 * gitCurrentBranch
 * get current branch
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
 * gitCheckout
 * switch to branch
 */
async function gitCheckout(branch, options) {
    log.enable();
    const current = await gitCurrentBranch(silent());
    log(`Current branch is ${current.green}`.cyan.bold);

    if (!branch) {
        log('git fetch --all ........');
        await run('git fetch --all');
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
            if (choice.name === current) {
                choice.disabled = 'This is the current branch.'.grey;
                choice.value = choice.name;
                choice.name = choice.name.grey;
            } else if (choice.pattern[1]) {
                if (choice.name === 'origin/HEAD') {
                    choice.disabled = 'Not allowed for integrity reason.'.grey;
                    choice.value = choice.name;
                    choice.name = choice.name.grey;
                } else if (choices.find(item => {
                    return (!item.pattern[1] && item.pattern[0] === (choice.pattern[3] || '') + choice.pattern[6]);
                })) {
                    choice.disabled = 'Already in local repo.'.grey;
                    choice.value = choice.name;
                    choice.name = choice.name.grey;
                } else {
                    choice.value = (choice.pattern[3] || '') + choice.pattern[6];
                    choice.name = choice.value.red;
                }
            } else {
                choice.value = choice.name;
                choice.name = choice.name.green;
            }
        });

        const questions = {
            type: 'list',
            name: 'branch',
            message: 'Switch to branch'.cyan.bold,
            choices: choices,
            default: 'master',
            pageSize: 20
        };
        questions.choices.push(new inquirer.Separator());
        questions.choices.push({ name: 'Abort'.yellow.bold, short: ' ', value: '' });

        const answers = await inquirer.prompt(questions);
        if (!answers.branch) {
            log('Abort => do not change current branch.'.red);
            return;
        }
        branch = answers.branch;
    }

    log(`Switch to branch ${branch.green}`.cyan);
    try {
        const { stdout } = await run(`git checkout ${branch}`);
        log(stdout);
        await gitFullStatus(options);
    } catch (error) {
        log(error.message.red);
    }
}

/**
 * selectBranch
 */
async function selectBranch() {
    const branches = await gitBranches(silent());

    const choices = [];
    branches.forEach(item => {
        if (!item.match(/^origin/))
            choices.push({
                name: item.white,
                value: item
            });
    });

    const answers = await inquirer.prompt({
        type: 'list',
        name: 'branch',
        message: 'Select branch'.cyan.bold,
        choices: choices,
        default: 'master',
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
        .alias('b')
        .option('-e, --extra', 'extract branch pattern naming')
        .description('branches: list all available')
        .action(gitBranches);

    program
        .command('current')
        .alias('cur')
        .description('branch: display current branch')
        .action(gitCurrentBranch);

    program
        .command('checkout [branch]')
        .alias('ck')
        .description('branch: checkout branch')
        .action(gitCheckout);
}

export {
    gitBranches,
    gitCurrentBranch,
    gitCheckout,
    selectBranch,
    register
};

// ____end of file____
