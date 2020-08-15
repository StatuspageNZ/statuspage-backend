const databaseClient = require('../db');
const cheerio = require('cheerio');
const rp = require('request-promise')

const elementSelctor = ".status-indicator.active";
const jobName = "VODAFONE_LINE_JOB";
const tableName = "vodafone_line_status"

const log = (message) => console.log(jobName + ": " + message);

const vodafoneLineJob = async (job, done) => {
  log("Starting");

  try {
    const site = await rp({ url: "https://www.vodafone.co.nz/help/network-status/", insecureHTTPParser: true })
    const statusIndicator = cheerio(elementSelctor, site).last()
    console.log(statusIndicator.attr('class'))
    const lineStatus = statusIndicator.attr('class')

    let isOk = null;
    if (lineStatus === "status-indicator status2 active" || lineStatus === "status-indicator status1 active") {
      log("Line OK")
      isOk = true;
    } else {
      log("Line Outage")
      isOk = false;
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
      log(`OUTAGE ${e.message}`)
    }

  log("Ending");
  done();
}

module.exports = vodafoneLineJob;