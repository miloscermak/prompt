# Backend - AI Model Tester

Express.js server poskytující API pro testování AI modelů.

## Instalace

```bash
npm install
```

## Konfigurace

Vytvořte `.env` soubor:

```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
PORT=3001
```

## Spuštění

Vývojový režim (s automatickým restartem):
```bash
npm run dev
```

Produkční režim:
```bash
npm start
```

## API Endpointy

### POST /api/test
Testuje vybrané modely.

### POST /api/export-excel
Exportuje výsledky do Excelu.

### GET /api/health
Health check.

## Závislosti

- `express` - Web framework
- `cors` - CORS middleware
- `dotenv` - Načítání environment proměnných
- `openai` - OpenAI SDK
- `@anthropic-ai/sdk` - Anthropic SDK
- `@google/generative-ai` - Google Gemini SDK
- `xlsx` - Excel export
