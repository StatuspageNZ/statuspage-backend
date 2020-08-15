const databaseClient = require('../db');
const rp = require('request-promise')

const jobName = "QUAKE_JOB";
const tableName = "quake_status"

const log = (message) => console.log(jobName + ": " + message);

const quakeJob = async (job, done) => {
  log("Starting");

  try {
    const site = await rp({ url: "https://api.geonet.org.nz/quake?MMI=6", insecureHTTPParser: true })
    const obj = JSON.parse(site);
    const { features } = obj
    const oneDayAgo = new Date(new Date().setDate(new Date().getDate() - 1))
    let isOk = null;
    for (const { properties: { time }} of features) {
        
        timeFormatted = new Date(time);

        if (timeFormatted > oneDayAgo) {
            log("Earthquake Today")
            isOk = false;
        } else {
            log("No Major Quakes")
            isOk = true;
        }
    }

    const db = databaseClient.db("statuspage");
    const collection = db.collection(tableName);

    const model = {
      timestamp: new Date().getTime(),
      isOk: isOk
    }

    await collection.insertOne(model);
  }
  catch (e) {
      console.log("Error: ", e);
  }
  log("Ending");
  done();
};

module.exports = quakeJob;