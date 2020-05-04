#!/usr/bin/env node

"use strict";

/**
 * import packages
 */
import program from "./init.js";


/**
 * gitjs
 * async commander main entry point
 */
async function gitjs() {
    if (!process.argv.slice(2).length) {
        program.outputHelp();
        process.exit();
    }
    return await program.parseAsync(process.argv);
}

/**
 * module entry point
 */
gitjs().catch(error => console.error(error.message));

//____end of file____
