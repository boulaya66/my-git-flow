# Testing my git flow...

## Documentation:
- [My git flow](MY-GITFLOW.md)
- [My stash](MY-STASH.md)
- [Feature set] ***TODO***
- Usefull commands (see bellow)


## Usefull commands

### Show branches
| Command | Description |
| --- | --- |
|`git fetch --all`|Fetch all remotes|
|`git branch -a`|List both remote-tracking branches and local branches. |
|`git branch -r`|List the remote-tracking branches.|
|``||
|``||
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
### Undoos
| Command | Description |
| --- | --- |
|`git checkout HEAD file`||
|`git reset file`||
|`git reset --soft HEAD~1`||
|`git commit --amend --no-edit`||
___--- end of file ---___
