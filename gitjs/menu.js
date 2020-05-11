'use strict';

/**
 * import packages
 */
import inquirer from 'inquirer';
import CommandPrompt from 'inquirer-command-prompt';

import { runUnsafe, log, silent, colors } from './utils.js';
import program from './init.js';
import * as branches from './git-branch.js';
import * as status from './git-status.js';

// #region Functions

const formatNumber = x => isNaN(x) ? '??' : x;

async function keypress() {
    log(colors.verbose('white.bold Press any key to continue'));
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

const gitCommands = ['branch', 'commit', 'pull', 'push', 'add', 'status', 'diff', 'reset', 'checkout', 'merge', 'log', 'tag', 'fetch', 'remote', 'log', 'rebase'];

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
    gitCommands.forEach(word => autoCompletion.push('git ' + word));

    // add categories to choices
    program.categories().forEach(category => {
        if (category)
            menuChoices.push({
                value: 'Menu',
                name: colors.input(category), // category.blue.bold,
                sort: category
            });
    });

    // add gitjs commands to choices
    program.commands.forEach((cmd, index) => {
        if (cmd.name() !== '!list') { // exclude or not list command
            // usage
            let usage = '[';
            cmd.options.forEach(opt => { usage += colors.data(`${opt.short} `) });
            usage += ']';
            cmd._args.forEach(arg => {
                usage += arg.required ? colors.debug(`<${arg.name}> `) : colors.data(`[${arg.name}] `);
            });

            // description
            const desc = '' + colors.info(cmd.description().padEnd(40));

            // add to choices
            menuChoices.push({
                value: cmd.name(),
                name: `${desc.padEnd(40)} ${cmd._aliases.length > 0 ? colors.verbose(cmd._aliases[0].padEnd(2)) : '  '} ${usage.padEnd(20)}`,
                sort: `${cmd.category()}${cmd.name()}`
            });
        }
    });
    menuChoices.sort((a, b) => a.sort.localeCompare(b.sort));
    menuChoices.push(new inquirer.Separator());
    menuChoices.push({ name: colors.input('Prompt'), value: 'Prompt' });
    menuChoices.push({ name: colors.help('Help'), value: 'Help' });
    // items.push(new inquirer.Separator());
    menuChoices.push({ name: colors.debug('Quit gitjs'), short: ' ', value: '' });

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
        message: colors.input(`[${pwd}] >`),
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
    log(colors.custom(`Gitjs on local branch ${branches.localBranch}`.padEnd(55) +
        colors.data(`${formatNumber(status.localStatus.untracked)}U `.padEnd(4)) +
        colors.error(`${formatNumber(status.localStatus.modified)}M `.padEnd(4)) +
        colors.warn(`${formatNumber(status.localStatus.staged)}S `.padEnd(4)) +
        colors.error(`${formatNumber(status.localStatus.behind)}↓ `.padEnd(4)) +
        colors.warn(`${formatNumber(status.localStatus.ahead)}↑ `.padEnd(4))
    ));

    const answers = await inquirer.prompt({
        type: 'list',
        name: 'command',
        message: colors.prompt('Select git-js command'),
        choices: menuChoices,
        default: 'Prompt',
        pageSize: menuChoices.length + 6,
        prefix: '⟰'
    });

    if (!answers.command) {
        log(colors.debug('Quit gitjs'));
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
                log(colors.debug('Quit gitjs'));
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
