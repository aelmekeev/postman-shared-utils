# Postman Shared Utils

## Overview

[Postman](https://www.getpostman.com/) is an API Development Environment that is used by many teams all around the world. This repository contains utilities that can be "imported" into any postman collection and used in any of your tests.

Postman team recently has introduced [Postman collection templates](http://blog.getpostman.com/2018/11/02/created-a-killer-collection-share-it-with-postmans-5-million-developers-via-a-template/). You can share your code this way as well. But here we can use all the power of open source + add tests for our utils!

## Usage

1. Check `utils` directory for existing utilities and find the one you need.
2. Copy content of the file and paste it to Pre-request Script of your Postman collection.
3. Check comment section in the beginning of the snippet you've pasted. You should find there:
   - instruction to import the utils
   - list of methods available in the utils
   - instructions to use these methods
 
## Available utils

|Utils|Description|
|-----|-----------|
|jwt-utils|Methods to work with JWT tokens.|

## Contribution

Common steps to add new utils to this repository include:

1. Add `<utility name>.js` under `utils/` folder with the code of utility.
2. Add tests for you utility:
   - add `<utility name>.tests.js` under `test/<utility name>/` with the code that of tests
   - add `<utility name>.json` under `test/<utility name>/` with the test data for your tests

**Note:** currently only one file with tests can be added so if you have several methods in the utility you will have to use some kind of branching based on test data. Or you can extend `test/run-tests.js` to allow several tests files per utility :)

Feel free to check other utilities for examples of documentation and tests.

## Code status 

Tests are running each week with the latest version of newman.

[![Build Status](https://travis-ci.com/donotello/postman-shared-utils.svg?branch=master)](https://travis-ci.com/donotello/postman-shared-utils)

## License

Postman Shared Utils is released under the [MIT License](https://opensource.org/licenses/MIT).