const Queue = require('bull');

const testJob = require("./jobs/testJob");
const sparkMobileInternetJob = require("./jobs/sparkMobileInternetJob"); 
const alertLevelJob = require("./jobs/alertLevelJob"); 

const redisConnection = process.env.REDIS_CONNECTION || "redis://localhost:6379";

// run every minute
const defaultCron = "1 * * * * *";

function createScheduledJobs() {
  createBackgroundJob("test", testJob);
  createBackgroundJob("sparkMobileInternet", sparkMobileInternetJob);
  createBackgroundJob("alertLevel", alertLevelJob);
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