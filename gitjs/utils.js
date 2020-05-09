'use strict';

import util from 'util';
import { exec } from 'child_process';
import chalk from 'chalk';

const debug = false;
function rlog(msg) {
    if (debug)
        console.log(msg);
}

// #region async running tasks

const run = util.promisify(exec);

const runSafe = async (cmd) => {
    rlog(cmd);
    const res = { cmd: cmd, data: null, err: null };
    try {
        const { stdout } = await run(cmd);
        rlog(stdout);
        res.data = stdout;
    } catch (error) {
        rlog(error.stderr || error.message);
        res.err = error.stderr || error.message;
    }
    return res;
};

const runUnsafe = async (cmd) => {
    rlog(cmd);
    try {
        const { stdout } = await run(cmd, { shell: true });
        rlog(stdout);
        return stdout;
    } catch (error) {
        rlog(error.stderr || error.message);
        throw new Error(error.stderr || error.message);
    }
};

function runFactory(cmd) {
    const runTask = async (...args) => {
        const task = util.format(cmd, ...args);
        rlog(task);
        const res = { cmd: task, data: null, err: null };
        try {
            const { stdout } = await run(task);
            rlog(stdout);
            res.data = stdout;
        } catch (error) {
            rlog(error.stderr || error.message);
            res.err = error.stderr || error.message;
        }
        return res;
    };

    runTask.unsafe = async (...args) => {
        const task = util.format(cmd, ...args);
        rlog(task);
        try {
            const { stdout } = await run(task);
            rlog(stdout);
            return stdout;
        } catch (error) {
            rlog(error.stderr || error.message);
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
log.warn = (message, verbose = true) => { log(chalk.yellow(message), verbose) };
log.error = (message, verbose = true) => { log(chalk.red(message), verbose) };
log.debug = (message) => { if (debug) console.log(chalk`{red.bold DEBUG: }{yellow ${message}}`); };

// #endregion

// #region  colorized console.error

const olderror = console.error;
console.error = (message) => olderror(chalk.red(message));

// #endregion

export {
    run,
    runFactory,
    runSafe,
    runUnsafe,
    insert,
    inject,
    silent,
    log
};

// ____end of file____
