# git-js 
<div align="right">
    <b><a href="README.md">⟰ Project ReadMe</a></b>
</div>

## Table of contents
- [Setting up a node shell script](##setting-up-a-node-shell-script)
    - [Reading files](#reading-files)
    - [Pipes In](#pipes-in)
    - [Pipes Out](#pipes-out)
    - [Environment and arguments](#environment-and-arguments)

## Setting up a node shell script

1. Add that line at the top of the js script
```shell
#!/usr/bin/env node
```
2. Set the execution permissions
```shell
chmod +x script.js
```
3. Test it
```shell
./script.js
```
### Reading files
```javascript
#!/usr/bin/env node
var fs = require('fs'); 
var contents = fs.readFileSync('my_file.txt', 'utf8'); 
console.log(contents);
```
### Pipes In
This is a sample code reading stdin.
```javascript
#!/usr/bin/env node 
var readInput = function(callback){ 
    var input = ''; 
    process.stdin.setEncoding('utf8'); 
    process.stdin.on('readable', function() { 
        var chunk = process.stdin.read(); 
        if (chunk !== null) { 
            input += chunk; 
        } 
    }); 
    process.stdin.on('end', function() { 
        callback(input); 
    });
} 
var initScript = function(input){ 
    console.log(input) 
} 
readInput(initScript);
```

### Pipes Out
Put this piece of code before piping out.
```javascript
function epipeFilter(err) {
    if (err.code === 'EPIPE')
        process.exit;
    if (process.stdout.listeners('error').length <= 1) {
        process.stdout.removeAllListeners()     
        process.stdout.emit('error', err)       
        process.stdout.on('error', epipeFilter) 
}
process.stdout.on('error', epipeFilter);
```
### Environment and arguments
Get them respectively in process.env and process.argv
```javascript
#!/usr/bin/env node 
process.argv.forEach(function (param, position) { 
    console.log(position + ': ' + param); 
});
```
To parse complex arguments, one can also use `commander` package.
```javascript
#!/usr/bin/env node 
var program = require('commander'); 
program .version('0.0.1') 
    .option('­p, port [number]', 'Specify port to listen', 3000) 
    .option('­h, host [type]', 'Specify the host to listen from', 'localhost')
    .option('­v, verbose', 'Set verbose mode', false) 
    .parse(process.argv); 
console.log('Starting server with options:'); 
console.log(`port   : ${program.port}`);
console.log(`host   : ${program.host}`);
console.log(`verbose: ${program.verbose}`);
```
<div align="right">
    <b><a href="#git-js">↥ back to top</a></b>
</div>

___--- end of file ---___
