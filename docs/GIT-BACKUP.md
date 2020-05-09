<a name="top"></a>
# Git backup on USB key
<div align="right">
    <b><a href="../README.md">⟰ Project ReadMe</a></b>
</div>
<br></br>
This workflow is intended to manage unfinished work AND often changes of workplace.

## Table of contents
- [Init backup repository](#step-1)
- [Add new remote to working repo](#step-2)
- [Clone backup repo](#step-3)

<a name="step-1"></a>
## Init backup repository
Find path to USB key with ```shell df -h```
Then
```shell
$ cd /media/<user>/<media name>
$ mkdir <project>.git
$ cd <project>.git
$ git init --bare
```
<a name="step-2"></a>
## Add new remote to working repo
```shell
$ cd /path/to/project
$ git remote add backup /media/<user>/<media name>/<project>.git
$ git remote -v
backup /media/<user>/<media name>/<project>.git (fetch)
backup /media/<user>/<media name>/<project>.git (push)
origin https://github.com/<user>/<project>.git (fetch)
origin https://github.com/<user>/<project>.git (push)
$ git push backup master
# git push backup <other-branch>
```
<a name="step-3"></a>
## Clone backup repo
```shell
$ cd /path/to/new-folder
$ git clone /media/<user>/<media name>/<project>.git
$ git remote rename origin backup
$ git remote add origin https://github.com/<user>/<project>.git
```
<div align="right">
    <b><a href="#top">↥ back to top</a></b>
</div>

___--- end of file ---___
