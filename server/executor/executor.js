const Docker = require('dockerode');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const docker = new Docker();

// Helper functions for file names and commands
function getFileName(language) {
    switch(language) {
        case 'c': return 'main.c';
        case 'cpp': return 'main.cpp';
        case 'java': return 'Main.java';
        case 'python':
        case 'python3': return 'main.py';
        default: return 'main.txt';
    }
}

function getRunCommand(language, fileName) {
    switch(language) {
        case 'c': return `gcc ${fileName} -o main && ./main`;
        case 'cpp': return `g++ ${fileName} -o main && ./main`;
        case 'java': return `javac ${fileName} && java Main`;
        case 'python':
        case 'python3': return `python3 ${fileName}`;
        default: return `cat ${fileName}`;
    }
}

async function executeCode(language, code, stdin, onOutput, onDone) {
    const jobId = uuidv4();
    const tempDir = path.join(__dirname, 'temp', jobId);
    fs.mkdirSync(tempDir, { recursive: true });

    const fileName = getFileName(language);
    fs.writeFileSync(path.join(tempDir, fileName), code);

    // If stdin is provided, write it to an input.txt file
    if (stdin) {
        fs.writeFileSync(path.join(tempDir, 'input.txt'), stdin);
    }
    
    // Modify run command if stdin exists
    let command = getRunCommand(language, fileName);
    if (stdin) {
        command += ' < input.txt';
    }

    let container;
    try {
        container = await docker.createContainer({
            Image: 'code-sandbox',
            Cmd: ['sh', '-c', command],
            User: 'sandbox',
            HostConfig: {
                Memory: 128 * 1024 * 1024, // 128MB RAM limit
                NanoCpus: 500000000,       // 0.5 CPU cores
                NetworkMode: 'none',       // No internet
                PidsLimit: 50,             // Max 50 processes
                ReadonlyRootfs: true,      // Read-only filesystem
                Binds: [`${tempDir}:/home/sandbox/code`],
            },
            WorkingDir: '/home/sandbox/code' // Work inside the mounted directory
        });

        await container.start();

        const stream = await container.logs({ follow: true, stdout: true, stderr: true });
        
        // Count output to limit it to 64KB
        let outputSize = 0;
        const MAX_OUTPUT_SIZE = 64 * 1024; // 64KB

        stream.on('data', async (chunk) => {
            outputSize += chunk.length;
            if (outputSize > MAX_OUTPUT_SIZE) {
                onOutput('\n[Error: Output exceeded 64KB limit. Terminating...]');
                try {
                    await container.kill();
                } catch(e) {}
            } else {
                // dockerode logs format has an 8-byte header per chunk, we strip it out
                // chunk[0] is stream type (1=stdout, 2=stderr)
                const payload = chunk.slice(8).toString('utf8');
                if (payload) {
                    onOutput(payload);
                }
            }
        });

        // Set a timeout of 10 seconds to kill the container if it runs too long
        const timeoutHandle = setTimeout(async () => {
            try {
                const containerInfo = await container.inspect();
                if (containerInfo.State.Running) {
                    await container.kill();
                    onOutput('\n[Execution Timeout: 10 seconds exceeded]');
                }
            } catch (e) {
                // container might already be dead
            }
        }, 10000);

        await new Promise((resolve) => {
            stream.on('end', resolve);
        });

        clearTimeout(timeoutHandle);
        onDone({ status: 'success' });

    } catch (error) {
        onDone({ status: 'error', message: error.message });
    } finally {
        // ✅ fixed: always clean up container + temp dir (was only in catch before)
        if (container) {
            try {
                await container.remove({ force: true });
            } catch (e) {}
        }
        try {
            fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {}
    }
}

module.exports = { executeCode };
