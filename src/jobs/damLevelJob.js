const databaseClient = require('../db');
const fetch = require("node-fetch");

const jobName = "WATERCARE_DAM_LEVEL";
const tableName = "watercare_dam_level"

const log = (message) => console.log(jobName + ": " + message);

const TOTAL_VOLUME_ALL_DAM = 95.39	 //gigalitres

const averageDamLevelJob = async (job, done) => {
  log("Starting");
  const lakeNamesRequest = await fetch('https://api.watercare.co.nz/lake/lakenames')
  const lakeNames = Object.keys(await lakeNamesRequest.json())
  let percentages = 0
  for(const lake of lakeNames) {
      const damLevelRequest = await fetch(`https://api.watercare.co.nz/lake/lakelevel/${lake}`)
      const damLevels = await damLevelRequest.json()
      const { percentage } = damLevels[damLevels.length - 1]
      percentages += percentage
  }
  const averageDamPercentage = percentages / (lakeNames.length)
  
  const db = databaseClient.db("statuspage");
  const collection = db.collection(tableName);
  const model = {
    timestamp: new Date().getTime(),
    averageDamPercentage
  }
  await collection.insertOne(model);

  log("Ending");
  done();
}

averageDamLevelJob(null, () => {});
module.exports = averageDamLevelJob;