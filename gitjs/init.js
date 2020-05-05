'use strict';

/**
 * import packages
 */
import commander from 'commander';
import colors from 'colors';
import { log } from './utils.js';
import { getCurrentVersion } from './version.js';
import * as branch from './git-branch.js';
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

branch.register(program);
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

program
    .command('list')
    .alias('l')
    .description('list all available commands')
    .action(gitjsList);

export default program;

// ____end of file____
