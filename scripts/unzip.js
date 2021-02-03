const {createWriteStream} = require('fs');
const JSZip = require('jszip');
/* eslint-disable no-console,no-loop-func */
function onComplete(cond, resolve, result) {
  if (cond) resolve(result);
}

module.exports.default = async function unzip(zipFile, dests) {
  try {
    const zip = await JSZip.loadAsync(zipFile);
    const size = Object.keys(zip.files).length;
    const successFiles = Object.values(dests);
    let count = 0;

    return new Promise((resolve, reject) => {
      for (const [file, content] of Object.entries(zip.files)) {
        if(file.indexOf("index.min")===-1){
          continue;
        }
        if (!content.dir) {
          const destPath = dests.find(destination => destination.includes(file));

          zip
            .file(file)
            .nodeStream()
            .pipe(createWriteStream(destPath))
            .on('error', e => {
              console.error(`Unzip ${file} failed.`);
              successFiles.splice(successFiles.indexOf(destPath), 1);
              onComplete(++count === size, resolve, successFiles);
            })
            .on('finish', () => {
              console.log(`${destPath} written.`);
              onComplete(++count === size, resolve, successFiles);
            });
        } else console.error(`Cant process dir ${file}.`);
      }
    });
  } catch (err) {
    throw new Error(err);
  }
};
