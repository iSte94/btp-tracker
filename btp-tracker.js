/**
 * BTP Tracker - Frontend with Real Data
 * Versione migliorata con caricamento dati JSON
 */

// Dati reali caricati da file JSON
let bondsData = {
  btps: [],
  bots: [],
  lastUpdate: null
};

// Carica dati reali
async function loadRealData() {
  try {
    const response = await fetch('data/btp-data.json?' + Date.now());
    bondsData = await response.json();
    return true;
  } catch (error) {
    console.warn('Impossibile caricare dati reali, uso dati di esempio');
    return false;
  }
}

// Inizializzazione
async function init() {
  const hasRealData = await loadRealData();

  if (!hasRealData) {
    // Fallback to demo data
    bondsData = {
      lastUpdate: new Date().toISOString(),
      btps: generateDemoBTPs(),
      bots: generateDemoBOTs(),
      summary: { avgYield: '3.45', totalBTPs: 12, totalBOTs: 8 }
    };
  }

  updateDashboard();
  renderTable();
  renderChart();
  updateLastUpdate();
}

// Genera dati demo BTP
function generateDemoBTPs() {
  return [
    { isin: 'IT0001086567', description: 'BTP Nov26 7.25%', type: 'BTP', price: 103.767, coupon: 3.625, expiry: '2026-11-01', grossYield: '3.45', netYield: '3.02' },
    { isin: 'IT0001174611', description: 'BTP Nov27 6.5%', type: 'BTP', price: 107.31, coupon: 3.25, expiry: '2027-11-01', grossYield: '3.52', netYield: '3.08' },
    { isin: 'IT0001278511', description: 'BTP Nov29 5.25%', type: 'BTP', price: 109.67, coupon: 2.625, expiry: '2029-11-01', grossYield: '3.38', netYield: '2.96' },
    { isin: 'IT0001444378', description: 'BTP May31 6.0%', type: 'BTP', price: 115.67, coupon: 3.00, expiry: '2031-05-01', grossYield: '3.65', netYield: '3.19' },
    { isin: 'IT0003256820', description: 'BTP Feb33 5.75%', type: 'BTP', price: 116.83, coupon: 2.875, expiry: '2033-02-01', grossYield: '3.72', netYield: '3.26' },
    { isin: 'IT0003535157', description: 'BTP Aug34 5.0%', type: 'BTP', price: 112.80, coupon: 2.50, expiry: '2034-08-01', grossYield: '3.55', netYield: '3.11' },
    { isin: 'IT0005402368', description: 'BTP Sep28 4.75%', type: 'BTP', price: 108.50, coupon: 2.375, expiry: '2028-09-01', grossYield: '3.42', netYield: '2.99' },
    { isin: 'IT0005430121', description: 'BTP Mar30 4.5%', type: 'BTP', price: 106.20, coupon: 2.25, expiry: '2030-03-01', grossYield: '3.48', netYield: '3.05' }
  ];
}

// Genera dati demo BOT
function generateDemoBOTs() {
  return [
    { isin: 'IT0005689887', description: 'BOT Zc Jan27 A', type: 'BOT', price: 98.067, expiry: '2027-01-14', grossYield: '2.02', netYield: '1.77' },
    { isin: 'IT0005684888', description: 'BOT Zc Dec26 A', type: 'BOT', price: 98.254, expiry: '2026-12-14', grossYield: '1.97', netYield: '1.72' },
    { isin: 'IT0005678492', description: 'BOT Zc Nov26 A', type: 'BOT', price: 98.423, expiry: '2026-11-13', grossYield: '2.02', netYield: '1.77' },
    { isin: 'IT0005674335', description: 'BOT Zc Oct26 A', type: 'BOT', price: 98.597, expiry: '2026-10-14', grossYield: '2.14', netYield: '1.87' },
    { isin: 'IT0005669269', description: 'BOT Zc Sep26 A', type: 'BOT', price: 98.767, expiry: '2026-09-14', grossYield: '2.13', netYield: '1.86' },
    { isin: 'IT0005666851', description: 'BOT Zc Aug26 A', type: 'BOT', price: 98.937, expiry: '2026-08-14', grossYield: '1.98', netYield: '1.73' }
  ];
}

// Update dashboard stats
function updateDashboard() {
  const allBonds = [...bondsData.btps, ...bondsData.bots];
  const avgYield = bondsData.summary.avgYield || '0.00';
  const maxYield = allBonds.length > 0 ? Math.max(...allBonds.map(b => parseFloat(b.grossYield || 0))).toFixed(2) : '0.00';

  document.getElementById('totalBonds').textContent = allBonds.length;
  document.getElementById('avgYield').textContent = `${avgYield}%`;
  document.getElementById('maxYield').textContent = `${maxYield}%`;
  document.getElementById('newEmissions').textContent = bondsData.btps.filter(b => {
    const emissionDate = new Date(b.expiry);
    const daysToEmission = Math.floor((emissionDate - new Date()) / (1000 * 60 * 60 * 24));
    return daysToEmission > 0 && daysToEmission <= 30;
  }).length;
}

// Render table with real data
function renderTable() {
  const tbody = document.getElementById('bondsTableBody');
  const allBonds = [...bondsData.btps, ...bondsData.bots];

  tbody.innerHTML = allBonds.map(bond => `
    <tr class="hover:bg-gray-50 transition-colors cursor-pointer">
      <td class="px-4 py-3 text-sm font-medium text-gray-900">${bond.isin}</td>
      <td class="px-4 py-3 text-sm text-gray-700">${bond.description}</td>
      <td class="px-4 py-3 text-sm">
        <span class="px-2 py-1 text-xs font-semibold rounded-full ${
          bond.type === 'BTP' ? 'bg-purple-100 text-purple-800' :
          bond.type === 'BOT' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }">${bond.type}</span>
      </td>
      <td class="px-4 py-3 text-sm text-gray-700">${bond.expiry}</td>
      <td class="px-4 py-3 text-sm font-medium text-gray-900">${bond.price?.toFixed(3) || 'N/A'}</td>
      <td class="px-4 py-3 text-sm font-bold ${parseFloat(bond.grossYield) > 3 ? 'yield-positive' : 'yield-negative'}">
        ${bond.grossYield}%
      </td>
      <td class="px-4 py-3 text-sm text-gray-600">${bond.netYield ? bond.netYield + '%' : 'N/A'}</td>
    </tr>
  `).join('');
}

// Render yield curve chart
function renderChart() {
  const ctx = document.getElementById('yieldChart').getContext('2d');
  const allBonds = [...bondsData.btps, ...bondsData.bots]
    .sort((a, b) => new Date(a.expiry) - new Date(b.expiry));

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: allBonds.map(b => {
        const date = new Date(b.expiry);
        return date.toLocaleDateString('it-IT', { month: 'short', year: '2-digit' });
      }),
      datasets: [{
        label: 'Rendimento Lordo',
        data: allBonds.map(b => parseFloat(b.grossYield || 0)),
        borderColor: 'rgb(124, 58, 237)',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `Rendimento: ${context.parsed.y}%`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: (value) => value + '%'
          }
        }
      }
    }
  });
}

// Update last update time
function updateLastUpdate() {
  const date = new Date(bondsData.lastUpdate);
  document.getElementById('lastUpdate').textContent = date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Filter functionality
function filterBonds() {
  const tipo = document.getElementById('tipoFilter').value;
  const scadenzaMin = document.getElementById('scadenzaFilter').value;
  const rendimentoMin = document.getElementById('rendimentoFilter').value;

  const rows = document.querySelectorAll('#bondsTableBody tr');
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    const rowTipo = cells[2].textContent.trim();
    const rowScadenza = new Date(cells[3].textContent.trim());
    const rowRendimento = parseFloat(cells[5].textContent);

    let visible = true;

    if (tipo && rowTipo !== tipo) visible = false;
    if (scadenzaMin && rowScadenza < new Date(scadenzaMin)) visible = false;
    if (rendimentoMin && rowRendimento < parseFloat(rendimentoMin)) visible = false;

    row.style.display = visible ? '' : 'none';
  });
}

// Event listeners
document.getElementById('tipoFilter').addEventListener('change', filterBonds);
document.getElementById('scadenzaFilter').addEventListener('change', filterBonds);
document.getElementById('rendimentoFilter').addEventListener('change', filterBonds);

// Initialize on load
window.addEventListener('DOMContentLoaded', init);
