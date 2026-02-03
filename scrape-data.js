#!/usr/bin/env node

/**
 * BTP Data Scraper
 * Scarica dati reali da Borsa Italiana e Rendimenti.it
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Output path per dati JSON
const OUTPUT_PATH = path.join(__dirname, 'data', 'btp-data.json');

/**
 * Fetch HTML da URL
 */
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * Parse BTP da Borsa Italiana
 * Formato dati: IT0001086567,Btp-1nv26 7,25%,103.767,3.625,2026/11/01
 */
function parseBorsaItaliana(html) {
  const btps = [];
  const regex = /IT(\d{10})<\/a>[\s\S]*?Btp[\s\S]*?(\d+(?:\.\d+)?)[\s\S]*?(\d+(?:\.\d+)?)[\s\S]*?(\d{4}\/\d{2}\/\d{2})/g;

  let match;
  while ((match = regex.exec(html)) !== null) {
    const isin = `IT${match[1]}`;
    const description = match[0].match(/Btp[^<]*/)?.[0] || 'BTP';
    const price = parseFloat(match[2]);
    const coupon = parseFloat(match[3]);
    const expiry = match[4].replace(/\//g, '-');

    btps.push({
      isin,
      description,
      type: 'BTP',
      price,
      coupon,
      expiry,
      grossYield: calculateYield(price, coupon, expiry)
    });
  }

  return btps;
}

/**
 * Parse BOT da Rendimenti.it
 */
function parseRendimentiIT(html) {
  const bots = [];
  const regex = /IT(\d{10})[\s\S]*?Bot Zc[^<]*<[\s\S]*?(\d{4}-\d{2}-\d{2})[\s\S]*?(\d+(?:\.\d+)?)[\s\S]*?(\d+(?:\.\d+)?)%/g;

  let match;
  while ((match = regex.exec(html)) !== null) {
    const isin = `IT${match[1]}`;
    const description = `BOT Zc ${match[2].substring(0, 7)}`;
    const expiry = match[2];
    const price = parseFloat(match[3]);
    const netYield = parseFloat(match[4]);

    bots.push({
      isin,
      description,
      type: 'BOT',
      price,
      expiry,
      grossYield: netYield / 0.875, // Net to gross (12.5% tax)
      netYield
    });
  }

  return bots;
}

/**
 * Calcola rendimento lordo
 */
function calculateYield(price, coupon, expiry) {
  // Formula semplificata per rendimento lordo
  const years = Math.max(0.1, (new Date(expiry) - new Date()) / (365 * 24 * 60 * 60 * 1000));
  return ((coupon + (100 - price) / years) / price * 100).toFixed(2);
}

/**
 * Main scraping function
 */
async function scrapeData() {
  try {
    console.log('🔍 Scraping Borsa Italiana...');
    const borsaHTML = await fetchHTML('https://www.borsaitaliana.it/borsa/obbligazioni/mot/btp/lista.html?lang=en');
    const btps = parseBorsaItaliana(borsaHTML);
    console.log(`✅ Found ${btps.length} BTPs`);

    console.log('🔍 Scraping Rendimenti.it...');
    const rendimentiHTML = await fetchHTML('https://www.rendimenti.it/bot');
    const bots = parseRendimentiIT(rendimentiHTML);
    console.log(`✅ Found ${bots.length} BOTs`);

    const data = {
      lastUpdate: new Date().toISOString(),
      btps: btps.slice(0, 10), // Top 10
      bots: bots.slice(0, 10),  // Top 10
      summary: {
        totalBTPs: btps.length,
        totalBOTs: bots.length,
        avgYield: calculateAverageYield([...btps, ...bots])
      }
    };

    // Ensure data directory exists
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    // Write JSON
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2));
    console.log(`💾 Data saved to ${OUTPUT_PATH}`);

    return data;
  } catch (error) {
    console.error('❌ Error scraping data:', error.message);
    throw error;
  }
}

/**
 * Calculate average yield
 */
function calculateAverageYield(bonds) {
  if (bonds.length === 0) return 0;
  const total = bonds.reduce((sum, b) => sum + parseFloat(b.grossYield || 0), 0);
  return (total / bonds.length).toFixed(2);
}

// Run if called directly
if (require.main === module) {
  scrapeData().catch(console.error);
}

module.exports = { scrapeData };
