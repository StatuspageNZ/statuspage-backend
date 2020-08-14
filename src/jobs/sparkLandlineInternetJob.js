const databaseClient = require('../db');
const cheerio = require('cheerio');
const fetch = require("node-fetch");


const elementSelctor = "div.no-outage-div.text-center.no-outage-Internet";
const jobName = "SPARK_LANDLINE_INTERNET_JOB";
const tableName = "spark_landline_internet_status"

const log = (message) => console.log(jobName + ": " + message);

const sparkMobileInternetJob = async (job, done) => {
  log("Starting");

  const sparkPageResponse = await fetch("https://www.spark.co.nz/outages/");
  const sparkPageHtml = await sparkPageResponse.text();

  const sparkPageCheerio = cheerio.load(sparkPageHtml);
  const elements = sparkPageCheerio(elementSelctor);

  let isOk = null;
  if (elements.length === 0) {
    log("Landline internet Outage")
    isOk = false;
  } else {
    log("Landline internet OK")
    isOk = true;
  }

  const db = databaseClient.db("statuspage");
  const collection = db.collection(tableName);

  const model = {
    timestamp: new Date().getTime(),
    isOk: isOk
  }

  await collection.insertOne(model);

  log("Ending");
  done();
}

module.exports = sparkMobileInternetJob;