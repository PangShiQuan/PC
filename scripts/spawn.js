const {spawnSync} = require('child_process');
const {existsSync} = require('fs');
const {resolve} = require('path');
/* eslint-disable no-console */
const args = process.argv.slice(3);
const scriptPath = resolve(__dirname, process.argv[2]);

if (!existsSync(scriptPath)) throw new Error(`${scriptPath} is not exist.`);
else args.unshift(scriptPath);

const subprocess = spawnSync('node', args);

if (subprocess.stderr.length)
  throw new Error(`${process.argv[1]} stderr: ${subprocess.stderr}`);
else if (subprocess.stdout.length) console.log(subprocess.stdout.toString());
