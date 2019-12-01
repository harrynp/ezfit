const csv = require('csv');
const fastcsv = require('fast-csv');
const fs = require('fs');

async function storeDataIntoCSV(featureList) {
    try {
        console.log(featureList.goals);
        const ws = fs.createWriteStream('out.csv');
        fastcsv.write(featureList.goals, { headers: true }).pipe(ws);
    } catch (err) {
        throw err;
    }
}

module.exports = { storeDataIntoCSV };
