'use strict';

/**
 * import packages
 */
import inquirer from 'inquirer';
import CommandPrompt from 'inquirer-command-prompt';
import chalk from 'chalk';

import { runUnsafe, log, silent } from './utils.js';
import program from './init.js';
import * as branches from './git-branch.js';
import * as status from './git-status.js';

// #region Functions

const formatNumber = x => isNaN(x) ? '??' : x;

async function keypress() {
    log(chalk`{white.bold Press any key to continue}`);
    process.stdin.resume();
    process.stdin.setRawMode(true);
    return new Promise(resolve => process.stdin.once('data', () => {
        process.stdin.setRawMode(false);
        resolve();
    }));
};

async function processCommand(command) {
    const cmd = command.split(' ');
    if (gitjsCommands.includes(cmd[0])) {
        const argv = process.argv.concat(cmd);
        try {
            await program.parseAsync(argv);
        } catch (error) {
            if (error.message !== '(outputHelp)')
                log.error(`Abort "${command}".`);
        }
    } else if (cmd[0] === 'git') {
        try {
            cmd.splice(1, 0, '-c color.status=always', '-c color.ui=always');
            const data = await runUnsafe(cmd.join(' '));
            log(data.replace(/\n$/, ''));
        } catch (error) {
            log.error(`${error.message}`);
        }
    } else {
        try {
            const data = await runUnsafe(command);
            log(data.replace(/\n$/, ''));
        } catch (error) {
            log.error(`${error.message}`);
        }
    }
}

// #endregion

// #region Init
const promptCommands = ['quit', 'help', 'list', 'git', 'menu', 'clear'];

const gitjsCommands = [];

const menuChoices = [];

// TODO: check autocompletion for second parameter
var autoCompletion = [];

async function initMenu() {
    // register inquirer-command-prompt plugin
    inquirer.registerPrompt('command', CommandPrompt);

    // reset arrays
    gitjsCommands.splice(0, gitjsCommands.length);
    menuChoices.splice(0, menuChoices.length);

    // autocompletion update
    program.commands.forEach(cmd => {
        gitjsCommands.push(cmd.name());
        gitjsCommands.push(cmd._aliases[0]);
    });
    autoCompletion = promptCommands.concat(gitjsCommands);

    // add categories to choices
    program.categories().forEach(category => {
        if (category)
            menuChoices.push({
                value: 'Menu',
                name: chalk`{blue.bold ${category}}`, // category.blue.bold,
                sort: category
            });
    });

    // add gitjs commands to choices
    program.commands.forEach((cmd, index) => {
        if (cmd.name() !== '!list') { // exclude or not list command
            // usage
            let usage = '[';
            cmd.options.forEach(opt => { usage += chalk`{green ${opt.short} }` });
            usage += ']';
            cmd._args.forEach(arg => { usage += arg.required ? chalk`{magenta <${arg.name}> }` : chalk`{green [${arg.name}] }` });

            // description
            let desc = cmd.description().split(':');
            if (desc.length > 1)
                desc = '' + chalk.white.bold(desc[0].padEnd(8)) + ':' + chalk.white(desc[1].padEnd(31));
            else
                desc = '' + cmd.description().padEnd(40);

            // add to choices
            menuChoices.push({
                value: cmd.name(),
                name: `${desc.padEnd(40)} ${cmd._aliases.length > 0 ? chalk.white.bold(cmd._aliases[0].padEnd(2)) : '  '} ${usage.padEnd(20)}`,
                sort: `${cmd.category()}${cmd.name()}`
            });
        }
    });
    menuChoices.sort((a, b) => a.sort.localeCompare(b.sort));
    menuChoices.push(new inquirer.Separator());
    menuChoices.push({ name: chalk.blue.bold('Prompt'), value: 'Prompt' });
    menuChoices.push({ name: chalk.yellow.bold('Help'), value: 'Help' });
    // items.push(new inquirer.Separator());
    menuChoices.push({ name: chalk.red.bold('Quit gitjs'), short: ' ', value: '' });

    // init prompt
    log.enable();

    if (!branches.localBranch)
        await branches.gitCurrentBranch(silent());
}

// #endregion

// #region Menu

async function sessionPrompt() {
    let lines, pwd;
    try {
        lines = await runUnsafe('pwd');
        pwd = lines.split('\n')[0].split('/').pop();
    } catch (error) {
        pwd = 'gitjs';
    }

    const answers = await inquirer.prompt({
        type: 'command',
        name: 'command',
        message: chalk`{blue.bold [${pwd}] >}`, // '[gitjs] >'.blue.bold,
        prefix: '',
        autoCompletion: autoCompletion,
        context: 0
    });

    if (answers.command) {
        const command = answers.command;
        switch (command) {
            case 'quit':
                return 0;
            case 'menu':
                return 1;
            case 'help':
                program.outputHelp();
                break;
            case 'list':
                log(autoCompletion.join(', '));
                break;
            default:
                await processCommand(command);
                break;
        }
    }
    return 2;
}

async function session() {
    // end => 0:quit, 1:menu, 2:continue
    let end = 0;
    do
        end = await sessionPrompt();
    while (end === 2);
    return end;
}

async function menuPrompt() {
    let cmd, argv;

    console.clear();
    log(chalk.whiteBright.bgBlueBright.bold(`Gitjs on local branch ${branches.localBranch}`.padEnd(55) +
        chalk.green(`${formatNumber(status.localStatus.untracked)}U `.padEnd(4)) +
        chalk.red(`${formatNumber(status.localStatus.modified)}M `.padEnd(4)) +
        chalk.yellow(`${formatNumber(status.localStatus.staged)}S `.padEnd(4)) +
        chalk.red(`${formatNumber(status.localStatus.behind)}↓ `.padEnd(4)) +
        chalk.yellow(`${formatNumber(status.localStatus.ahead)}↑ `.padEnd(4))
    ));

    const answers = await inquirer.prompt({
        type: 'list',
        name: 'command',
        message: chalk`{cyan.bold Select git-js command}`,
        choices: menuChoices,
        default: 'Prompt',
        pageSize: menuChoices.length + 6,
        prefix: '⟰'
    });

    if (!answers.command) {
        log(chalk.red.bold('Quit gitjs'));
        return 0;
    }
    switch (answers.command) {
        case 'Menu':
            return 1;
        case 'Help':
            program.outputHelp();
            await keypress();
            return 1;
        case 'Prompt':
            if (await session() > 0) {
                return 1;
            } else {
                log(chalk.red.bold('Quit gitjs'));
                return 0;
            }
        default:
            cmd = program.commands.find(cmd => cmd.name() === answers.command);
            argv = Array.from(process.argv);
            argv.push(cmd.name());
            if (cmd._args.length > 0 && cmd._args[0].required && cmd._args[0].name === 'branch') {
                const branch = await branches.selectBranch(true, true, false);
                argv.push(branch);
            }
            await program.parseAsync(argv);
            await keypress();
            return 1;
    }
}

async function menu() {
    program
        .on('color', () => {
            return initMenu().then(() => this);
        });

    await initMenu();

    // end => 0:quit, 1:menu
    let end = 0;
    do
        end = await menuPrompt();
    while (end === 1);
}

// #endregion

export const gitjsMenu = menu;

export default gitjsMenu;

// ____end of file____
