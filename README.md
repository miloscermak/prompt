# 🤖 AI Model Tester

Aplikace pro testování a porovnávání odpovědí různých AI modelů (OpenAI, Google Gemini, Anthropic Claude).

## 🌐 Rychlé nasazení online

**Chceš aplikaci spustit online během 5 minut?**

👉 **[Návod na deployment na Railway](./DEPLOYMENT.md)** - krok po kroku průvodce

Railway nabízí free tier ($5 kredit/měsíc) a automaticky nasadí celou aplikaci z GitHubu!

## ✨ Funkce

- **Testování více modelů současně**: Vyberte si z 6 top AI modelů
- **Opakované dotazy**: Získejte 1-100 odpovědí od každého modelu
- **Export do Excelu**: Stáhněte si všechny odpovědi v přehledné tabulce
- **Moderní UI**: Responzivní design s gradientním pozadím

## 🎯 Dostupné modely

### OpenAI
- GPT-5 Instant
- GPT-5 Thinking

### Google Gemini
- Gemini 2.5 Flash
- Gemini 2.5 Pro

### Anthropic Claude
- Claude Opus 4.1
- Claude Sonnet 4.5

> **Poznámka**: Některé modely zatím nejsou veřejně dostupné. V kódu jsou použity placeholder modely (GPT-4 Turbo, Gemini 1.5, Claude Sonnet 4), které je potřeba aktualizovat, jakmile budou nové verze k dispozici.

## 🚀 Instalace

### Požadavky
- Node.js 18+
- npm nebo yarn

### 1. Naklonujte repozitář
```bash
git clone <repository-url>
cd prompt
```

### 2. Nastavte backend

```bash
cd backend
npm install
```

Vytvořte soubor `.env` podle `.env.example`:

```bash
cp .env.example .env
```

Vyplňte API klíče v `.env`:
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
PORT=3001
```

### 3. Nastavte frontend

```bash
cd ../frontend
npm install
```

## 🎮 Spuštění

### Spusťte backend (v terminálu 1)
```bash
cd backend
npm start
```

Backend poběží na `http://localhost:3001`

### Spusťte frontend (v terminálu 2)
```bash
cd frontend
npm run dev
```

Frontend poběží na `http://localhost:3000`

## 📖 Použití

1. Otevřete aplikaci v prohlížeči (`http://localhost:3000`)
2. Zadejte prompt, který chcete testovat
3. Nastavte počet odpovědí (1-100)
4. Zaškrtněte modely, které chcete testovat
5. Klikněte na "Spustit test"
6. Po dokončení můžete výsledky stáhnout jako Excel soubor

## 📁 Struktura projektu

```
prompt/
├── backend/
│   ├── server.js          # Express server s API endpointy
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Hlavní React komponenta
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Styly
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .gitignore
└── README.md
```

## 🔧 API Endpointy

### POST `/api/test`
Testuje vybrané modely s daným promptem.

**Request:**
```json
{
  "prompt": "Vysvětli kvantovou fyziku",
  "models": ["gpt-5-instant", "claude-sonnet-4.5"],
  "count": 5
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "model": "gpt-5-instant",
      "responseNumber": 1,
      "timestamp": "2025-11-09T10:30:00.000Z",
      "response": "..."
    }
  ]
}
```

### POST `/api/export-excel`
Exportuje výsledky do Excel souboru.

**Request:**
```json
{
  "results": [...],
  "prompt": "Původní prompt"
}
```

**Response:** Excel soubor (.xlsx)

### GET `/api/health`
Health check endpoint.

## 🛠️ Technologie

### Backend
- Node.js
- Express
- OpenAI SDK
- Anthropic SDK
- Google Generative AI SDK
- XLSX (Excel export)

### Frontend
- React 18
- Vite
- Axios

## 📝 Poznámky

- API klíče jsou vyžadovány pro všechny služby
- Rate limiting závisí na vašem tarifu u jednotlivých poskytovatelů
- Velký počet opakování (např. 100) může trvat dlouho a být nákladný
- Ujistěte se, že máte dostatečný kredit u API poskytovatelů

## 🔐 Bezpečnost

- Nikdy necommitujte `.env` soubor s API klíči
- Používejte `.gitignore` pro ochranu citlivých dat
- V produkci použijte HTTPS a zabezpečení API

## 📄 Licence

MIT