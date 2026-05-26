const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://power-local.preview.emergentagent.com/', {
        waitUntil: 'networkidle0',
    });
    const html = await page.content();
    const fs = require('fs');
    fs.writeFileSync('preview_html.txt', html);
    await browser.close();
})();
