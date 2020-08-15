const databaseClient = require("../db");

const tableName = "spark_landline_internet_status";

const query = async () => {
  const db = databaseClient.db("statuspage");
  const collection = db.collection(tableName);
  const cursor = await collection.find({}).sort({ timestamp: -1}).limit(1);
  const results = await cursor.toArray();
  const result = results.length > 0 ? results[0] : null;
  return result;
}

module.exports = query;