#!/usr/bin/env node

"use strict";

import "colors";
import * as gitstatus from "./git-status.js";
import * as gitbranch from "./git-branch.js";

const gitFuncs = { ...gitstatus, ...gitbranch };

function usage() {
    console.log("gitjs usage: gitjs command [arguments]".cyan);
    console.log("  available commands (with expected arguments length):");
    for (let func in gitFuncs)
        console.log(`  ${func.padEnd(20)} ${gitFuncs[func].length}`);
    let args = process.argv
        .map(arg =>
            (arg.includes("\\") || arg.includes("/"))
                ? arg.split("\\").pop().split("/").pop()
                : arg
        )
        .join(" ");
    console.log(`abort ${args}`.red);
    return;
}

class GitJsError extends Error {
    constructor(message) {
        super(`gitjs error: ${message}`.red);
    }
}

function errHandler(error) {
    if (error instanceof GitJsError) {
        console.log(error.message);
        usage();
        return;
    }
    console.log(error);
    return;
}

async function gitCommand(args) {
    if (args.length < 1)
        throw new GitJsError("git command not provided.");

    let command = args[0];

    if (!gitFuncs.hasOwnProperty(command))
        throw new GitJsError(`unknwon command "${command}"`);

    let fn = gitFuncs[command];
    let options = args.slice(1);

    if (options.length < fn.length)
        throw new GitJsError(`missing arguments in "${args.join(" ")}"`);

    return await fn(...options);
}

gitCommand(process.argv.slice(2)).catch(errHandler);

//____end of file____
