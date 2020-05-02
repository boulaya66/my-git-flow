# Testing my git flow...

## Documentation:
- [My git flow](MY-GITFLOW.md)
- [My stash] **TODO**
- [Feature set] ***TODO***
- Usefull commands (see bellow)


## Usefull commands

### Show branches

```bash
git fetch --all
git branch -a
git branch -r
```
### Show status
```bash
git rev-parse --abbrev-ref HEAD
git symbolic-ref --short HEAD
git rev-list --count --left-right origin/$branch...HEAD
git log --pretty='format:%H %s'
git status -s
```
```bash
git log --graph --pretty='format:%H %s'
```
### Undoos
```bash
git checkout HEAD file              
git reset file                      
git reset --soft HEAD~1             
git commit --amend --no-edit        
```

## Managing unfinished work AND changing workplace
Should be adapted to work on a specific branch

### On computer 1
```bash
git fetch --all
git pull
# working .... time to leave !
git add .
git commit -m "TMP-save-1"
git push
```
### On computer 2 
```bash
git fetch --all
git pull
# working .... time to leave !
git add .
git commit -m "TMP-save-2"
git push
```
### On computer 1 (step n)
```bash
git fetch --all
git pull
# working .... ready to commit !
git reset --soft HEAD~n         # replace n by the correct value
git add .
git commit -m "Work finished"
git push --force                # !!very carefully
```
### On computer 2
```bash
git fetch --all
git reset --hard origin/$branch  
# OR
git fetch --prune
# working again .... time to leave... again !
git add .
git commit -m "TMP-save-1"
git push
```
**TODO**: script to get n
___--- end of file ---___
