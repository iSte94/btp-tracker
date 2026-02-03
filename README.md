# BTP Tracker

Sito web moderno per monitorare i rendimenti dei titoli di stato italiani (BTP, BOT, BTP Italia, BTP Valore).

## 🚀 Deploy Online

Il sito è stato preparato per il deploy su Vercel.

### Opzione 1: Deploy Automatico con Vercel CLI

```bash
cd /home/stefano/clawd/btp-tracker
npx vercel --prod
```

Questo comando:
- Crea un progetto Vercel
- Deploya il sito
- Ti fornirà un URL pubblico (es: `https://btp-tracker.vercel.app`)

### Opzione 2: Deploy con GitHub

1. Crea repo GitHub
2. Pusha i file
3. Connetti repo su Vercel
4. Deploy automatico ad ogni push

---

## 📊 Integrazione Dati Reali

Il sito integrerà dati da:

### Fonte 1: Borsa Italiana (MOT)
- **URL:** https://www.borsaitaliana.it/borsa/obbligazioni/mot/btp/lista.html
- **Dati:** ISIN, descrizione, prezzo, coupon, scadenza
- **Metodo:** Web scraping con Node.js

### Fonte 2: Rendimenti.it
- **URL:** https://www.rendimenti.it/bot
- **Dati:** Prezzo, rendimento netto BOT
- **Metodo:** Web scraping con Node.js

### Piano Implementazione
1. ✅ Frontend pronto
2. 🔄 Creare script Node.js per scraping
3. 🔄 API endpoint per dati JSON
4. 🔄 Integrazione con frontend

---

## 📁 Struttura File

```
/home/stefano/clawd/btp-tracker/
├── index.html          # Sito completo
├── vercel.json         # Configurazione deploy
└── README.md           # Documentazione
```

---

## 🎯 Prossimi Passi

1. **Deploy immediato su Vercel** - accessibile da mobile
2. **Script scraping dati reali** - Borsa Italiana + Rendimenti.it
3. **API endpoint** - dati JSON per il frontend
4. **Aggiornamento automatico** - cron job ogni ora

---

*Creato da Pixel - 2026-02-03*
