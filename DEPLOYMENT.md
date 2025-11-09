# 🚀 Deployment na Railway

Tento návod tě provede nasazením AI Model Tester aplikace na Railway.app

## 📋 Předpoklady

1. **GitHub účet** - Aplikace už je na GitHubu
2. **Railway účet** - Zaregistruj se na [railway.app](https://railway.app)
3. **API klíče** pro:
   - OpenAI (https://platform.openai.com/api-keys)
   - Anthropic (https://console.anthropic.com/)
   - Google AI (https://makersuite.google.com/app/apikey)

## 🎯 Krok po kroku

### 1. Vytvoř Railway projekt

1. Přihlas se na [railway.app](https://railway.app)
2. Klikni na **"New Project"**
3. Vyber **"Deploy from GitHub repo"**
4. Autorizuj Railway k přístupu k tvému GitHub účtu
5. Vyber repozitář **`miloscermak/prompt`**
6. Railway automaticky detekuje konfiguraci a začne deployment

### 2. Nastav Environment Variables (API klíče)

Po vytvoření projektu:

1. V Railway dashboardu klikni na svůj projekt
2. Přejdi na záložku **"Variables"**
3. Přidej následující proměnné:

```
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
PORT=3001
```

**Důležité:** Zkopíruj hodnoty přesně, bez mezer na začátku či konci!

### 3. Spusť deployment

1. Railway automaticky začne build proces po nastavení proměnných
2. Sleduj progress v záložce **"Deployments"**
3. Build zabere cca 2-5 minut

### 4. Získej URL aplikace

1. Po úspěšném deployi přejdi na **"Settings"**
2. V sekci **"Networking"** klikni na **"Generate Domain"**
3. Railway vygeneruje URL jako `your-app.up.railway.app`
4. Otevři URL v prohlížeči - aplikace běží! 🎉

## 🔍 Kontrola funkčnosti

Po nasazení zkontroluj:

1. **Health Check**: Otevři `https://your-app.up.railway.app/api/health`
   - Mělo by se zobrazit: `{"status":"OK","timestamp":"..."}`

2. **Frontend**: Otevři hlavní URL
   - Měl by se zobrazit formulář s výběrem modelů

3. **Test**: Zadej testovací prompt a vyber model
   - Pokud dostaneš chybu s API klíčem, zkontroluj Variables

## 🐛 Řešení problémů

### Build selhává
- Zkontroluj logs v Railway dashboard
- Ujisti se, že všechny soubory jsou na GitHubu (git push)

### Application error 500
- Zkontroluj, že jsou všechny API klíče správně nastavené
- Zkontroluj logs v Railway: **Deployments → View Logs**

### API volání nefungují
- Ověř platnost API klíčů
- Zkontroluj, že máš dostatečný kredit u API poskytovatelů
- Zkontroluj názvy proměnných (musí být přesně jako výše)

### Frontend se nenačte
- Počkej 30 sekund po deployi (Railway někdy potřebuje restart)
- Hard refresh v prohlížeči (Ctrl+Shift+R nebo Cmd+Shift+R)

## 💰 Náklady

Railway nabízí:
- **Free tier**: $5 kredit měsíčně (dostatečné pro testování)
- **Developer plan**: $5/měsíc (+ usage)
- **Team plan**: $20/měsíc (+ usage)

**Pozor**: API volání na OpenAI, Anthropic a Google se účtují samostatně podle jejich ceníků!

## 🔄 Aktualizace aplikace

Když uděláš změny v kódu:

1. Commit a push do GitHubu:
   ```bash
   git add .
   git commit -m "Update application"
   git push
   ```

2. Railway automaticky detekuje změny a znovu deployuje
3. Sleduj progress v **"Deployments"**

## 📊 Monitoring

V Railway dashboardu můžeš sledovat:
- **Metrics**: CPU, RAM, Network usage
- **Logs**: Realtime logy aplikace
- **Deployments**: Historie deploymentů

## 🔐 Bezpečnost

- ✅ API klíče jsou v environment variables (ne v kódu)
- ✅ `.env` soubory jsou v `.gitignore`
- ✅ HTTPS je automaticky zapnuté
- ⚠️ Railway domain je veřejná - zvař, kdo má přístup

## 🎓 Další kroky

- **Custom domain**: V Settings → Networking můžeš přidat vlastní doménu
- **Backups**: Railway automaticky zálohuje
- **Scaling**: V Settings můžeš zvýšit resources

## 📞 Podpora

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: Nahlaš problémy v repozitáři

---

**Hotovo!** 🎉 Tvoje aplikace by měla běžet na Railway. Pokud máš problémy, zkontroluj logs a environment variables.
