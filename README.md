# GEMA — sito (ramo `sito-semidefinitivo`)

Riproduzione in HTML statico della pagina Figma **"sito definitivo"** (file Gema). Nessuna build: due pagine HTML, un foglio di stile e due script in `assets/`.

## Pagine e sezioni

**`index.html`**
1. **Hero** — "Non sarai tu a cercare i clienti. Saranno loro a trovare te.", slider "Scorri per l'analisi gratuita" e recensione, su sfondo **Matrix Rain** (vedi sotto). Trascinando il pallino fino in fondo (oppure cliccandolo o premendo Invio) si va ai contatti con "Analisi gratuita" già selezionata.
2. **Cosa facciamo** — sezione bloccata durante lo scroll: le quattro card (Web, Design, SEO, Care) entrano dal basso e si impilano; titolo e barra di avanzamento cambiano con la card attiva.
3. **Come lavoriamo** — il "filo conduttore" si disegna con lo scroll e collega le quattro fasi (*In coda* → *In corso* → *Fatto ✓*). Chiude la CTA "Il quinto passo è il tuo."
4. **Footer**.

**`contatti.html`** — la pagina "Raccontaci il tuo progetto." con il modulo (nome, email, servizi selezionabili tra cui "Altro", messaggio). Si apre sempre dall'inizio, comunque ci arrivi (link, ricarica, tasto indietro). Oltre a nome ed email c'è il campo facoltativo "Il tuo sito attuale". Quando il modulo viene inviato, dal pulsante si apre il pannello blu con "~/gema $ exit — Il prossimo sito che trovano può essere il tuo." e si torna alla home.

Sotto i 900 px le sezioni animate diventano una colonna normale.

## Navbar fissa

In alto nella hero c'è una barra semplice (logo e "Contatti"). Appena si scorre compare la **navbar fissa** con sfondo sfocato: logo, "Cosa facciamo", "Come lavoriamo" (con un pallino sulla sezione in cui ti trovi) e il pulsante "Contattaci". Su `contatti.html` è sempre visibile e ha "← Torna alla home".

## Transizioni tra le pagine

I link con l'attributo `data-to-contact` (pulsanti "Contattaci", "Inizia un progetto", ecc.), lo slider della hero e l'invio del modulo non cambiano pagina di colpo: un cerchio blu si apre dal punto del clic e mostra una scritta ("Raccontaci il tuo progetto.", "Analizziamo il tuo sito." oppure la chiusura "Il prossimo sito che trovano può essere il tuo."), poi si carica la pagina nuova, che parte sempre dall'alto: lì il pannello blu sale e scopre la pagina. Se apri una pagina direttamente, o hai "riduci movimento" attivo nel sistema, si apre senza animazione.

## Footer

Le colonne: presentazione e pulsante "Inizia un progetto", Servizi, Studio, Contatti, Social. Sotto c'è la scritta GEMA grande in trasparenza e la barra con © 2026, P.IVA, privacy, cookie e "Torna su".

## Come aprirla

```bash
npx serve .
# oppure
python3 -m http.server
```

## Sfondo Matrix Rain

La hero usa il porting in JavaScript puro del componente React `MatrixRain` (canvas con colonne di caratteri che scendono, scia, glow e reazione al puntatore). Nell'HTML è il `<div class="matrix" data-matrix>`; sopra c'è il "velo" radiale del Figma che scurisce la zona dei testi.

Colori e intensità sono nell'oggetto `CONFIG_RAIN` all'inizio di `assets/js/home.js`:

| Chiave | Valore | Cosa cambia |
|---|---|---|
| `background` | `#141414` | Fondo della hero |
| `color` | `#536be1` | Colore della scia (blu GEMA) |
| `highlight` | `#94a6ff` | Carattere in testa alla colonna |
| `fontSize` | `18` | Dimensione dei caratteri (10–32) |
| `opacity` | `0.65` | Opacità del canvas: 1 = come il componente originale |
| `speed`, `density`, `trail`, `glow` | come l'originale | Velocità, fittezza, lunghezza scia, bagliore |

Con "riduci movimento" attivo nel sistema la pioggia resta ferma.

## Da collegare

- Il modulo "Parlaci di te" **non invia ancora nulla**: mostra la conferma e torna alla home. Va agganciato un servizio (es. Formspree) o un endpoint del team in `assets/js/site.js`.
- Email, telefono e P.IVA sono segnaposto (`ciao@gema.it`, `+39 000 000 0000`, `00000000000`).
- I link social (Instagram, LinkedIn, Behance) puntano a `#`.
- Privacy e cookie policy puntano a `#`.

## File

- `index.html`, `contatti.html` — le due pagine
- `assets/css/gema.css` — tutti gli stili
- `assets/js/site.js` — comune alle due pagine: navbar fissa, transizione, moduli
- `assets/js/home.js` — solo home: Matrix Rain, card di "Cosa facciamo", filo di "Come lavoriamo"
- `assets/illustrazioni/` — le quattro illustrazioni delle card, esportate dal Figma
- `models/`, `vendor/` — risorse della vecchia hero 3D col MacBook (su `main`), non usate da questa pagina
