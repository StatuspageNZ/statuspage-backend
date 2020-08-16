const databaseClient = require('../db');

// use cookie jar
const request = require("request-promise").defaults({ jar: true });

const jobName = "COUNTDOWN_JOB";
const tableName = "countdown_table"

const log = (message) => console.log(jobName + ": " + message);

function randomString(length) {
  const chars = "0123456789abcdef"
  let result = '';
  for (var i = length; i > 0; --i) { 
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}

const countdownJob = async (job, done) => {
  log("Starting");

  // just load the countdown page which will set the right cookies into the cookiejar
  // allowing us to all their API
  await request({
    method: "GET",
    uri: "https://shop.countdown.co.nz/"
  });

  const tpResponse = await request({
    method: "GET",
    uri: "https://shop.countdown.co.nz/api/v1/products?dasFilter=Department%3B%3Bhousehold%3Bfalse&dasFilter=Aisle%3B%3Bbathroom%3Bfalse&dasFilter=Shelf%3B%3Btoilet-paper%3Bfalse&target=browse",
    headers: {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "cache-control": "no-cache",
      "content-type": "application/json",
      "expires": "Sat, 01 Jan 2000 00:00:00 GMT",
      "pragma": "no-cache",
      "request-id": "|" + randomString(32) + "." + randomString(16),
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "OnlineShopping.WebApp",
    }
  });

  const tpProducts = JSON.parse(tpResponse);

  const numProducts = tpProducts.dasFacets.length > 0 ? tpProducts.dasFacets[0].productCount : 0;

  const model = {
    timestamp: new Date().getTime(),
    productName: "Toilet Paper", 
    isOk: numProducts > 0
  };

  log(JSON.stringify(model));


  const db = databaseClient.db("statuspage");
  const collection = db.collection(tableName);

  await collection.insertOne(model);

  log("Ending");
  done();
}

module.exports = countdownJob;


