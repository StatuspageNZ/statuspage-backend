const databaseClient = require("../db");

const tableName = "watercare_water_utility_status";

async function getWaterCareOutage() {
  const db = databaseClient.db("statuspage");
  const collection = db.collection(tableName);
  const cursor = await collection.find().sort({ timestamp: -1}).limit(1);
  const results = await cursor.toArray();
  const result = results.length > 0 ? results[0] : null;
  return result;
}

async function getLatestRecordFromCollection(collectionName) {
  const db = databaseClient.db("statuspage");
  const collection = db.collection(collectionName);
  const cursor = await collection.find().sort({ timestamp: -1}).limit(1);
  const results = await cursor.toArray();
  const result = results.length > 0 ? results[0] : null;
  return result;
}


module.exports = { 
  getWaterCareOutage,
  getLatestRecordFromCollection
}