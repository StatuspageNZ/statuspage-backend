const databaseClient = require('../db');
const rp = require('request-promise')
const $ = require('cheerio')

const jobName = "ICU_BED_SCRAPPER";
const tableName = "icu_bed"

const log = (message) => console.log(jobName + ": " + message);

const icuBedScrapperJob = async (job, done) => {
  log("Starting");
  const text = await rp({ url: "https://www.health.govt.nz/news-media/news-items/covid-19-novel-coronavirus-update-25-february", insecureHTTPParser: true })
  const content = $.load(text)
  const totalICU = content('table > tbody > tr:nth-child(25) > td:nth-child(2)').text()
  const totalHDU = content('table > tbody > tr:nth-child(25) > td:nth-child(3)').text()

  const icuBeds = { totalICU, totalHDU}
  const db = databaseClient.db("statuspage");
  const collection = db.collection(tableName);
  await collection.insertOne(icuBeds);
  log("Ending");
  done();
}

module.exports = icuBedScrapperJob;