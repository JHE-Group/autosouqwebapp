import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await b.newPage();
await p.goto('http://localhost:3050/ar/used-cars', { waitUntil: 'networkidle' });
console.log('TITLE:', await p.title());
console.log('CARDS:', await p.locator('a[href*="/car/"]').count());
await b.close();
