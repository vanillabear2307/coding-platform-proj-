const { executeCode } = require('./server/executor/executor');

executeCode('python3', 'import sys\nprint("Hello " + sys.stdin.read().strip())', 'World', 
    (output) => console.log('OUTPUT STREAM:', output),
    (done) => console.log('DONE:', done)
);
