#!/usr/bin/env node

const argv = (require('yargs'))(process.argv.slice(2))
    .alias('u', 'url')
    .demandOption(['u'])
    .argv;

const path = require('path');
const fs = require('fs');
const Handlebars = require("handlebars");
const templateString = (
`
export const environment = {
  production: true,
  apiUrl: '{{url}}'
}
`
);
const template = Handlebars.compile(templateString);
const resolvedPath = path.resolve('src/environments/environment.prod.ts')
const compiledFile = template({url: argv.u})

fs.writeFileSync(resolvedPath, compiledFile)
