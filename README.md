# GEMA — Hero "Entra nel computer"

Hero a scorrimento: un MacBook 3D (da telefono, uno smartphone 3D) ruota su sé stesso davanti allo sfondo "Glow Horizon". Sullo schermo c'è il logo GEMA cromato animato. Scorrendo il dispositivo si ferma di fronte, la telecamera entra nello schermo, il logo esce e va in alto a sinistra, compare la navbar e la pagina passa alla scena "Sei dentro.".

## Come aprirla

Il modello 3D viene caricato con una richiesta di rete, quindi la pagina va servita da un server locale e non aperta con doppio clic:

```bash
npx serve .
# oppure
python3 -m http.server
```

Poi apri l'indirizzo che compare nel terminale.

## Impostazioni

All'inizio dello script in `index.html` c'è l'oggetto `CONFIG`:

| Chiave | Valori | Cosa cambia |
|---|---|---|
| `sfondo` | `orizzonte`, `gradiente`, `glifi` | Lo sfondo dietro il MacBook |
| `orizzonte` | `alto`, `basso` | Da dove entra l'arco luminoso |
| `dispositivo` | `auto`, `computer`, `telefono` | Quale modello mostrare (`auto`: telefono sotto i 768 px) |
| `accent` | colore hex | Bottoni, scena "Sei dentro" e glifi |
| `spinSpeed` | gradi al secondo | Velocità di rotazione |

## File

- `index.html`: pagina, stili e animazione
- `models/macbook.glb`: MacBook compresso (3,5 MB)
- `models/phone.glb`: **non è nel repository** (vedi sotto)
- `vendor/`: three.js r147 con GLTFLoader e RoomEnvironment (licenza MIT, vedi `vendor/THREE-LICENSE`)

## Modello del telefono

Il modello del telefono ha la licenza Sketchfab Standard, che non permette di ridistribuire il file da solo: per questo non è nel repository pubblico (è in `.gitignore`). Scarica "Apple iPhone 18 Pro Max Black 2026" di extraakash da Sketchfab, comprimilo come il MacBook e mettilo in `models/phone.glb` sul server. Senza il file, da telefono compare il messaggio di errore al posto del modello.

## Crediti

- Modello 3D "MacBook Pro M3 16 inch 2024" di [jackbaeten](https://sketchfab.com/jackbaeten) su Sketchfab, con licenza [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Modifiche: modello compresso (quantizzazione e texture WebP) e contenuto dello schermo sostituito.
- Modello del telefono "Apple iPhone 18 Pro Max Black 2026" di [extraakash](https://sketchfab.com/AakashMansukhani) su Sketchfab, licenza Sketchfab Standard. Il logo Apple sul retro è nascosto.
- Sfondo "Glow" esportato dal Gradient Builder di 21st.dev. Sfondo "Glow Horizon" ricostruito in CSS dal componente fornito.
