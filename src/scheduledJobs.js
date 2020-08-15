const Queue = require('bull');

const testJob = require("./jobs/testJob");
const sparkMobileInternetJob = require("./jobs/sparkMobileInternetJob"); 
const sparkLandlineInternetJob = require("./jobs/sparkLandlineInternetJob"); 
const alertLevelJob = require("./jobs/alertLevelJob"); 
const watercareWaterUtilityJob = require("./jobs/watercareWaterUtilityJob"); 
const watercareAverageDamLevelJob = require('./jobs/damLevelJob');

const redisConnection = process.env.REDIS_CONNECTION || "redis://localhost:6379";

// run every minute
const defaultCron = "1 * * * * *";

function createScheduledJobs() {
  createBackgroundJob("test", testJob);
  createBackgroundJob("sparkMobileInternet", sparkMobileInternetJob);
  createBackgroundJob("sparkLandlineInternet", sparkLandlineInternetJob);
  createBackgroundJob("alertLevel", alertLevelJob);
  createBackgroundJob("watercareWaterUtility", watercareWaterUtilityJob);
  createBackgroundJob('watercareAveragedamLevel', watercareAverageDamLevelJob, '0 1 * * *') // Run once a day at 1pm
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