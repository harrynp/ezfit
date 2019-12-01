const csv = require('csv');
const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const kmeans = require('skmeans');
const workoutModel = require('../api/models/workoutmodel');

var trainingData;
var model;
async function trainModel() {
    try {
        const data = fs.readFileSync('data.csv', function(err, data) {
            if (err) {
                console.error(err);
                return false;
            }
        });
        return parseData(data);
    } catch (err) {
        throw err;
    }
}
function parseData(data) {
    const records = parse(data);
    trainingData = records.slice(1).map(function(d) {
        return d.map(function(entry) {
            return Number(entry);
        });
    });
    return getModel(trainingData);
}
function getModel(trainingData) {
    model = kmeans(trainingData, 4);
    modelTest = model.test;
    return model;
}
function getPrediction(model) {
    console.log(model);
}

module.exports = { trainModel, getPrediction };
