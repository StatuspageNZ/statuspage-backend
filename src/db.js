const { MongoClient } = require("mongodb");
const databaseClient = new MongoClient(process.env.MONGODB_CONNECTION || "mongodb://test:test@localhost:27017", { useUnifiedTopology: true });

module.exports = databaseClient;