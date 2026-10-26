# Krav för SEEDS etikettverktyg

## Syfte

Användaren ska kunna skapa etiketter till studiens provtagning utan att redigera studienummer och utskriftslayout manuellt i Word. Det centrala flödet är första studienummer, val av ark och nedladdning av en utskriftsfärdig PDF.

## Bekräftade beslut

- Verktyget är en statisk HTML/JS-sida. Det kräver ingen Node-hosting.
- Etikettpapperet är A4 med tre kolumner och åtta rader. Etiketterna täcker hela arket utan mellanrum.
- Varje valt ark får exakt 24 på varandra följande studienummer, från det angivna startnumret.
- Alla valda ark använder samma nummerintervall. Nästa ark fortsätter alltså inte numreringen.
- Kryssrutor väljer exakt vilka ark som ska ingå i PDF:en.
- EDTA och Serum före inkludering ska uttryckligen ha texten `1. provtagning`.
- EDTA och Serum efter inkludering ska uttryckligen ha texten `2. provtagning`.
- Varje etikett får 5 mm vit kant på alla fyra sidor, så att även etiketter vid A4-arkets kant får symmetrisk färgyta inom skrivarens marginal.
- Texten vänsterställs och använder genomgående 10 punkter i fetstil, enligt Word-mallarna. Det ska finnas plats att skriva datum eller datum och klockslag för hand.
- Sidan ska förklara vad startnumret betyder och visa det aktuella intervallet, till exempel `025–048`.
- PDF:en ska skrivas ut på A4 i verklig storlek utan anpassning till sidan.

## Innehåll och färger

Samtliga etiketter har inledningen:

```text
Klinisk Mikrobiologi-provmottagning
SEEDS studien
Studie ID. 001
```

Numret ersätts för varje etikett. Minst tre siffror visas; nummer över 999 kapas inte.

| Grupp | Provtext | Datumrad | Färg | Hex |
| --- | --- | --- | --- | --- |
| Före inkludering | 1. provtagning EDTA | Datum och klockslag: | Lila | #CDA8E0 |
| Före inkludering | 1. provtagning Serum | Datum och klockslag: | Ljusgul | #FFF2B3 |
| Efter inkludering | 2. provtagning EDTA | Datum och klockslag: | Lila | #CDA8E0 |
| Efter inkludering | 2. provtagning Serum | Datum och klockslag: | Ljusgul | #FFF2B3 |
| Efter inkludering | Faeces | Datum och klockslag: | Ljusbrun | #E4C7A5 |
| Efter inkludering | Nasofarynx | Datum: | Ljusgrön | #D4EBC7 |
| Efter inkludering | Svalg | Datum: | Cyan | #BDECF1 |
| Efter inkludering | Likvor | Datum: | Ljuslila | #E8DDF5 |

Färgernas namn kommer från användarens specifikation; hexvärdena är verktygets valda pastellnyanser. Faktiskt färgresultat beror på skrivare och papper.

## Källor och avsiktliga rättningar

Innehållet kommer från de två `.docx`-filerna i `reference/`, före respektive efter inkludering. I dessa finns 30 studienummer med numrering nedåt i kolumner. Det nya formatet har 24 etiketter per ark och behåller den kolumnvisa ordningen.

`Feces` rättas till `Faeces`. Enstaka dubbla kolon och oavsiktliga blanksteg normaliseras. De fyra övriga provtyperna i efter-mallen har ingen provtagningssiffra i sin text; den skillnaden bevaras.

## Avgränsningar

Verktyget hanterar studienummer, inte personuppgifter eller en patientdatabas. Datum fylls i för hand. Det finns ingen lagring, kontohantering, servergenerering eller automatisk start av skrivaren.
