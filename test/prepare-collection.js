if (process.argv.length != 3) {
  console.log('Usage: node prepare-collection.js <name of utils, e.g. jwt-utils>');
  process.exit(1);
}

const fs = require('fs');
const readline = require('readline');
const path = require('path');

const utilsName = process.argv[2];

let collectionTemplate = require(path.join(__dirname, 'postman-shared-utils.postman_collection.json'), 'utf-8');

function processLineByLine(path) {
  const file = fs.readFileSync(path, 'utf-8');
  
  let result = [];
  
  for (const line of file.split(/[\r\n]+/)) {
    result.push(`${line}\r`);
  }
  
  return result;
}

// add utils
collectionTemplate.item[0].event[0].script.exec = processLineByLine(path.join(__dirname, '..', 'utils', `${utilsName}.js`));

// add tests
collectionTemplate.item[0].event[1].script.exec = processLineByLine(path.join(__dirname, utilsName, `${utilsName}.tests.js`));

// write result
fs.writeFileSync(path.join(__dirname, `${utilsName}.postman_collection.json`), JSON.stringify(collectionTemplate, null, 2));