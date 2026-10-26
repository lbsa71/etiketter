# Utveckling och utskriftslayout

## Körning och distribution

`sites/seeds-etiketter/dist/` är hela den körbara applikationen. Öppna `index.html` direkt eller servera mappen med valfri statisk webbserver. Relativa resurssökvägar och vanliga scripts används så att sidan även fungerar från `file://` utan en utvecklingsserver.

Det finns inget byggsteg. Ingen kod måste köras på en server, och sidans funktion behöver inga nätverksanrop. Alla ändringar görs direkt i källfilerna i `dist/`. Namnet `dist` anger vad som ska distribueras, inte att det finns en separat källa som kompileras dit.

## Ansvar i koden

`labels.js` äger etikettformat, provtyper, textrader, numrering och PDF/SVG-generering. Modulen fungerar både som globalen `SeedsLabels` i webbläsaren och som CommonJS-modul i Node-testerna. `app.js` kopplar formuläret till modulen och hanterar kryssrutor, validering, förhandsvisning och PDF-nedladdning.

`index.html` innehåller instruktioner och formulärets grundstruktur. `styles.css` styr bara webbgränssnittet. CSS används inte för PDF-layouten, så webbläsarens zoom och fönsterstorlek påverkar inte PDF:ens fysiska mått.

## Millimetermått

PDF:en använder millimeter och ett explicit sidformat på 210 × 297 mm. Positionen för etikett `i`, med början på noll, är:

```text
kolumn = floor(i / 8)
rad = i % 8
x = kolumn × 70 mm
y = rad × 37,125 mm
studienummer = startnummer + i
```

Färgytan ritas vid `(x + 5, y + 5)` med bredd 60 och höjd 27,125 mm. Arkets yttersta färgyta slutar därför vid x = 205 mm och y = 292 mm. Även inre etiketter har samma vita kant, vilket ger 10 mm vitt mellan två intilliggande färgytor.

Word-mallarna använder vänsterställd text och 10 punkter i fetstil genomgående. Verktyget följer denna storlek, vikt och justering. Texten börjar vid x + 7 mm, alltså 2 mm in i färgytan, med första baslinjen vid y + 9,2 mm och 4,1 mm radavstånd. Textblocket har samma placering på varje etikett.

Mallarnas tematypsnitt är Aptos. Verktyget levererar det öppna typsnittet Carlito Bold som ett liknande, fristående alternativ. Samma medföljande fontdata bäddas in i både PDF och SVG, så resultatet beror inte på datorns installerade typsnitt. Alla rader är 10 punkter; studienumret förstoras inte och ingen rad centreras. `dist/fonts/` innehåller fonten, dess JavaScript-representation och SIL Open Font License. Fontfilen i JavaScript behövs för att verktyget ska fungera direkt från disk utan nätverksanrop.

PDF:en innehåller inga skärlinjer eller sidhuvuden. Den begär `PrintScaling: None` och enkelsidig utskrift i visningsprogrammets inställningar. Användaren behöver fortfarande välja 100 % / verklig storlek i utskriftsdialogen.

## Inmatning och urval

Startnumret ska vara ett positivt heltal från 1 till 999976. Därmed blir sista etiketten högst 999999. Visning och PDF fyller ut till minst tre siffror. Ogiltig inmatning och tomt arkval blockerar nedladdningen.

En vald provtyp ger exakt en sida med 24 etiketter. PDF-sidorna följer ordningen i `SHEETS`, oavsett ordningen som användaren markerar kryssrutorna i. Ett ark som avmarkeras tas också bort från förhandsvisningens lista.

## Ändringar och kontroll

Efter ändringar i etikettinnehåll eller mått:

1. Kör `node --test sites/seeds-etiketter/tests/labels.test.cjs` från repots rot.
2. Skapa exempel-PDF med `node sites/seeds-etiketter/tests/generate-sample.cjs`.
3. Kontrollera alla åtta sidor visuellt. Kontrollera särskilt svenska tecken, `Faeces`, provtagning 1/2 och första/sista studienummer.
4. Kontrollera i webbläsaren att startnumret uppdaterar intervallet, att kryssrutorna styr PDF-sidorna och att sidan fungerar även på smal skärm.
5. Kontrollera vid fysisk provutskrift att utskriftsdialogen använder A4 och 100 % utan sidpassning.

jsPDF är låst till version 4.2.1 och finns i `dist/vendor/` tillsammans med licensen. Vid uppgradering ska både bibliotek och licens uppdateras, följt av tester och visuell PDF-kontroll.

## Hosting

För valfri statisk hosting behövs bara innehållet i `dist/`. Sites-specifik konfiguration i `.openai/hosting.json` behövs enbart för Sites och skapar inget beroende på en Node-server. Ursprungliga Word-mallar och intern dokumentation ingår inte i sidans körbara filer.
