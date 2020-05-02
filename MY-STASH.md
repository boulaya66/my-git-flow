# My stashing workflow
[Go back to ReadMe](README.md)

This workflow is intended to manage unfinished work AND often changes of workplace.

## Introduction

**Note 1**: launch this set of commands to start any session
```shell
git fetch -all
git checkout $branch
git pull
# if rejected (because of conflict)
git reset --hard origin/$branch
```
**Note 2**: to retreive the number of TMP commits
```shell
git log --pretty='format:%s' | grep "TMP" | wc -l
```
**Note 3**: to check potential conflicts with origin/$branch
```shell
branch=$(git rev-parse --abbrev-ref HEAD)
git rev-list --count --left-right origin/$branch...HEAD
```
## Step by step

### Step 1: on computer 1
```shell
git pull
# working .... time to leave !
git add .
git commit -m "TMP-save-1"
git push
```
### Step 2: on computer 2 
```shell
git pull
# working .... time to leave !
git add .
git commit -m "TMP-save-2"
git push
```
### Step n: on computer 1
```shell
git pull
# working .... ready to commit !
git reset --soft HEAD~n         # replace n by the correct value
git add .
git commit -m "Work finished"
git push --force                # !!very carefully
```
### Step n+1: on computer 2
```shell
git reset --hard origin/$branch  
# OR
git fetch --prune
# working again .... time to leave... again !
git add .
git commit -m "TMP-save-1"
git push
```
Go to step 1
___--- end of file ---___
