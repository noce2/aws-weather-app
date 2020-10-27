const argv = (require('yargs'))(process.argv.slice(2))
    .alias('u', 'unconcatenatedFile')
    .alias('o', 'outputDir')
    .normalize('u')
    .normalize('o')
    .demandOption(['u', 'o'])
    .argv;

const path = require('path');
const fs = require('fs');

const inputFilePath = path.resolve(process.cwd(), argv.u);
const readBuffer = fs.readFileSync(inputFilePath);
const jsObject = JSON.parse(readBuffer.toString());
const outPutPath = path.resolve(process.cwd(), argv.o, path.basename(inputFilePath));
fs.writeFileSync(outPutPath, JSON.stringify(jsObject, null, 0));
