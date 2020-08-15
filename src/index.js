require('dotenv').config();

const hapi = require('@hapi/hapi');
const databaseClient = require('./db');
const { createScheduledJobs } = require('./scheduledJobs');

// port for web server
const port = process.env.PORT || 5000;

async function run() {
  await databaseClient.connect();

  const db = databaseClient.db("statuspage");
  const testCollection = db.collection("test");

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

  server.route({
    method: 'GET',
    path:'/test',
    handler: async (request, h) => {
      const testCollectionCursor = await testCollection.find({}).sort({ id: -1}).limit(1);
      const testObjects = await testCollectionCursor.toArray();
      return testObjects;
    }
  });

  server.route({
    method: 'POST',
    path:'/test',
    handler: async (request, h) => {
      const testPayload = request.payload.payload;

      const testObject = {
        testData: testPayload
      }

      await testCollection.insertOne(testObject);

      return {success: true}
    }
  });

  await server.start();
  console.log(`Server running on port ${port}`);
}

run()
createScheduledJobs()