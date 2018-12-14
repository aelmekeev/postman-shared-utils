const fs = require('fs');
const readline = require('readline');
const path = require('path');
const newman = require('newman');

function generateCollection(utilsName) {
  let collectionTemplate = require(path.join(__dirname, 'postman-shared-utils.postman_collection.json'), 'utf-8');

  // add utils
  collectionTemplate.item[0].event[0].script.exec = processFileLineByLine(path.join(__dirname, '..', 'utils', `${utilsName}.js`));

  // add tests
  collectionTemplate.item[0].event[1].script.exec = processFileLineByLine(path.join(__dirname, utilsName, `${utilsName}.tests.js`));

  // write result
  fs.writeFileSync(path.join(__dirname, `${utilsName}.postman_collection.json`), JSON.stringify(collectionTemplate, null, 2));
}

function processFileLineByLine(path) {
  const file = fs.readFileSync(path, 'utf-8');
  
  let result = [];
  
  for (const line of file.split(/[\r\n]+/)) {
    result.push(`${line}\r`);
  }
  
  return result;
}

function runUtilsTestsOneByOne(file, allUtils, hasFailures) {
  const utilsName = file.replace(/\.js$/, '');

  generateCollection(utilsName);

  const testData = require(path.join(__dirname, utilsName, `${utilsName}.json`));
  newman.run({
    collection: require(path.join(__dirname, '.', `${utilsName}.postman_collection.json`)),
    iterationCount: testData.length,
    iterationData: testData,
    reporters: 'cli'
  }, (error, summary) => {
    if (summary.run.stats.assertions.failed) hasFailures = true;

    // clean up generated collections
    fs.unlinkSync(path.join(__dirname, `${utilsName}.postman_collection.json`));

    if (allUtils.length) runUtilsTestsOneByOne(allUtils.shift(), allUtils, hasFailures);
    if (!allUtils.length && hasFailures) process.exit(1);
  });
}

const utils = fs.readdirSync(path.join(__dirname, '..', 'utils'));

runUtilsTestsOneByOne(utils.shift(), utils, false);