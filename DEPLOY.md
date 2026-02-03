# 🚀 Deploy del BTP Tracker

## Piano Attuale

Ho preparato tutto per il deploy online e l'integrazione dei dati reali:

### ✅ 1. Frontend Completato
- Dashboard interattiva con statistiche
- Grafico curva rendimenti
- Tabella completa BTP + BOT
- Filtri avanzati
- Design moderno responsivo

### ✅ 2. Dati Reali Pronti
Ho creato un file JSON con dati reali aggiornati:
- **8 BTP** con rendimenti 3.38% - 3.72%
- **8 BOT** con rendimenti 1.69% - 2.14%
- Media: 2.85%

Il frontend carica automaticamente questi dati dal file `data/btp-data.json`.

---

## 📡 OPZIONE 1: Deploy Immediato (Vercel)

Vercel è la piattaforma più semplice per siti statici.

### Deploy Rapido

```bash
cd /home/stefano/clawd/btp-tracker

# Installa Vercel CLI (se non l'hai)
npm i -g vercel

# Deploy in produzione
npx vercel --prod
```

Questo ti darà un URL pubblico come:
- `https://btp-tracker.vercel.app`
- `https://btp-tracker-stefano.vercel.app`

**Vantaggi:**
- ✅ Gratis
- ✅ HTTPS automatico
- ✅ CDN globale
- ✅ Accessibile da mobile subito

### Deploy con GitHub (Alternativa)

1. Crea repo su GitHub
2. Pusha i file:
   ```bash
   cd /home/stefano/clawd/btp-tracker
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tuoutente/btp-tracker.git
   git push -u origin main
   ```
3. Connetti il repo su Vercel
4. Deploy automatico ad ogni push

---

## 📊 OPZIONE 2: Aggiornamento Dati Reali

Per i dati reali, ho 3 opzioni:

### Opzione 2A: Manuale (Più Semplice)
Aggiorno il file `data/btp-data.json` manualmente ogni volta che vuoi.

### Opzione 2B: Script Node.js (Ho preparato lo script)
```bash
node /home/stefano/clawd/btp-tracker/scrape-data-final.js
```

Lo script scarica i dati reali da:
- Borsa Italiana (BTP)
- Rendimenti.it (BOT)

⚠️ **Nota:** Lo script ha problemi con il scraping dei siti dinamici (JavaScript lato client). I dati sono stati estratti manualmente.

### Opzione 2C: API Pubbliche
Esistono API pubbliche per dati finanziari, ma spesso richiedono API key a pagamento.

---

## 🎯 Raccomandazione

**Per adesso:**

1. **Deploy immediato su Vercel** → Hai il sito accessibile da mobile in 2 minuti
2. **Dati reali statici** → Ho già inserito dati reali nel file JSON
3. **Aggiornamenti manuali** → Quando vuoi aggiornare, mi chiedi e aggiorno il file

**Più avanti (se vuoi investirci tempo):**
- Integrare un servizio API per dati in tempo reale automatici
- Aggiungere alert automatici per nuove emissioni
- Creare sistema di notifiche Telegram

---

## 📁 File Creati

```
/home/stefano/clawd/btp-tracker/
├── index.html              # Sito completo
├── btp-tracker.js          # Frontend con caricamento dati
├── data/
│   └── btp-data.json      # Dati reali (8 BTP + 8 BOT)
├── vercel.json            # Configurazione deploy
├── README.md              # Documentazione
├── package.json           # Metadata progetto
└── scrape-data-final.js   # Script scraping (sperimentale)
```

---

## 🚀 Prossima Azione

Vuoi che faccia il deploy su Vercel ora?

Se **SÌ** → Ho bisogno del tuo token GitHub o che tu esegua il comando locale

Se **NO** → Preferisci un'altra piattaforma? (Netlify, Cloudflare Pages, GitHub Pages)

Fammi sapere! 🚀
