#!/usr/bin/env node

/**
 * BTP Data Scraper - Improved Version
 * Scarica dati reali da Borsa Italiana e Rendimenti.it
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Output path per dati JSON
const OUTPUT_PATH = path.join(__dirname, 'data', 'btp-data.json');

/**
 * Fetch HTML da URL (HTTP o HTTPS)
 */
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchHTML(res.headers.location);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * Parse BTP da Borsa Italiana
 * Estrae ISIN, descrizione, prezzo, coupon, scadenza
 */
function parseBorsaItaliana(html) {
  const btps = [];
  const lines = html.split('\n');

  let currentISIN = null;
  let currentDesc = null;
  let currentPrice = null;
  let currentCoupon = null;
  let currentExpiry = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Extract ISIN
    const isinMatch = line.match(/>(IT\d{10})</);
    if (isinMatch && line.includes('/borsa/obbligazioni/mot/btp/')) {
      currentISIN = isinMatch[1];
      continue;
    }

    // Extract description
    if (currentISIN && !currentDesc) {
      const descMatch = line.match(/>(Btp[^<]+)</);
      if (descMatch) {
        currentDesc = descMatch[1].trim();
        continue;
      }
    }

    // Extract price
    if (currentDesc && currentPrice === null) {
      const priceMatch = line.match(/>(\d{2,3}\.\d{3})</);
      if (priceMatch) {
        currentPrice = parseFloat(priceMatch[1]);
        continue;
      }
    }

    // Extract coupon
    if (currentPrice !== null && currentCoupon === null) {
      const couponMatch = line.match(/>(\d+(?:\.\d+)?)</);
      if (couponMatch) {
        currentCoupon = parseFloat(couponMatch[1]);
        continue;
      }
    }

    // Extract expiry
    if (currentCoupon !== null && !currentExpiry) {
      const expiryMatch = line.match(/>(\d{4}\/\d{2}\/\d{2})</);
      if (expiryMatch) {
        currentExpiry = expiryMatch[1].replace(/\//g, '-');

        // Add BTP to list
        if (currentISIN && currentDesc && currentPrice !== null) {
          btps.push({
            isin: currentISIN,
            description: currentDesc,
            type: 'BTP',
            price: currentPrice,
            coupon: currentCoupon || 0,
            expiry: currentExpiry,
            grossYield: calculateYield(currentPrice, currentCoupon || 0, currentExpiry)
          });
        }

        // Reset for next BTP
        currentISIN = null;
        currentDesc = null;
        currentPrice = null;
        currentCoupon = null;
        currentExpiry = null;
      }
    }
  }

  return btps;
}

/**
 * Parse BOT da Rendimenti.it
 */
function parseRendimentiIT(html) {
  const bots = [];
  const lines = html.split('\n');

  let currentISIN = null;
  let currentDesc = null;
  let currentExpiry = null;
  let currentPrice = null;
  let currentNetYield = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Extract ISIN
    const isinMatch = line.match(/>(IT\d{10})</);
    if (isinMatch) {
      currentISIN = isinMatch[1];
      continue;
    }

    // Extract description
    if (currentISIN && !currentDesc) {
      const descMatch = line.match(/>(Bot Zc[^<]+)</i);
      if (descMatch) {
        currentDesc = descMatch[1].trim();
        continue;
      }
    }

    // Extract expiry
    if (currentDesc && !currentExpiry) {
      const expiryMatch = line.match(/>(\d{4}-\d{2}-\d{2})</);
      if (expiryMatch) {
        currentExpiry = expiryMatch[1];
        continue;
      }
    }

    // Extract price
    if (currentExpiry && currentPrice === null) {
      const priceMatch = line.match(/>(\d{2,3}(?:\.\d+)?)</);
      if (priceMatch) {
        currentPrice = parseFloat(priceMatch[1]);
        continue;
      }
    }

    // Extract net yield
    if (currentPrice !== null && currentNetYield === null) {
      const yieldMatch = line.match(/>(\d+(?:\.\d+)?)%</);
      if (yieldMatch) {
        currentNetYield = parseFloat(yieldMatch[1]);

        // Add BOT to list
        if (currentISIN && currentDesc && currentPrice !== null) {
          bots.push({
            isin: currentISIN,
            description: currentDesc,
            type: 'BOT',
            price: currentPrice,
            expiry: currentExpiry,
            grossYield: (currentNetYield / 0.875).toFixed(2), // Net to gross
            netYield: currentNetYield.toFixed(2)
          });
        }

        // Reset for next BOT
        currentISIN = null;
        currentDesc = null;
        currentExpiry = null;
        currentPrice = null;
        currentNetYield = null;
      }
    }
  }

  return bots;
}

/**
 * Calcola rendimento lordo (formula semplificata)
 */
function calculateYield(price, coupon, expiry) {
  const years = Math.max(0.1, (new Date(expiry) - new Date()) / (365 * 24 * 60 * 60 * 1000));
  const grossYield = ((coupon + (100 - price) / years) / price * 100);
  return grossYield.toFixed(2);
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

    // Ensure data directory exists
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write JSON
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2));
    console.log(`💾 Data saved to ${OUTPUT_PATH}`);
    console.log(`📊 Summary: ${btps.length} BTPs, ${bots.length} BOTs, avg yield ${avgYield}%`);

    return data;
  } catch (error) {
    console.error('❌ Error scraping data:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  scrapeData().catch(console.error);
}

module.exports = { scrapeData };
