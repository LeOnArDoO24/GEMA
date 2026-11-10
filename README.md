# GEMA — Hero "Entra nel computer"

Hero a scorrimento: un MacBook 3D ruota su sé stesso davanti allo sfondo "Glow Horizon". Scorrendo si ferma di fronte, la telecamera entra nello schermo e la pagina passa alla scena "Sei dentro.".

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
| `accent` | colore hex | Schermo, bottoni e glifi |
| `spinSpeed` | gradi al secondo | Velocità di rotazione |

Subito dopo c'è `LOGO`, per il logo GEMA cromato sul retro del coperchio: `larghezza` (frazione della larghezza del coperchio, 0.46) e `velocita` (secondi per un passaggio dei riflessi diagonali, 7).

## File

- `index.html`: pagina, stili e animazione
- `models/macbook.glb`: modello 3D compresso (3,5 MB)
- `vendor/`: three.js r147 con GLTFLoader e RoomEnvironment (licenza MIT, vedi `vendor/THREE-LICENSE`)

## Crediti

- Modello 3D "MacBook Pro M3 16 inch 2024" di [jackbaeten](https://sketchfab.com/jackbaeten) su Sketchfab, con licenza [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Modifiche: modello compresso (quantizzazione e texture WebP) e contenuto dello schermo sostituito, logo sul retro sostituito con il logo GEMA.
- Sfondo "Glow" esportato dal Gradient Builder di 21st.dev. Sfondo "Glow Horizon" ricostruito in CSS dal componente fornito.
