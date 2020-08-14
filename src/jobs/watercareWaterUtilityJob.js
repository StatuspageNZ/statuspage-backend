const databaseClient = require('../db');
const fetch = require("node-fetch");

const jobName = "WATERCARE_WATER_UTILITY_JOB";
const tableName = "watercare_water_utility_status"

const log = (message) => console.log(jobName + ": " + message);

const watercareWaterUtilityJob = async (job, done) => {
  log("Starting");

  // example api response
  // [
  //   {
  //       "outageId": 9247,
  //       "location": "Laura ST Kelston , Auckland 0602",
  //       "latitude": -36.9025534667,
  //       "longitude": 174.6625456167,
  //       "startDate": "2020-08-15T07:43:00+12:00",
  //       "endDate": "2020-08-15T13:00:00+12:00",
  //       "outageType": "Unplanned"
  //   },
  // ]

  // note: outageType appears to be either "Unplanned" or "Planned"
  const watercareOutagesResponse = await fetch("https://api.watercare.co.nz/outages/all");
  const watercareOutages = await watercareOutagesResponse.json();

  const numberOfOutages = watercareOutages.length;
  const plannedOutages = watercareOutages.filter(o => o.outageType === "Planned").length;
  const unplannedOutages = watercareOutages.filter(o => o.outageType === "Unplanned").length;

  log(`${numberOfOutages} outages, ${plannedOutages} planned and ${unplannedOutages} unplanned`);

  const db = databaseClient.db("statuspage");
  const collection = db.collection(tableName);

  const model = {
    timestamp: new Date().getTime(),
    numberOfOutages: numberOfOutages,
    plannedOutages: plannedOutages,
    unplannedOutages: unplannedOutages,
    rawOutages: watercareOutages
  }

  await collection.insertOne(model);

  log("Ending");
  done();
}

module.exports = watercareWaterUtilityJob;