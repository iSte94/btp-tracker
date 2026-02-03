#!/usr/bin/env node

/**
 * BTP Data Scraper - Regex Version
 * Scraping con regex robuste
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = path.join(__dirname, 'data', 'btp-data.json');

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchHTML(res.headers.location);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseBOT(html) {
  const bots = [];

  // Pattern per BOT:
  // [IT0005689887](...)
  // Bot Zc Jan27 A Eur
  // 2027-01-14
  // 12
  // 98.067
  // 1.77%

  const botPattern = /\[IT(\d{10})\][^[]*?Bot Zc ([^(<]+)[^<]*<\/[^<]*<[^<]*?(\d{4}-\d{2}-\d{2})[^<]*<[^<]*?(\d+)[^<]*?(\d+\.\d+)[^<]*?(\d+\.\d+)%/gs;

  let match;
  while ((match = botPattern.exec(html)) !== null) {
    bots.push({
      isin: `IT${match[1]}`,
      description: `BOT Zc ${match[2].trim()}`,
      type: 'BOT',
      price: parseFloat(match[5]),
      expiry: match[3],
      grossYield: (parseFloat(match[6]) / 0.875).toFixed(2),
      netYield: parseFloat(match[6]).toFixed(2)
    });
  }

  return bots;
}

function parseBTP(html) {
  const btps = [];

  // Pattern per BTP da Borsa Italiana:
  // IT0001086567</a>
  // Btp-1nv26 7,25%
  // 103.767
  // 3.625
  // 2026/11/01

  const btpPattern = /IT(\d{10})[^<]*<\/a>[^<]*<[^<]*?(?:<[^>]*>)*([^<]+(?:Btp|BTP)[^<]*)[^<]*<[^<]*?(\d{2,3}\.\d{3})[^<]*<[^<]*?(\d+(?:\.\d+)?)[^<]*?(\d{4}\/\d{2}\/\d{2})/g;

  let match;
  while ((match = btpPattern.exec(html)) !== null) {
    const price = parseFloat(match[3]);
    const coupon = parseFloat(match[4]) || 0;
    const expiry = match[5].replace(/\//g, '-');

    btps.push({
      isin: `IT${match[1]}`,
      description: match[2].trim(),
      type: 'BTP',
      price: price,
      coupon: coupon,
      expiry: expiry,
      grossYield: calculateYield(price, coupon, expiry)
    });
  }

  return btps;
}

function calculateYield(price, coupon, expiry) {
  const years = Math.max(0.1, (new Date(expiry) - new Date()) / (365 * 24 * 60 * 60 * 1000));
  const grossYield = ((coupon + (100 - price) / years) / price * 100);
  return grossYield.toFixed(2);
}

async function scrapeData() {
  try {
    console.log('🔍 Scraping Rendimenti.it (BOT)...');
    const botHTML = await fetchHTML('https://www.rendimenti.it/bot');
    const bots = parseBOT(botHTML);
    console.log(`✅ Found ${bots.length} BOTs`);

    console.log('🔍 Scraping Borsa Italiana (BTP)...');
    const btpHTML = await fetchHTML('https://www.borsaitaliana.it/borsa/obbligazioni/mot/btp/lista.html?lang=en');
    const btps = parseBTP(btpHTML);
    console.log(`✅ Found ${btps.length} BTPs`);

    const allYields = [...btps.map(b => parseFloat(b.grossYield)), ...bots.map(b => parseFloat(b.grossYield))];
    const avgYield = allYields.length > 0 ? (allYields.reduce((a, b) => a + b, 0) / allYields.length).toFixed(2) : '0.00';

    const data = {
      lastUpdate: new Date().toISOString(),
      btps: btps,
      bots: bots,
      summary: {
        totalBTPs: btps.length,
        totalBOTs: bots.length,
        avgYield: avgYield
      }
    };

    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2));
    console.log(`💾 Data saved to ${OUTPUT_PATH}`);
    console.log(`📊 Summary: ${btps.length} BTPs, ${bots.length} BOTs, avg yield ${avgYield}%`);

    return data;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

if (require.main === module) {
  scrapeData().catch(console.error);
}

module.exports = { scrapeData };
