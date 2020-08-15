const databaseClient = require('../db');
const fetch = require("node-fetch");

const SUBURB_ADDRESS_MAPPING = {
  "torbay": {
    address: "100 Deep Creek Road, Torbay, North Shore, Auckland",
    vectorId: 1001371000
  },
  "rosedale": {
    address: "75 Apollo Drive, Rosedale, North Shore, Auckland",
    vectorId: 1002128113
  },
  "albany": {
    address: "210 Dairy Flat Highway, Albany, North Shore, Auckland",
    vectorId: 1002067056
  } ,
  "glenfield": {
    address: "272 Glenfield Road, Glenfield, North Shore, Auckland",
    vectorId: 1001404392
  },
  "takapuna": {
    address: "3 Hurstmere Road, Takapuna, North Shore, Auckland",
    vectorId: 1004564009
  },
  "hobsonville": {
    address: "118 Hobsonville Point Road, Hobsonville, Waitakere, Auckland",
    vectorId: 1004488757
  },
  "massey": {
    address: "2 Lincoln Park Avenue, Massey, Waitakere, Auckland",
    vectorId: 1001779097
  },
  "kumeu": {
    address: "1 Balthazar Road, Kumeu, Auckland",
    vectorId: 1007853337
  },
  "waitakere": {
    address: "1a Waitaki Street, Sunnyvale, Waitakere, Auckland",
    vectorId: 1007988254
  },
  "avondale": {
    address: "1 Avondale Road, Avondale, Auckland",
    vectorId: 1001823152
  },
  "mount-eden": {
    address: "40 Mount Eden Road, Mount Eden, Auckland",
    vectorId: 1001467582
  },
  "mount-roskill": {
    address: "1 Mount Roskill Road, Mount Roskill, Auckland",
    vectorId: 1007515970
  },
  "onehunga": {
    address: "1/2 Onehunga Harbour Road, Onehunga, Auckland",
    vectorId: 1002165172
  },
  "remuera": {
    address: "15c Remuera Road, Remuera, Auckland",
    vectorId: 1008046128
  },
  "cbd": {
    address: "1 Emily Place, Auckland Central, Auckland",
    vectorId: 1002950617
  },
  "mount-wellington": {
    address: "1 Mount Wellington Highway, Mount Wellington, Auckland",
    vectorId: 1001528413
  },
  "mangere": {
    address: "1a Bader Drive, Mangere, Manukau, Auckland",
    vectorId: 1001600998
  },
  "east-tamaki": {
    address: "318 East Tamaki Road, East Tamaki, Manukau, Auckland",
    vectorId: 1008153324
  },
  "howick": {
    address: "73 Ridge Road, Howick, Manukau, Auckland",
    vectorId: 1001523859
  },
  "takanini": {
    address: "172 Great South Road, Takanini, Papakura, Auckland",
    vectorId: 1001854112
  },
  "botany": {
    address: "48 Burnaston Court, Dannemora, Manukau, Auckland",
    vectorId: 1001846110
  }
}

const vectorApiKey = "o2AGN2LXeYbNvyE5cytNGX9INtcPLfj7"

const jobName = "VECTOR_POWER_JOB";
const tableName = "vector_power_status"
const vectorApiUrl = "https://api.vector.co.nz/outagereporter/outagereporter/address?address="
const waitTimeMs = 1000;

const log = (message) => console.log(jobName + ": " + message);

const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

const vectorPowerJob = async (job, done) => {
  log("Starting");

  const results = []

  for (const [key, value] of Object.entries(SUBURB_ADDRESS_MAPPING)) {
    const suburb = key;
    const { vectorId, address } = value;

    log(`Starting ${suburb}`)

    const vectorApiResponse = await fetch(vectorApiUrl + vectorId.toString(), {
      headers: {
        "Accept": "application/json",
        "apikey": vectorApiKey
      }
    });
    const vectorOutage = await vectorApiResponse.json();
  
    const eventType = vectorOutage["eventType"];
  
    const eventTypeMapping = {
      [undefined]: false,
      [null]: false,
      "UNKNOWN": true,
      "Planned": false,
      "UnPlanned": false
    }
  
    const hasPower = eventTypeMapping[eventType];

    log(`${suburb}: has power ${hasPower}`);

    const model = {
      vectorId: vectorId,
      address: address,
      suburb: suburb,
      hasPower: hasPower,
      timestamp: new Date().getTime(),
    }

    results.push(model);

    // lets try not get rate limited
    await snooze(waitTimeMs);
  }


  const db = databaseClient.db("statuspage");
  const collection = db.collection(tableName);

  const model = {
    timestamp: new Date().getTime(),
    suburbsChecked: results.length,
    suburbsOk: results.filter(r => r.hasPower).length,
    suburbsNotOk: results.filter(r => !r.hasPower).length,
    data: results
  }

  await collection.insertOne(model);

  log("Ending");
  done();
}

module.exports = vectorPowerJob;

// No outages = eventType: unknown
// {
//   "id":"1001392238",
//   "address":{
//      "street":"17 Frater Avenue",
//      "suburb":"Milford",
//      "hasAvailableProducts":true
//   },
//   "eventType":"UNKNOWN",
//   "etrStart":null,
//   "etrEnd":null,
//   "outageStart":null,
//   "workStatus":null,
//   "outageResolvedFlag":"",
//   "transformerLongitude":"",
//   "transformerLatitude":"",
//   "outageId":"",
//   "updatedAt":null,
//   "subscription":null,
//   "progressionStatus":null
// }

// Unplanned outage
// {
//   id: "0123456789",
//   address: {
//     street: "101 CARLTON GORE ROAD",
//     suburb: "Newmarket",
//     hasAvailableProducts: true,
//   },
//   eventType: "UnPlanned",
//   etrStart: "2019-01-15T21:15:00Z",
//   etrEnd: "2019-01-15T22:15:00Z",
//   outageStart: "2019-01-14T22:01:33.859Z",
//   workStatus: [
//     {
//       label: "Outage reported",
//       type: "REPORTED",
//       complete: true,
//       active: false,
//     },
//     {
//       label: "Outage processed",
//       type: "START",
//       complete: true,
//       active: false,
//     },
//     {
//       label: "On our way",
//       type: "ENROUTE",
//       complete: true,
//       active: false,
//     },
//     {
//       label: "Resolving",
//       type: "WORKING",
//       complete: true,
//       active: false,
//     },
//     {
//       label: "Outage resolved",
//       type: "RESOLVED",
//       complete: true,
//       active: false,
//     },
//   ],
//   outageResolvedFlag: "",
//   transformerLongitude: "",
//   transformerLatitude: "",
//   outageId: "1-1HM3PRE",
//   subscription: null,
// }

// unplanned resolved have this field
// "progressionStatus":"RESOLVED"

// planned outage
// {
// id: "0123456789",
//   address: {
//     street: "60 Access Road",
//     suburb: "Kumeu",
//     hasAvailableProducts: true,
//   },
//   eventType: "Planned",
//   etrStart: "2019-02-01T02:30:00Z",
//   etrEnd: "2019-02-01T03:30:00Z",
//   outageStart: "2019-01-30T19:37:00Z",
//   workStatus: [
//     { label: "Work starts", type: "START", complete: true, active: false },
//     {
//       label: "Planned maintenance",
//       type: "WORKING",
//       complete: false,
//       active: true,
//     },
//     {
//       label: "Work finishes",
//       type: "RESOLVED",
//       complete: false,
//       active: false,
//     },
//   ],
//   outageResolvedFlag: "",
//   transformerLongitude: "",
//   transformerLatitude: "",
//   outageId: "12343",
//   subscription: null,
// }