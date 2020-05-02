#!/usr/bin/env node

'use strict';

import {
    run,
    insert,
    inject
} from './utils.js';
import 'colors';


async function gitCurrentBranch() {
    const { stdout } = await run('git symbolic-ref --short HEAD');
    return stdout.split('\n')[0];
}


async function gitStatusShort() {
    const { stdout } = await run('git status -s');

    let items = stdout
        .split('\n')
        .filter(line => !!line.trim())
        .map(line => insert(line, 1, ' '))
        .map(line => {
            let wd = line.charAt(2);
            if (wd == " ")
                return line.green
            else if (wd == "?")
                return line.yellow
            else
                return line.red
        });

    if (items.length == 0)
        items = ['nothing to commit'.green];

    return items;
};

async function gitLogShort() {
    const { stdout } = await run("git log --pretty='format:%h %<|(40,trunc)%s %ci'");

    let items = stdout
        .split('\n')
        .filter(line => !!line.trim());

    return items;
}

async function gitGraphShort() {
    const { stdout } = await run("git log --graph --pretty='format:%h %<|(40,trunc)%s %ci'");

    let commits = stdout
        .split('\n')
        .filter(line => !!line.trim());

    return commits;
}

async function gitOriginAdvance(branch) {
    try {
        const { stdout } = await run(`git rev-list --count --left-right origin/${branch}...HEAD`);

        let counts = stdout
            .split('\t')
            .map(count => parseInt(count))
        if (counts.length != 2)
            throw new Error('invalid result')

        return counts;
    } catch (error) {
        return ([]);
    }
}

async function gitFullStatus() {
    let
        branch,
        paths,
        commits,
        advance;
    branch = await gitCurrentBranch();
    paths = await gitStatusShort();
    commits = await gitGraphShort();//gitLogShort();
    advance = await gitOriginAdvance(branch);

    console.log('--------------------------------------------------------------------');
    console.log(`Current branch is ${branch.magenta}`.cyan.bold);
    console.log('  Commits log of the branch :'.blue);
    commits.forEach(commit => console.log(`  ${commit}`));
    console.log('  Differences between HEAD, index and working tree :'.blue)
    paths.forEach(path => console.log(`    ${path}`));
    console.log('  Commits behind - ahead / upstream :'.blue)
    if (advance.length == 2) {
        if (advance[0] == 0 && advance[1] == 0)
            console.log(`    equal      ${advance[0]} - ${advance[1]}`.green);
        else if (advance[0] > 0 && advance[1] > 0)
            console.log(`    diverged   ${advance[0]} - ${advance[1]}`.red);
        else if (advance[0] > 0)
            console.log(`    behind     ${advance[0]} - ${advance[1]}`.red);
        else
            console.log(`    ahead      ${advance[0]} - ${advance[1]}`.yellow);
    }
    else
        console.log('    no upstream'.red);
    console.log('--------------------------------------------------------------------');
    await gitGraphShort()

    return branch;
}

export {
    gitStatusShort,
    gitCurrentBranch,
    gitLogShort,
    gitOriginAdvance,
    gitGraphShort,
    gitFullStatus
}

//____end of file____
