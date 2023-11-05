import puppeteer from 'puppeteer'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const pathToData = path.join(__dirname, 'flights.json')

const saveFlightsData = async () => {
  const browser = await puppeteer.launch({ dumpio: true })
  const page = await browser.newPage()

  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36'

  await page.setUserAgent(ua)

  await page.goto('https://www.skyscanner.es/transport/flights/mad/ista/240429/240504/?adultsv2=2&cabinclass=economy&childrenv2=&inboundaltsenabled=false&outboundaltsenabled=false&preferdirects=true&rtn=1')

  await page.waitForSelector('.CookieBanner_cookie-banner__buttons__ZjAzY button')

  await page.click('.CookieBanner_cookie-banner__buttons__ZjAzY button')

  // wait till spinner price stop for fair price
  await page.waitForTimeout(10000)


  const scrapeData = await page.evaluate(() => {
    const price = document.querySelector('.Price_mainPriceContainer__MDM3O span').textContent
    const company = document.querySelector('.BpkImage_bpk-image__img__MDZkN').alt

    return { company, price, timestamp: Date.now() }
  })

  await browser.close()



  return scrapeData
}


saveFlightsData().then((scrapeData) => {
  fs.readFile('flights.json', 'utf8', (err, readObj) => {
    if (err) return `Error reading file from disk: ${err}`

    const jsonParsed = JSON.parse(readObj)
    jsonParsed.data.info.push(scrapeData)

    fs.writeFile('flights.json', JSON.stringify(jsonParsed, null, 2), (err) => {
      if (err) return `Error writing file ${err}`
    })
  })

  return 'Data created correctly ✅'
})