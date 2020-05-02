# My git flow
[Go back to ReadMe](README.md)

Sources:
- Github flow
- Atlassian feature branch workflow

## STEP 0: start with an up-to-date master
```shell
git checkout master
git fetch origin
git reset --hard origin/master
```
## STEP 1: create branch
```shell
git branch $branch
git checkout $branch
                                            # OR
git checkout -b $branch
```
## STEP 2: repeat(work on branch)
Commits....
```shell
# working ...
git add .
git commit -am "#XXX-msg-1"
# working ...
git add .
git commit -am "#XXX-msg-n"
# first commit
git push -u origin $branch                  
```
...do other stuff...
```shell
git fetch --all
git checkout $branch
git pull
                                            # working ...
git add .
git commit -am "#XXX-msg-n+1"
git push                                    # other commits
```
....and clean up
```shell
start = $(git merge-base $branch master)
git rebase -i $start
                                            # clean history
git rebase --edit-todo
git rebase --continue
```

## STEP 3: merge feature into master

Rebase from master...
```shell
git rebase -i master
                                            # resolve conflicts
git rebase --continue
git push
```
...test...
...and merge into master
```shell
git checkout master
git pull
git merge $branch
git push
```

## STEP 4: tag and delete branch
```shell
git checkout master
git pull
git tag -a $version -m $version-extended
git push --tags
git branch -d $branch
git push origin --delete $branch      
```
___--- end of file ---___
