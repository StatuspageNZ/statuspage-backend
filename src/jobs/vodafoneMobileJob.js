const databaseClient = require('../db');
const cheerio = require('cheerio');
const rp = require('request-promise')

const elementSelctor = ".status-indicator.active";
const jobName = "VODAFONE_MOBILE_JOB";
const tableName = "vodafone_mobile_status"

const log = (message) => console.log(jobName + ": " + message);

const vodafoneMobileJob = async (job, done) => {
  log("Starting");

  try {
    const site = await rp({ url: "https://www.vodafone.co.nz/help/network-status/", insecureHTTPParser: true })
    const statusIndicator = cheerio(elementSelctor, site).first()
    console.log(statusIndicator.attr('class'))
    const mobileStatus = statusIndicator.attr('class')

    let isOk = null;
    if (mobileStatus === "status-indicator status2 active" || mobileStatus === "status-indicator status1 active") {
      log("Mobile OK")
      isOk = true;
    } else {
      log("Mobile Outage")
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

module.exports = vodafoneMobileJob;