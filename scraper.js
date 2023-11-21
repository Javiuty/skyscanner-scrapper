import puppeteer from 'puppeteer'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const pathToData = path.join(__dirname, 'flights.json')

const saveFlightsData = async (url) => {
  const browser = await puppeteer.launch({ headless: 'new' })
  const page = await browser.newPage()

  const ua = 'Mozilla/8.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36'

  await page.setUserAgent(ua)

  await page.goto(url)

  const cookieButton = await page.$('.RxNS-button-content')

  if (cookieButton) {
    await page.waitForSelector(cookieButton)

    await page.click(cookieButton)
  }

  // wait till spinner price stop for fair price
  await new Promise((r) => setTimeout(r, 10000));

  const scrapeData = await page.evaluate(() => {
    const price = document.querySelector('.f8F1-price-text').textContent
    const company = document.querySelector('.J0g6-operator-text').textContent

    return { company, price, timestamp: Date.now() }
  })

  await browser.close()



  return scrapeData
}


saveFlightsData('https://www.kayak.es/flights/MAD-SAW/2024-04-29/2024-05-04?sort=price_a').then((scrapeData) => {
  fs.readFile('flights.json', 'utf8', (err, readObj) => {
    if (err) return `Error reading file from disk: ${err}`

    const jsonParsed = JSON.parse(readObj)
    jsonParsed.data0.info.push(scrapeData)

    fs.writeFile(path.resolve(pathToData), JSON.stringify(jsonParsed, null, 2), (err) => {
      if (err) return `Error writing file ${err}`
    })
  })

  return 'Data created correctly ✅'
})

saveFlightsData('https://www.kayak.es/flights/MAD-SAW/2024-04-30/2024-05-06?sort=price_a').then((scrapeData) => {
  fs.readFile('flights.json', 'utf8', (err, readObj) => {
    if (err) return `Error reading file from disk: ${err}`

    const jsonParsed = JSON.parse(readObj)
    jsonParsed.data1.info.push(scrapeData)

    fs.writeFile(path.resolve(pathToData), JSON.stringify(jsonParsed, null, 2), (err) => {
      if (err) return `Error writing file ${err}`
    })
  })

  return 'Data created correctly ✅'
})