'use strict';

/**
 * import packages
 */
import commander from 'commander';
import inquirer from 'inquirer';
import colors from 'colors';
import { log } from './utils.js';
import { getCurrentVersion } from './version.js';
import * as branches from './git-branch.js';
import * as status from './git-status.js';

/**
 * gitjsCommand
 * extends Commander with common options
 */
class GitjsCommand extends commander.Command {
    command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
        const cmd = super.command(nameAndArgs, actionOptsOrExecDesc, execOpts);
        cmd
            .option('-C, --no-color', 'remove color', false)
            .option('-v, --verbose', 'output results', true)
            .option('--silent, --no-verbose', 'disable output')
            .option('-cl, --clear', 'clear console before command output')
            .on('option:no-color', () => {
                colors.disable();
            })
            .on('option:no-verbose', () => {
                log.disable();
            })
            .on('option:clear', () => {
                console.clear();
            });

        return cmd;
    }
}

/**
 * initialize commander
 */
const program = new GitjsCommand()
    .version(getCurrentVersion())
    .description('my commander test')
    .option('-C, --no-color', 'remove color', false)
    .option('--silent, --no-verbose', 'disable output')
    .option('-cl, --clear', 'clear console before command output')
    .on('option:no-color', () => {
        colors.disable();
    })
    .on('option:no-verbose', () => {
        log.disable();
    })
    .on('option:clear', () => {
        console.clear();
    });

branches.register(program);
status.register(program);

/**
 * gitjsList
 * list all available commands
 * => call within commander: list, l
 * => call direct
 */
async function gitjsList(options) {
    let items = [];
    program.commands.forEach(cmd => {
        if (options.verbose) {
            items.push(`${cmd.name().padEnd(20)} ${cmd._aliases.join(', ').padEnd(20)} ${cmd.description()}`);
        } else {
            items.push(cmd.name());
            items = items.concat(cmd._aliases);
        }
    });
    items.sort();

    log('Available gitjs commands'.cyan);
    log(`${'Commands'.padEnd(20)} ${'Aliases'.padEnd(20)} Description`);
    log(items.join('\n'));

    return items.join('\n');
}

/**
 * gitjsMenu
 * gitjs interactive
 */
async function gitjsMenu(options) {
    console.clear();

    const items = [];
    program.commands.forEach(cmd => {
        if (cmd.name() !== 'list')
            items.push({
                value: cmd.name(),
                name: `${cmd.description().padEnd(40).white} | ${cmd.usage().padEnd(20)}`
            });
    });
    items.sort((a, b) => a.name.localeCompare(b.name));
    items.push(new inquirer.Separator());
    items.push({ name: 'Help'.yellow.bold, value: 'Help' });
    items.push(new inquirer.Separator());
    items.push({ name: 'Abort'.red.bold, short: ' ', value: '' });

    const answers = await inquirer.prompt({
        type: 'list',
        name: 'command',
        message: 'Select git-js command'.cyan.bold,
        choices: items,
        default: 'Help',
        pageSize: 20
    });

    if (!answers.command) {
        log('Abort.'.red);
    } else if (answers.command === 'Help') {
        program.outputHelp();
    } else {
        const cmd = program.commands.find(cmd => cmd.name() === answers.command);
        process.argv.push(cmd.name());
        if (cmd._args.length > 0 && cmd._args[0].required && cmd._args[0].name === 'branch') {
            const branch = await branches.selectBranch();
            process.argv.push(branch);
        }
        await program.parseAsync(process.argv);
    }
}

program
    .command('list')
    .alias('l')
    .description('list all available commands')
    .action(gitjsList);

export default program;

export {
    program,
    gitjsMenu
};

// ____end of file____
