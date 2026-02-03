# 🚀 Automazione Deploy btp-tracker

Ho preparato tutto per il deploy automatico. Ci sono 2 strade:

---

## Opzione 1: Vercel for GitHub ⚡ (RACCOMANDATA)

**Vantaggi:**
- ✅ Zero manutenzione
- ✅ Deploy automatico su ogni push
- ✅ Preview URLs per le PR
- ✅ Niente CLI o token

**Passaggi da fare UNA volta (1 minuto):**

1. Vai su: https://vercel.com/new
2. Importa il repo: `iSte94/btp-tracker`
3. Click "Deploy"

Fatto! Per sempre automatico.

---

## Opzione 2: GitHub Actions (Automazione completa)

**Vantaggi:**
- ✅ Deploy automatico via GitHub Actions
- ✅ Trigger manuale dalla dashboard GitHub
- ✅ Logs completi in GitHub

**Setup richiesto:**

### 1. Recupera credenziali Vercel
```bash
vercel login
vercel link
```

Poi copia questi valori dal file `.vercel/project.json`:
- `orgId` → `VERCEL_ORG_ID`
- `projectId` → `VERCEL_PROJECT_ID`

### 2. Crea Vercel Token
1. Vai su: https://vercel.com/account/tokens
2. Crea nuovo token
3. Copia il valore → `VERCEL_TOKEN`

### 3. Configura GitHub Secrets
1. Vai su: https://github.com/iSte94/btp-tracker/settings/secrets/actions
2. Aggiungi 3 secrets:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

### 4. Workflow già pronto!
Ho già creato `.github/workflows/vercel-deploy.yml` 🔥

---

## Deploy Locale (Script pronto)

Ho creato `deploy-hook.sh` per deploy rapidi da locale:

```bash
# Deploy con messaggio personalizzato
./deploy-hook.sh "fix: aggiornato tracker"

# Deploy con messaggio automatico
./deploy-hook.sh
```

Questo script:
1. Stage tutti i cambiamenti
2. Commit con messaggio
3. Push su GitHub
4. Triggera deploy automatico

---

## Il mio consiglio 🎯

**Fai Opzione 1** (Vercel for GitHub) - È la strada nativa, zero problemi.

L'Opzione 2 (GitHub Actions) è ottima se vuoi controllo extra, ma richiede setup secrets.

Lo script `deploy-hook.sh` funziona con ENTRAMBE le opzioni (pusha su GitHub).

---

## Cosa posso fare io ora

Se mi dai:
1. `VERCEL_TOKEN`
2. `VERCEL_ORG_ID`  
3. `VERCEL_PROJECT_ID`

Posso configurare GitHub Actions io (inserisco i secrets via API GitHub).

Altrimenti, fai Opzione 1 su Vercel Dashboard → 1 minuto e sei a posto per sempre! 🚀
