const $ = require('cheerio')
const fetch = require('node-fetch');
const rp = require('request-promise')

async function getAlertLevelJob() {
  const text = await rp({ url: "https://covid19.govt.nz/covid-19/current-alert-level/", insecureHTTPParser: true })
  const $covidblocks = $('.covid19__app__blocks__messageblock', text)

  const locations = {}
  $covidblocks.each((i, covidblock) => {
    const location = $(covidblock).find('h2').text()
    const firstParagraph = $(covidblock).find('p:first-child').text()
    const alertLevelMatch = firstParagraph.match(/Alert Level \d/)
    const alertLevel = alertLevelMatch ? alertLevelMatch[0] : null
    locations[location] = alertLevel
  })
  return locations
}

async function main() {
  console.log(await getAlertLevelJob())
}
main()
