const databaseClient = require('../db');
const fetch = require("node-fetch");

const jobName = "LAWA_WATER_QUALITY_JOB";
const tableName = "lawa_water_quality_status"

const log = (message) => console.log(jobName + ": " + message);

const lawaWaterQualityJob = async (job, done) => {
  log("Starting");

  const lawaWaterQualityResponse = await fetch("https://www.lawa.org.nz/umbraco/api/mapservice/swimsites");
  const lawaWaterQualityList = await lawaWaterQualityResponse.json();

  const results = []

  for (const waterQualityLocation of lawaWaterQualityList) {
    const state = waterQualityLocation.CssClass;

    // forget about nodata
    if (state === "nodata-weekly") {
      continue;
    }

    let waterQuality = null;

    if (state.includes("risk-high")) {
      waterQuality = 3

    }

    if (state.includes("risk-medium")) {
      waterQuality = 2
    }

    if (state.includes("risk-low")) {
      waterQuality = 1
    }

    if (waterQuality === null) {
      waterQuality = 1;
    }

    log(`${waterQualityLocation.Name}: Quality level ${waterQuality}`)

    const data = {
      name: waterQualityLocation.Name,
      lat: waterQualityLocation.Latitude,
      long: waterQualityLocation.Longitude,
      waterQuality: waterQuality
    }

    results.push(data);
  }

  const db = databaseClient.db("statuspage");
  const collection = db.collection(tableName);

  const model = {
    timestamp: new Date().getTime(),
    goodQualityCount: results.filter(r => r.waterQuality === 1).length,
    mediumQualityCount: results.filter(r => r.waterQuality === 2).length,
    badQualityCount: results.filter(r => r.waterQuality === 3).length,
    totalLocations: results.length,
    data: results
  }

  await collection.insertOne(model);


  done();

}

module.exports = lawaWaterQualityJob;

  // example object
  // {
  //   "Id": 37576,
  //   "Latitude": -43.805736,
  //   "Longitude": 172.966301,
  //   "Name": "Akaroa beach French Bay",
  //   "Url": "/explore-data/canterbury-region/swimming/akaroa-main-beach/swimsite",
  //   "EncodedPolygon": "",
  //   "Code": "ECAN-10041",
  //   "IsParent": false,
  //   "IsBackground": false,
  //   "IsLandCover": false,
  //   "ShowBorder": false,
  //   "Type": 3,
  //   "Elevation": null,
  //   "Landuse": null,
  //   "CssClass": "risk-low-overall",
  //   "Shape": null,
  //   "Attributes": null,
  //   "SiteType": "Coastal Site",
  //   "DataType": "",
  //   "HasScientificData": false,
  //   "HasEcologyData": false
  // },

