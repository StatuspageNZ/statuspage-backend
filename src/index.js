require('dotenv').config();

const hapi = require('@hapi/hapi');
const databaseClient = require('./db');
const { createScheduledJobs } = require('./scheduledJobs');

const sparkLandlineDataQuery = require("./queries/sparkLandlineDataQuery");

// port for web server
const port = process.env.PORT || 5000;

async function run() {
  await databaseClient.connect();

  const db = databaseClient.db("statuspage");

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
  server.route({
    method: 'GET',
    path:'/data',
    handler: async (request, h) => {
      const sparkLandlineData = await sparkLandlineDataQuery();

      return {
        sparkLandline: sparkLandlineData
      };
    }
  });

  await server.start();
  console.log(`Server running on port ${port}`);
}

run()
createScheduledJobs()