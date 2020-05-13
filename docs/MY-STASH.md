# My stashing workflow
<div align="right">
    <b><a href="../README.md">⟰ Project ReadMe</a></b>
</div>
<br></br>
This workflow is intended to manage unfinished work AND often changes of workplace.

## Table of contents
- [Introduction](#introduction)
- [Step by step](#step-by-step)
  - [Step 1: on computer 1](#step-1-on-computer-1)
  - [Step 2: on computer 2](#step-2-on-computer-2)
  - [Step n: on computer 1](#step-n-on-computer-1)
  - [Step n+1: on computer 2](#step-n-1)
- [Alternative with backup](#alternative)

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
<a name="step-n-1"></a>
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
<a name="alternative"></a>
## Alternative with backup
We can also a USB key as backup and push unfinished work on that key instead of central repo.
Backup process is described in [Git backup on USB key](GIT-BACKUP.md).
**Step 1**
```shell
git pull
# working .... time to leave !
git add .
git commit -m "TMP-save"
git push backup
```
**step 2**
```shell
git pull backup
# working .... time to leave !
git add .
git commit --amend --no-edit
git push backup
```
**step n**
```shell
git pull backup
# working .... ready to commit !
git add .
git commit --amend -m "Work finished"
git push origin 
```

<div align="right">
    <b><a href="#my-stashing-workflow">↥ back to top</a></b>
</div>

___--- end of file ---___
