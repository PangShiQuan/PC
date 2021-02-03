// #!/usr/bin/env node
const state = process.env.NODE_ENV === 'development' ? 'start' : 'build';
const isWin = process.platform === 'win32';
const fs = require('fs');
const {spawn} = require('child_process');

const cmd = isWin ? `bin\\${state}_modules.cmd` : `bin/${state}_modules`;

if (!isWin) {
  fs.chmodSync('./bin/build_modules', 0o765);
}

spawn(cmd, [], {stdio: 'inherit'}).on('exit', code => {
  process.exit(code);
});
