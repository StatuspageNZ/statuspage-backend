const databaseClient = require('../db');
const fetch = require("node-fetch");

const jobName = "METAWEATHER_WEATHER_JOB";
const tableName = "metaweather_weather_table"

const log = (message) => console.log(jobName + ": " + message);

const metaweatherWeatherJob = async (job, done) => {
  log("Starting");

  const weatherResponse = await fetch("https://www.metaweather.com/api/location/2348079/");
  const weatherObject = await weatherResponse.json();

  let todaysWeather = null;
  try {
    todaysWeather = weatherObject.consolidated_weather[0];
  }
  catch (e) {
    log("job failed, unable to find todays weather")
    done();
  }

  const db = databaseClient.db("statuspage");
  const collection = db.collection(tableName);

  const model = {
    timestamp: new Date().getTime(),
    ...todaysWeather
  }

  await collection.insertOne(model);

  log("Ending");
  done();
}

module.exports = metaweatherWeatherJob;


// {
//   "consolidated_weather": [
//     {
//       "id": 6170184643510272,
//       "weather_state_name": "Clear",
//       "weather_state_abbr": "c",
//       "wind_direction_compass": "SE",
//       "created": "2020-08-15T03:57:05.764824Z",
//       "applicable_date": "2020-08-15",
//       "min_temp": 6.66,
//       "max_temp": 14.46,
//       "the_temp": 14.27,
//       "wind_speed": 3.7652160616453245,
//       "wind_direction": 125.35469728952563,
//       "air_pressure": 1026.0,
//       "humidity": 62,
//       "visibility": 16.08139714069832,
//       "predictability": 68
//     },
//     {
//       "id": 4908635878588416,
//       "weather_state_name": "Light Cloud",
//       "weather_state_abbr": "lc",
//       "wind_direction_compass": "E",
//       "created": "2020-08-15T03:57:07.876639Z",
//       "applicable_date": "2020-08-16",
//       "min_temp": 5.37,
//       "max_temp": 14.024999999999999,
//       "the_temp": 12.625,
//       "wind_speed": 3.9684366685463566,
//       "wind_direction": 80.37088617984521,
//       "air_pressure": 1029.5,
//       "humidity": 61,
//       "visibility": 6.242294997216257,
//       "predictability": 70
//     },
//     {
//       "id": 6312365240877056,
//       "weather_state_name": "Showers",
//       "weather_state_abbr": "s",
//       "wind_direction_compass": "E",
//       "created": "2020-08-15T03:57:10.950083Z",
//       "applicable_date": "2020-08-17",
//       "min_temp": 7.584999999999999,
//       "max_temp": 14.16,
//       "the_temp": 13.454999999999998,
//       "wind_speed": 8.18707098284154,
//       "wind_direction": 79.0,
//       "air_pressure": 1029.0,
//       "humidity": 65,
//       "visibility": 15.062659071025212,
//       "predictability": 73
//     },
//     {
//       "id": 4696257832419328,
//       "weather_state_name": "Light Rain",
//       "weather_state_abbr": "lr",
//       "wind_direction_compass": "ENE",
//       "created": "2020-08-15T03:57:14.006568Z",
//       "applicable_date": "2020-08-18",
//       "min_temp": 10.82,
//       "max_temp": 14.855,
//       "the_temp": 14.440000000000001,
//       "wind_speed": 14.37736515724171,
//       "wind_direction": 57.490421462583114,
//       "air_pressure": 1023.5,
//       "humidity": 67,
//       "visibility": 12.32707239720035,
//       "predictability": 75
//     },
//     {
//       "id": 5019757453508608,
//       "weather_state_name": "Heavy Rain",
//       "weather_state_abbr": "hr",
//       "wind_direction_compass": "NE",
//       "created": "2020-08-15T03:57:16.957399Z",
//       "applicable_date": "2020-08-19",
//       "min_temp": 11.435,
//       "max_temp": 15.844999999999999,
//       "the_temp": 15.3,
//       "wind_speed": 15.296657560722712,
//       "wind_direction": 34.65587017290831,
//       "air_pressure": 1006.5,
//       "humidity": 86,
//       "visibility": 5.490125169012964,
//       "predictability": 77
//     },
//     {
//       "id": 5876053069266944,
//       "weather_state_name": "Heavy Rain",
//       "weather_state_abbr": "hr",
//       "wind_direction_compass": "N",
//       "created": "2020-08-15T03:57:20.329292Z",
//       "applicable_date": "2020-08-20",
//       "min_temp": 10.805,
//       "max_temp": 16.54,
//       "the_temp": 16.13,
//       "wind_speed": 5.660988228744134,
//       "wind_direction": 352.5,
//       "air_pressure": 1004.0,
//       "humidity": 76,
//       "visibility": 9.87731647180466,
//       "predictability": 77
//     }
//   ],
//   "time": "2020-08-15T16:01:07.243860+12:00",
//   "sun_rise": "2020-08-15T07:03:07.537100+12:00",
//   "sun_set": "2020-08-15T17:46:57.117573+12:00",
//   "timezone_name": "LMT",
//   "parent": {
//     "title": "New Zealand",
//     "location_type": "Country",
//     "woeid": 23424916,
//     "latt_long": "-43.586781,170.370987"
//   },
//   "sources": [
//     {
//       "title": "BBC",
//       "slug": "bbc",
//       "url": "http://www.bbc.co.uk/weather/",
//       "crawl_rate": 360
//     },
//     {
//       "title": "Forecast.io",
//       "slug": "forecast-io",
//       "url": "http://forecast.io/",
//       "crawl_rate": 480
//     },
//     {
//       "title": "Met Office",
//       "slug": "met-office",
//       "url": "http://www.metoffice.gov.uk/",
//       "crawl_rate": 180
//     },
//     {
//       "title": "OpenWeatherMap",
//       "slug": "openweathermap",
//       "url": "http://openweathermap.org/",
//       "crawl_rate": 360
//     },
//     {
//       "title": "Weather Underground",
//       "slug": "wunderground",
//       "url": "https://www.wunderground.com/?apiref=fc30dc3cd224e19b",
//       "crawl_rate": 720
//     },
//     {
//       "title": "World Weather Online",
//       "slug": "world-weather-online",
//       "url": "http://www.worldweatheronline.com/",
//       "crawl_rate": 360
//     }
//   ],
//   "title": "Auckland",
//   "location_type": "City",
//   "woeid": 2348079,
//   "latt_long": "-36.884109,174.770416",
//   "timezone": "Pacific/Auckland"
// }
