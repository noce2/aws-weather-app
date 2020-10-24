#!/usr/bin/env node

const argv = (require('yargs'))(process.argv.slice(2))
    .alias('u', 'url')
    .alias('c', 'configuration')
    .demandOption(['u', 'c'])
    .argv;

const path = require('path');
const fs = require('fs');
const Handlebars = require("handlebars");
const templateProdString = (
`
export const environment = {
    production: true,
    apiUrl: '{{url}}'
};
`
);
const templateString = (
`
export const environment = {
    production: false,
    apiUrl: '{{url}}'
};
`
);
const template = Handlebars.compile((argv.c == 'production' ? templateProdString : templateString));
const resolvedPath = (argv.c == 'production' ?
  path.resolve('src/environments/environment.prod.ts') :
  path.resolve('src/environments/environment.ts'));
const compiledFile = template({url: argv.u})

fs.writeFileSync(resolvedPath, compiledFile)
