const puppeteer = require('puppeteer');
const fs = require('fs');
const path= require('path');
const PRODUCT_URL = 'https://www.emag.ro/telefon-mobil-apple-iphone-17-256gb-5g-black-mg6j4zd-a/pd/DGX9FV3BM/?ref=fam#Negru';
const PRICE_SELECTOR = '.product-new-price';
const CSV_FILE='prices.csv';

async function scrapePrice() {
    console.log('A inceput proceseul de scraping...');
    const browser = await puppeteer.launch({
        headless: true,
    });
    const page = await browser.newPage();
    try{
        await page.goto(PRODUCT_URL, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        await page.waitForSelector(PRICE_SELECTOR, {visible: true});
        let priceText = await page.$eval(PRICE_SELECTOR, el => el.textContent.trim());
        priceText = priceText.replace(/\./g, '');
        priceText = priceText.replace(',', '.');
        priceText = priceText.replace(/[^\d.]/g, '');
        const extractedPrice = parseFloat(priceText).toFixed(2);

        if(isNaN(extractedPrice)){
            throw new Error(`Pretul extras nu este un numar valid.`);
        }

        console.log(`Pretul extras: ${extractedPrice}`);

        const now = new Date();
        const dateString = now.toLocaleString('ro-RO')
        await saveToCsv(dateString, extractedPrice);
    }
    catch(error){
        console.error('Eroare la extragerea pretului:', error);
    } finally {
        await browser.close();
        console.log('Browserul a fost inchis.');
    }
}

async function saveToCsv(date, price) {
    const csvPath = path.join(__dirname, CSV_FILE);
    const dataRow = `${date},${price}\n`;
    const header = 'Data/Ora, Pret\n';

    const fileExists = fs.existsSync(csvPath);
    if (!fileExists) {
        fs.writeFileSync(csvPath, header + dataRow, 'utf8');
        console.log('Fisierul CSV a fost creat si datele au fost salvate.');
    }
    else {
        fs.appendFileSync(csvPath, dataRow, 'utf8');
        console.log('Datele au fost adaugate in fisierul CSV existent.');
    }
}

scrapePrice();