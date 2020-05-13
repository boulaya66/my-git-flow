'use strict';

import util from 'util';
import { exec } from 'child_process';
import chalk from 'chalk';

const debug = false;

// #region async running tasks

const run = util.promisify(exec);

const runSafe = async (cmd) => {
    log.debug(cmd);
    const res = { cmd: cmd, data: null, err: null };
    try {
        const { stdout } = await run(cmd);
        log.debug(stdout);
        res.data = stdout;
    } catch (error) {
        log.debug(error.stderr || error.message);
        res.err = error.stderr || error.message;
    }
    return res;
};

const runUnsafe = async (cmd) => {
    log.debug(cmd);
    try {
        const { stdout } = await run(cmd, { shell: true });
        log.debug(stdout);
        return stdout;
    } catch (error) {
        log.debug(error.stderr || error.message);
        throw new Error(error.stderr || error.message);
    }
};

function runFactory(cmd) {
    const runTask = async (...args) => {
        const task = util.format(cmd, ...args);
        log.debug(task);
        const res = { cmd: task, data: null, err: null };
        try {
            const { stdout } = await run(task);
            log.debug(stdout);
            res.data = stdout;
        } catch (error) {
            log.debug(error.stderr || error.message);
            res.err = error.stderr || error.message;
        }
        return res;
    };

    runTask.unsafe = async (...args) => {
        const task = util.format(cmd, ...args);
        log.debug(task);
        try {
            const { stdout } = await run(task);
            log.debug(stdout);
            return stdout;
        } catch (error) {
            log.debug(error.stderr || error.message);
            throw new Error(error.stderr || error.message);
        }
    };

    return runTask;
}

// #endregion

// #region string enhancements

const insert = (str, index, value) => str.substr(0, index) + value + str.substr(index);

const inject = (str, obj) => str.replace(/\${(.*?)}/g, (x, g) => obj[g]);

// #endregion

// #region  colors (usefull to migrate from colors.js to/from chalk)

const colors = chalk;

/**
 * colors custom
 * add enable and disable for easier migration from colors.js
 */
colors.enable = function () { chalk.level = 1 };
colors.disable = function () { chalk.level = 0 };
colors.toggle = function () { chalk.level = chalk.level > 0 ? 0 : 1 };
colors.enabled = () => chalk.level > 0;

colors.silly = chalk.grey;
colors.input = chalk.blue.bold;
colors.verbose = chalk.white.bold;
colors.prompt = chalk.cyan.bold;
colors.info = chalk.white;
colors.data = chalk.green;
colors.help = chalk.yellow.bold;
colors.warn = chalk.yellow;
colors.debug = chalk.red.bold;
colors.error = chalk.red;
colors.custom = chalk.whiteBright.bgBlueBright.bold;

const olderror = console.error;
console.error = (message) => olderror(colors.error(message));

// #endregion

// #region  verbose option

// {...options, ...{ verbose: false }}
const silent = (options) => Object.assign({}, options, { verbose: false });

const log = (message, verbose = true) => {
    if (verbose && log.enabled)
        console.log(message);
};

log.enabled = true;
log.enable = function () { log.enabled = true };
log.disable = function () { log.enabled = false };

log.info = (message, verbose = true) => { log(chalk.cyan(message), verbose) };
log.warn = (message, verbose = true) => { log(colors.warn(message), verbose) };
log.error = (message, verbose = true) => { log(colors.error(message), verbose) };
log.debug = (message) => { if (debug) console.log(colors.debug(`DEBUG: ${colors.warn(message)}`)); };

// #endregion

export {
    // run,
    runFactory,
    runSafe,
    runUnsafe,
    insert,
    inject,
    silent,
    log,
    colors
};

// ____end of file____
