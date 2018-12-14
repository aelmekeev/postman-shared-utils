const fs = require('fs');
const path = require('path');
const newman = require('newman');

/**
 * Get the list of all files from utils and run tests for them. Assumptions:
 * 1. Utils code is located in utils/<utils name>.js
 * 2. Tests for utils are located in a single file under test/<utils name>/<utils name>.tests.js
 * 3. Test data for tests for utils are located in a single file under test/<utils name>/<utils name>.json
 */
const utils = fs.readdirSync(path.join(__dirname, '..', 'utils'));
runTests(utils, false);

/**
 * Generates postman collection by taking default "postman-shared-utils.postman_collection.json" template and:
 * 1. Inserting content of utils/{@param utilsName}.js into Pre-request Script
 * 2. Inserting content of test/{@param utilsName}/{@param utilsName}.tests.js into Tests
 * Collection is saved as test/{@param utilsName}.postman_collection.json.
 *
 * @param utilsName name of utils to generate collection for
 * @returns {String} path to generated collection
 */
function generateCollectionWithTests(utilsName) {
  let template = require(path.join(__dirname, 'postman-shared-utils.postman_collection.json'), 'utf-8');

  // update Pre-request Script
  template.item[0].event[0].script.exec = getPostmanExecFromFile(path.join(__dirname, '..', 'utils', `${utilsName}.js`));

  // update Tests
  template.item[0].event[1].script.exec = getPostmanExecFromFile(path.join(__dirname, utilsName, `${utilsName}.tests.js`));

  const pathToCollection = path.join(__dirname, `${utilsName}.postman_collection.json`);
  fs.writeFileSync(pathToCollection, JSON.stringify(template));
  return pathToCollection;
}

/**
 * Processes file and returns array that can be inserted into postman collection json.
 *
 * @param pathToFile path to file to process
 * @returns {Array<String>} array for exec field of postman collection json
 */
function getPostmanExecFromFile(pathToFile) {
  const file = fs.readFileSync(pathToFile, 'utf-8');

  let result = [];

  for (const line of file.split(/[\r\n]+/)) {
    result.push(`${line}\r`);
  }

  return result;
}

/**
 * Runs tests by running generated postman collection with test data.
 * Note: this method uses recursion to run collections in sequence. This allows easily analyze reports (console).
 * Later can be replaced with parallel run with json / html report uploaded to some external location.
 *
 * @param allUtils list of utils to run tests for
 * @param hasFailures flag that is passed through whole sequence to show if there were failing tests or not
 */
function runTests(allUtils, hasFailures) {
  const file = allUtils.shift();
  const utilsName = file.replace(/\.js$/, '');

  const pathToCollection = generateCollectionWithTests(utilsName);

  const testData = require(path.join(__dirname, utilsName, `${utilsName}.json`));
  newman.run({
    collection: require(pathToCollection),
    iterationCount: testData.length,
    iterationData: testData,
    reporters: 'cli'
  }, (error, summary) => {
    if (summary.run.stats.assertions.failed) hasFailures = true;

    // clean up generated collections
    fs.unlinkSync(pathToCollection);

    // run tests for next utils
    if (allUtils.length) runTests(allUtils, hasFailures);

    // exit with error code after all collections run if there were failing tests
    if (!allUtils.length && hasFailures) process.exit(1);
  });
}