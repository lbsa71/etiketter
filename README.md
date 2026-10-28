# SEEDS etiketter

> **Projektet har flyttat.** Använd [verktyget på GitHub Pages](https://lbsa71.github.io/etiketter/).
> Källkod, dokumentation, tester och Word-referenser underhålls nu i
> [lbsa71/lbsa71.github.io, underkatalogen etiketter](https://github.com/lbsa71/lbsa71.github.io/tree/master/etiketter).
> Det här repot arkiverades den 28 oktober 2026 och behålls som historik. Gör fortsatta ändringar i det nya repot.

Ett litet webbläsarverktyg som skapar färgkodade provetiketter som PDF för SEEDS-studien. Det ersätter manuell redigering av studienummer i Word.

## Använd verktyget

Öppna [`sites/seeds-etiketter/dist/index.html`](sites/seeds-etiketter/dist/index.html) i en vanlig webbläsare. Behåll hela `dist`-mappen, inklusive `vendor`.

1. Fyll i första studienumret. `001` ger `001–024`, `025` ger `025–048`.
2. Välj ark med kryssrutorna. Varje valt ark har 24 etiketter med samma nummerintervall.
3. Kontrollera förhandsvisningen och klicka på **Hämta PDF**. Varje valt ark blir en PDF-sida.
4. Skriv ut på A4, enkelsidigt, i **100 % / verklig storlek**. Stäng av **Anpassa till sida**.

Datum och klockslag fylls i för hand. Prova gärna första utskriften på vanligt papper och håll den mot etikettarket för att kontrollera skrivarens matning.

## Helt statisk HTML och JavaScript

Ingen Node-server, databas, inloggning eller backend behövs för själva verktyget. PDF:en skapas lokalt i webbläsaren med en medföljande kopia av jsPDF. Inga externa typsnitt, CDN-filer eller API:er hämtas av sidan. Verktyget fungerar även när `index.html` öppnas direkt från disk utan internet.

För webbhosting laddar man upp **innehållet i `sites/seeds-etiketter/dist/`** till valfri statisk webbserver. Sites-konfigurationen finns i `.openai/hosting.json` i samma projektmapp. Åtkomstkontroll på en eventuell hostingtjänst är separat från själva den statiska sidan.

Node används enbart om man vill köra utvecklartesterna nedan, aldrig för att använda eller hosta sidan. Inget byggsteg eller `npm install` behövs.

## Etikettformat

- A4 stående, exakt 210 × 297 mm.
- 3 kolumner × 8 rader, utan mellanrum eller ytterkant på etikettarket.
- Varje fysisk etikett är 70 × 37,125 mm.
- Varje etikett har 5 mm vit kant. Den färgade ytan är 60 × 27,125 mm.
- Etikettarket krymps inte till skrivarens utskrivbara yta. Färg och text placeras innanför de vita kanterna.
- Numreringen löper nedåt i varje kolumn: `001–008`, `009–016`, `017–024`.
- Texten är vänsterställd och genomgående 10 punkter i fetstil, enligt mallarnas formatering. Det medföljande typsnittet Carlito Bold används i både förhandsvisning och PDF.

## Provtyper och provtagningar

| Ark | Text på etiketten | Färg |
| --- | --- | --- |
| Före inkludering, EDTA | 1. provtagning EDTA | Lila |
| Före inkludering, Serum | 1. provtagning Serum | Ljusgul |
| Efter inkludering, EDTA | 2. provtagning EDTA | Lila |
| Efter inkludering, Serum | 2. provtagning Serum | Ljusgul |
| Efter inkludering, Faeces | Faeces | Ljusbrun |
| Efter inkludering, Nasofarynx | Nasofarynx | Ljusgrön |
| Efter inkludering, Svalg | Svalg | Cyan |
| Efter inkludering, Likvor | Likvor | Ljuslila |

Siffrorna **1.** och **2.** är en del av etikettexten för EDTA och Serum. Övriga fyra provtyper följer efter-mallens text utan provtagningssiffra. Stavningen är **Faeces**, korrigerad från Word-mallens `Feces`.

## Projektets filer

```text
reference/                              Ursprungliga Word-mallar
docs/                                   Krav och teknisk dokumentation
sites/seeds-etiketter/
  .openai/hosting.json                   Konfiguration för statisk Sites-hosting
  dist/
    index.html                          Sidan och instruktionerna
    styles.css                          Sidans utseende
    app.js                              Formulär, urval och förhandsvisning
    labels.js                           Etikettdata, millimetermått, SVG och PDF
    fonts/                              Medföljande Carlito Bold och dess licens
    vendor/                             jsPDF 4.2.1 och dess licens
  tests/                                Tester och exempelgenerering
```

Se [kraven](docs/krav.md) och [hur verktyget är byggt](docs/utveckling.md) innan du ändrar utskriftslayouten. Word-mallarna är innehållsreferenser och ska **inte** styra det nya arkets mått eller antal rader.

## Utvecklartester

Med Node installerat:

```sh
node --test sites/seeds-etiketter/tests/labels.test.cjs
node sites/seeds-etiketter/tests/generate-sample.cjs
```

Det andra kommandot skriver en PDF med samtliga åtta ark och intervallet 025–048 till projektets ignorerade `tmp/pdfs/`-mapp. Kontrollera utskriftslayouten visuellt efter ändringar i mått, typsnitt eller etikettext.
