# Frontend - AI Model Tester

React aplikace s Vite pro testování AI modelů.

## Instalace

```bash
npm install
```

## Spuštění

Vývojový server:
```bash
npm run dev
```

Build pro produkci:
```bash
npm run build
```

Preview produkčního buildu:
```bash
npm run preview
```

## Funkce

- Formulář pro zadání promptu
- Výběr AI modelů pomocí checkboxů
- Nastavení počtu opakování (1-100)
- Zobrazení výsledků v přehledném UI
- Export výsledků do Excel souboru

## Technologie

- React 18
- Vite
- Axios
- CSS3 (gradientní design)

## Struktura

- `src/App.jsx` - Hlavní komponenta s UI
- `src/main.jsx` - Entry point aplikace
- `src/index.css` - Globální styly
- `vite.config.js` - Vite konfigurace (včetně proxy)
