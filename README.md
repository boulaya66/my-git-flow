# Testing my git flow

<a name="top"></a>

## Documentation

- [My git flow](./docs/MY-GITFLOW.md)
- [My stashing workflow](./docs/MY-STASH.md)
- [Feature set] ***TODO***
- Usefull commands (see below)

## Useful commands

### Show branches

| Command | Description |
| --- | --- |
|`git fetch --all`|Fetch all remotes|
|`git branch -a`|List both remote-tracking branches and local branches. |
|`git branch -r`|List the remote-tracking branches.|

### Rename branches

| Command | Description |
| --- | --- |
|`git $branch -m new-name`|Rename local branch, assuming we're in.|
|`git push origin :$branch new-name`|Delete the old-name remote branch and push the new-name local branch.|
|`git push origin -u new-name`|Reset the upstream branch for the new-name local branch,assuming we switched to it.|

### Show status

| Command | Description |
| --- | --- |
|`git rev-parse --abbrev-ref HEAD`|Retreives current branch name|
|`git symbolic-ref --short HEAD`|Retreives current branch name|
|`git rev-list --count --left-right origin/$branch...HEAD`|print the counts for left and right commits, separated by a tab|
|`git log --pretty='format:%H %s'`|Customized logging: full commit tag and name|
|`git log --graph --pretty='format:%H %s'`|Same with graph otpion|
|`git status -s`|Give the output in the short-format.|
|``||

### Undo

| Command | Description |
| --- | --- |
|`git checkout HEAD file`||
|`git reset file`||
|`git reset --soft HEAD~1`||
|`git commit --amend --no-edit`||
<div align="right">
    <b><a href="#top">↥ back to top</a></b>
</div>

___--- end of file ---___
