'use strict';

import util from 'util';
import { runFactory } from './utils.js';

// #region git main object

export const git = {};

git.list = () => {
    return Object.keys(git);
};

git.inspect = () => {
    return util.inspect(git, { colors: true, depth: null, showHidden: true });
};

export default git;

// #endregion

// #region branch

git.createBranch = runFactory('git checkout -b %s'); // <branch>

git.pushBranch = runFactory('git push -u origin %s'); // <branch>

git.deleteLocalBranch = runFactory('git branch -d %s'); // <branch>

git.deleteRemoteBranch = runFactory('git push origin --delete %s'); // <branch>

git.branches = runFactory("git branch -a --format='%(refname:short)'");

git.getBranch = runFactory('git symbolic-ref --short HEAD');

git.checkout = runFactory('git checkout %s'); // <branch>

// #endregion

// #region status

git.status = runFactory('git status -s');

git.log = runFactory("git log --date='format:%x %X' --full-history --decorate --pretty='format:%h %<|(40,trunc)%s %cd %cN'");

git.graph = runFactory("git log --date='format:%x %X' --full-history --decorate --pretty='format:%h %<|(40,trunc)%s %cd %cN' --graph ");

git.advance = runFactory('git rev-list --count --left-right origin/%s...HEAD'); // <branch>

// #endregion

// #region commit

git.add = runFactory('git add -v .');

git.commit = runFactory('git commit -am "%s"'); // <msg>

git.push = runFactory('git push'); // (-u origin)

git.fetch = runFactory('git fetch'); // (--all)

git.pull = runFactory('git pull');

git.rebase = runFactory('git rebase -i %s'); // <commit | branch>

git.forkPoint = runFactory('git merge-base %s %s'); // <branch> <branch>

git.merge = runFactory('git merge %s'); // <branch>

git.reset = runFactory('git reset --soft HEAD~%d'); // <number>

git.amend = runFactory('git commit --amend --no-edit');

// #endregion

// #region tags

git.tag = runFactory('git tag -a %s'); // <version> (-m "msg")

git.pushTag = runFactory('git push origin %s'); // <version|--tags>

// #endregion

// ____end of file____
