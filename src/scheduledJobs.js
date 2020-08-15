const Queue = require('bull');

const testJob = require("./jobs/testJob");
const sparkMobileInternetJob = require("./jobs/sparkMobileInternetJob"); 
const sparkLandlineInternetJob = require("./jobs/sparkLandlineInternetJob"); 
const vodafoneMobileJob = require("./jobs/vodafoneMobileJob");
const vodafoneLineJob = require("./jobs/vodafoneLineJob");
const alertLevelJob = require("./jobs/alertLevelJob"); 
const watercareWaterUtilityJob = require("./jobs/watercareWaterUtilityJob"); 
const watercareAverageDamLevelJob = require('./jobs/damLevelJob');
const vectorPowerJob = require("./jobs/vectorPowerJob");
const icuBedsJob = require('./jobs/icuBedsScrapper');

const redisConnection = process.env.REDIS_CONNECTION || "redis://localhost:6379";

// run every minute
const defaultCron = "1 * * * * *";

function createScheduledJobs() {
  createBackgroundJob("test", testJob);
  createBackgroundJob("sparkMobileInternet", sparkMobileInternetJob);
  createBackgroundJob("sparkLandlineInternet", sparkLandlineInternetJob);
  createBackgroundJob("vodafoneMobile", vodafoneMobileJob);
  createBackgroundJob("vodafoneLine", vodafoneLineJob);
  createBackgroundJob("alertLevel", alertLevelJob);
  createBackgroundJob("watercareWaterUtility", watercareWaterUtilityJob);
  createBackgroundJob('watercareAveragedamLevel', watercareAverageDamLevelJob, '0 1 * * *') // Run once a day at 1pm
  createBackgroundJob('icuBedsJob', icuBedsJob, '0 * * * *') // every hour
  // every 10 minutes
  createBackgroundJob("vectorPower", vectorPowerJob, "*/10 * * * *");
}

function createBackgroundJob(jobName, jobFunction, cron = null) {
  // make a queue for each background job
  // set the job to process on a cron schedule
  // every one minute add blank data to the queue to schedule the job
  const queue = new Queue(jobName, redisConnection);
  queue.process(jobFunction);
  queue.add({}, {repeat: {cron: cron || defaultCron }});
}

module.exports.createScheduledJobs = createScheduledJobs;