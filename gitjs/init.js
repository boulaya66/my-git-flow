'use strict';

/**
 * import packages
 */
import commander from 'commander';
import { log, colors } from './utils.js';
import { getCurrentVersion } from './version.js';
import * as branches from './git-branch.js';
import * as status from './git-status.js';
import * as commit from './git-commit.js';
import * as workflow from './git-workflow.js';

// #region extends commander.Command

/**
 * gitjsCommand
 * extends Commander with common options
 */
class GitjsCommand extends commander.Command {
    constructor(name) {
        super(name);
        this._category = '';
        this.exitOverride();
    }

    createCommand(name) {
        return new GitjsCommand(name);
    };

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

    category(name) {
        if (!name)
            return this._category;
        this._category = name;
        return this;
    }

    categories() {
        const names = [];
        this.commands.forEach(cmd => {
            if (!names.includes(cmd.category()))
                names.push(cmd.category());
        });

        return names;
    }
}

// #endregion

// #region init gitjs

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
            items.push(`${cmd.name().padEnd(20)} ${cmd._aliases.join(', ').padEnd(10)} ${cmd.description()}`);
        } else {
            items.push(cmd.name());
            items = items.concat(cmd._aliases);
        }
    });
    items.sort();

    log.info('Available gitjs commands');
    log(`${'Commands'.padEnd(20)} ${'Aliases'.padEnd(10)} Description`);
    log(items.join('\n'));

    return items.join('\n');
}

/**
 * togglecolor
 * toggle colors.enabled and emit event
 */
async function togglecolor() {
    colors.toggle();
    program.emit('color');
    log(colors.custom(`${colors.enabled() ? 'enabled' : 'disabled'}`));
}

/**
 * initialize commander
 */
function init() {
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
    commit.register(program);
    workflow.register(program);

    program
        .command('list')
        .alias('l')
        .description('list all available commands')
        .action(gitjsList)
        .category('.gitjs');

    program
        .command('toggleColor')
        .description('toggle gitjs color')
        .action(togglecolor)
        .category('.gitjs');

    return program;
}

const program = init();

// #endregion

export default program;

// ____end of file____
