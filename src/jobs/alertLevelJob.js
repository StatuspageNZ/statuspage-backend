const databaseClient = require('../db');
const $ = require('cheerio')
const rp = require('request-promise')


const jobName = "ALERT_LEVEL_JOB";

const log = (message) => console.log(jobName + ": " + message);

async function getAlertLevelJob() {
  try {
    const text = await rp({ url: "https://covid19.govt.nz/covid-19/current-alert-level/", insecureHTTPParser: true })
    const $covidblocks = $('.covid19__app__blocks__messageblock', text)

    const locations = {}
    $covidblocks.each((i, covidblock) => {
      const location = $(covidblock).find('h2').text()
      const firstParagraph = $(covidblock).find('p:first-child').text()
      const alertLevelMatch = firstParagraph.match(/Alert Level \d/)
      const alertLevel = alertLevelMatch ? alertLevelMatch[0] : null
      if (alertLevel) {
        log(`OK for ${location} (${alertLevel})`)
      }
      else {
        log('CAN NOT MATCH ALERT LEVEL')
      }
      locations[location] = alertLevel
    })

    const db = databaseClient.db("statuspage");
    const collection = db.collection("alert_level_status");
    await collection.insertOne(locations);
    log("ENDING");
  }
  catch (e) {
    log(`OUTAGE ${e.message}`)
  }
}

async function job(jobe, done) {
  await getAlertLevelJob()
  done()
}

module.exports = job;
