# Vehicule Card

[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-2025.11%2B-41BDF5?logo=homeassistant&logoColor=white)](https://www.home-assistant.io/)
[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![GitHub Release](https://img.shields.io/github/v/release/cnecrea/vehicule-card)](https://github.com/cnecrea/vehicule-card/releases)
[![GitHub Stars](https://img.shields.io/github/stars/cnecrea/vehicule-card?style=flat&logo=github)](https://github.com/cnecrea/vehicule-card/stargazers)
[![Instalări](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/cnecrea/vehicule-card/main/statistici/shields/descarcari.json)](https://github.com/cnecrea/vehicule-card)
[![Ultima versiune](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/cnecrea/vehicule-card/main/statistici/shields/ultima_release.json)](https://github.com/cnecrea/vehicule-card/releases/latest)


Custom Lovelace card pentru integrarea [Vehicule](https://github.com/cnecrea/vehicule) — Home Assistant.

**Meta-card** — auto-descoperă vehiculele și generează configurații pentru cardurile existente (button-card, stack-in-card, bubble-card, card-mod, mini-graph-card). Rezultatul este identic vizual cu designul din [LOVELACE.md](https://github.com/cnecrea/vehicule/blob/main/LOVELACE.md), dar cu o singură linie de configurare.

## Cerințe

Următoarele carduri trebuie instalate din [HACS](https://hacs.xyz/):

| Card | Rol |
|---|---|
| [button-card](https://github.com/custom-cards/button-card) | Carduri cu JavaScript templates |
| [stack-in-card](https://github.com/custom-cards/stack-in-card) | Grupare carduri fără margini |
| [Bubble Card](https://github.com/Clooos/Bubble-Card) | Separatoare de secțiune |
| [card-mod](https://github.com/thomasloven/lovelace-card-mod) | Stilizare CSS personalizată |
| [mini-graph-card](https://github.com/kalkih/mini-graph-card) | Grafic istoric kilometraj |

## Instalare

### HACS (recomandat)

1. HACS → Frontend → **+** → Repository: `cnecrea/vehicule-card`
2. Instalați **Vehicule Card**
3. Reporniți Home Assistant
4. Adăugați resursa (dacă nu se adaugă automat):
   - URL: `/hacsfiles/vehicule-card/vehicule-card.js`
   - Tip: JavaScript Module

### Manual

1. Descărcați `vehicule-card.js` din [Releases](https://github.com/cnecrea/vehicule-card/releases)
2. Copiați în `/config/www/vehicule-card.js`
3. Adăugați resursa: `/local/vehicule-card.js` (JavaScript Module)

## Utilizare

### Configurare minimă (auto-detectare)

```yaml
type: custom:vehicule-card
```

Cardul descoperă automat primul vehicul din integrarea Vehicule.

### Configurare completă

```yaml
type: custom:vehicule-card
vehicul: b123abc
sectiuni:
  - informatii
  - documente
  - mentenanta
  - echipament
  - grafic
```

### Parametri

| Parametru | Tip | Implicit | Descriere |
|---|---|---|---|
| `vehicul` | string | auto | Prefixul vehiculului (ex: `b123abc`) |
| `sectiuni` | list | toate | Lista secțiunilor vizibile |

### Secțiuni disponibile

| Secțiune | Conținut |
|---|---|
| `informatii` | Marcă, model, kilometraj, putere, cilindree, VIN, CIV |
| `documente` | RCA, Casco, ITP, Rovinieta, Impozit, Leasing |
| `mentenanta` | Revizie ulei, distribuție, frâne, baterie, anvelope |
| `echipament` | Trusă prim ajutor, extinctor |
| `grafic` | Grafic istoric kilometraj (30 zile) |

## Sistem de culori

| Culoare | Condiție |
|---|---|
| 🟢 Verde | Totul în regulă |
| 🟠 Portocaliu | Atenție — acționați curând |
| 🔴 Roșu | Expirat / depășit |

## Editor vizual

Cardul include editor vizual accesibil din UI — selectare vehicul din dropdown și toggle secțiuni vizibile.

## Dezvoltare

```bash
npm run build
```

Generează `dist/vehicule-card.js` din sursele din `src/`.

## Licență

MIT — [Ciprian Nicolae](https://github.com/cnecrea)
