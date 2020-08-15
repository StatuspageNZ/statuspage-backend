require('dotenv').config();

const hapi = require('@hapi/hapi');
const databaseClient = require('./db');
const { createScheduledJobs } = require('./scheduledJobs');

const sparkLandlineDataQuery = require("./queries/sparkLandlineDataQuery");
const { getWaterCareOutage, getLatestRecordFromCollection } = require('./queries/waterCareQuery');

// port for web server
const port = process.env.PORT || 5000;

async function run() {
  await databaseClient.connect();

  const server = hapi.server({
    port: port,
    routes: {
      cors: true
    }
  });

  server.route({
    method: 'GET',
    path:'/',
    handler: async (request, h) => {
      return {hello: "world"};
    }
  });

  // jumbo controller
  // this is gonna be slow AF
  server.route({
    method: 'GET',
    path:'/data',
    handler: async (request, h) => {
      const sparkLandlineData = await sparkLandlineDataQuery();
      const damWaterLevel = await getWaterCareOutage();
      const waterCareOutatage = await getLatestRecordFromCollection('watercare_water_utility_status')
      const vodaphoneMobileStatus = await getLatestRecordFromCollection('vodafone_mobile_status');
      const vodaphoneLineStatus = await getLatestRecordFromCollection('vodafone_line_status');
      const vectorPowerStatus = await getLatestRecordFromCollection('vodafone_mobile_status');
      const sparkMobileStatus = await getLatestRecordFromCollection('spark_mobile_internet_status');
      const sparkLandlineStatus = await getLatestRecordFromCollection('spark_landline_internet_status');
      const earthQuakeStaus = await getLatestRecordFromCollection('quake_status');
      const icuBedsTotal = await getLatestRecordFromCollection('icu_bed');
      const alertLevelStatus = await getLatestRecordFromCollection('alert_level_status');

 
      return {
        sparkLandline: sparkLandlineData,
        damWaterLevel,
        waterCareOutatage,
        vodaphoneMobileStatus,
        vodaphoneLineStatus,
        vectorPowerStatus,
        sparkMobileStatus,
        sparkLandlineStatus,
        earthQuakeStaus,
        icuBedsTotal,
        alertLevelStatus
      };
    }
  });

  await server.start();
  console.log(`Server running on port ${port}`);
}

run()
createScheduledJobs()