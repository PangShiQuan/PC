const {spawnSync} = require('child_process');
const {basename} = require('path');
/* eslint-disable no-console */
module.exports.default = function gitAdd(files) {
  const subprocess = spawnSync('git', ['add', ...files]);

  if (subprocess.stderr.length)
    console.error(`${process.argv[1]} stderr: ${subprocess.stderr}`);
  else if (subprocess.stdout.length) console.log(subprocess.stdout.toString());
  else {
    const filesname = files.map(file => basename(file));
    console.log(`git add ${filesname.toString()}`);
  }
};
