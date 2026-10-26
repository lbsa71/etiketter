(function (root, factory) {
  const api = factory(typeof module === 'object' && module.exports
    ? require('./fonts/carlito-bold.js') : root.SeedsLabelFont);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SeedsLabels = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (font) {
  'use strict';

  // Physical label stock is the authority. Never shrink this grid to printer margins.
  const PAGE = Object.freeze({ width: 210, height: 297, columns: 3, rows: 8,
    labelWidth: 70, labelHeight: 297 / 8, border: 5, count: 24 });
  const MAX_START = 999976;
  const TEXT = Object.freeze({ x: 7, firstBaseline: 9.2, lineHeight: 4.1,
    size: 10, bold: true, align: 'left', maxWidth: 56 });
  const SHEETS = Object.freeze([
    { id: 'edta-1', name: 'EDTA', group: 'before', sampling: 1, color: '#CDA8E0' },
    { id: 'serum-1', name: 'Serum', group: 'before', sampling: 1, color: '#FFF2B3' },
    { id: 'edta-2', name: 'EDTA', group: 'after', sampling: 2, color: '#CDA8E0' },
    { id: 'serum-2', name: 'Serum', group: 'after', sampling: 2, color: '#FFF2B3' },
    { id: 'faeces', name: 'Faeces', group: 'after', sampling: null, color: '#E4C7A5' },
    { id: 'nasofarynx', name: 'Nasofarynx', group: 'after', sampling: null, color: '#D4EBC7' },
    { id: 'svalg', name: 'Svalg', group: 'after', sampling: null, color: '#BDECF1' },
    { id: 'likvor', name: 'Likvor', group: 'after', sampling: null, color: '#E8DDF5' }
  ].map(sheet => Object.freeze({ ...sheet, dateLabel:
    ['Nasofarynx', 'Svalg', 'Likvor'].includes(sheet.name) ? 'Datum:' : 'Datum och klockslag:' })));

  function validateStart(value) {
    const text = String(value).trim();
    if (!/^\d+$/.test(text)) throw new Error('Ange ett helt studienummer, till exempel 001.');
    const number = Number(text);
    if (!Number.isSafeInteger(number) || number < 1 || number > MAX_START)
      throw new Error('Startnumret måste vara mellan 1 och 999976.');
    return number;
  }

  function formatStudyNumber(value) { return String(value).padStart(3, '0'); }
  function sheetTitle(sheet) {
    return sheet.name + (sheet.sampling ? ' · ' + sheet.sampling + '. provtagning' : '');
  }
  function getSheet(id) {
    const sheet = SHEETS.find(item => item.id === id);
    if (!sheet) throw new Error('Okänd arktyp.');
    return sheet;
  }
  function selection(sheetIds) {
    if (!Array.isArray(sheetIds) || !sheetIds.length) throw new Error('Välj minst ett ark.');
    if (new Set(sheetIds).size !== sheetIds.length) throw new Error('Samma ark kan bara väljas en gång.');
    const chosen = new Set(sheetIds);
    sheetIds.forEach(getSheet);
    return SHEETS.filter(sheet => chosen.has(sheet.id));
  }
  function labelLines(sheet, number) {
    // The reference labels use one consistent size, weight and left edge.
    return [
      'Klinisk Mikrobiologi-provmottagning',
      'SEEDS studien',
      'Studie ID. ' + formatStudyNumber(number),
      (sheet.sampling ? sheet.sampling + '. provtagning ' : '') + sheet.name,
      sheet.dateLabel
    ].map((text, index) => ({ text, x: TEXT.x,
      y: TEXT.firstBaseline + index * TEXT.lineHeight,
      size: TEXT.size, bold: TEXT.bold, align: TEXT.align }));
  }
  function labelPositions(startNumber) {
    const start = validateStart(startNumber);
    return Array.from({ length: PAGE.count }, (_, index) => ({
      number: start + index,
      x: Math.floor(index / PAGE.rows) * PAGE.labelWidth,
      y: (index % PAGE.rows) * PAGE.labelHeight
    }));
  }
  function createPdf({ startNumber, sheetIds }, PdfConstructor) {
    const start = validateStart(startNumber);
    const sheets = selection(sheetIds);
    const Constructor = PdfConstructor || globalThis.jspdf?.jsPDF;
    if (!Constructor) throw new Error('PDF-biblioteket kunde inte läsas in. Ladda om sidan.');
    const doc = new Constructor({ orientation: 'portrait', unit: 'mm',
      format: [PAGE.width, PAGE.height], precision: 6, compress: true });
    if (!font) throw new Error('Etikettens typsnitt kunde inte läsas in. Ladda om sidan.');
    doc.addFileToVFS(font.fileName, font.data);
    doc.addFont(font.fileName, font.family, 'bold');
    doc.setProperties({ title: 'SEEDS etiketter ' + formatStudyNumber(start) + '-' +
      formatStudyNumber(start + 23), subject: '24 etiketter per A4-ark', creator: 'SEEDS etikettverktyg' });
    doc.viewerPreferences({ PrintScaling: 'None', Duplex: 'Simplex' });
    sheets.forEach((sheet, pageIndex) => {
      if (pageIndex) doc.addPage([PAGE.width, PAGE.height], 'portrait');
      doc.setTextColor(0, 0, 0);
      for (const pos of labelPositions(start)) {
        doc.setFillColor(sheet.color);
        doc.rect(pos.x + PAGE.border, pos.y + PAGE.border,
          PAGE.labelWidth - PAGE.border * 2, PAGE.labelHeight - PAGE.border * 2, 'F');
        for (const line of labelLines(sheet, pos.number)) {
          doc.setFont(font.family, 'bold');
          doc.setFontSize(line.size);
          // Fail visibly rather than quietly emitting text outside its label.
          if (doc.getTextWidth(line.text) > TEXT.maxWidth)
            throw new Error('Etikettexten är för bred för etiketten.');
          doc.text(line.text, pos.x + line.x, pos.y + line.y, { align: line.align });
        }
      }
    });
    return doc;
  }
  function escapeXml(text) {
    return String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;',
      '"': '&quot;', "'": '&apos;' })[char]);
  }
  function createPreviewSvg({ startNumber, sheetId }) {
    const sheet = getSheet(sheetId);
    const labels = labelPositions(startNumber).map(pos => '<g transform="translate(' +
      pos.x + ' ' + pos.y + ')"><rect x="' + PAGE.border + '" y="' + PAGE.border +
      '" width="' + (PAGE.labelWidth - PAGE.border * 2) + '" height="' +
      (PAGE.labelHeight - PAGE.border * 2) + '" fill="' +
      sheet.color + '"/>' + labelLines(sheet, pos.number).map(line =>
      '<text x="' + line.x + '" y="' + line.y + '" text-anchor="start" font-family="SeedsLabelCarlito"' +
      ' font-size="' + line.size * 25.4 / 72 + '" font-weight="' + (line.bold ? '700' : '400') +
      '">' + escapeXml(line.text) + '</text>').join('') + '</g>').join('');
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 297" role="img"' +
      ' aria-label="Förhandsvisning av ' + escapeXml(sheetTitle(sheet)) + '">' +
      '<style>@font-face{font-family:SeedsLabelCarlito;src:url(data:font/ttf;base64,' +
      font.data + ') format("truetype");font-weight:700;font-style:normal}</style>' +
      '<rect width="210" height="297" fill="white"/>' + labels + '</svg>';
  }
  function fileName({ startNumber, sheetIds }) {
    const start = validateStart(startNumber);
    const sheets = selection(sheetIds);
    return 'SEEDS_' + formatStudyNumber(start) + '-' + formatStudyNumber(start + 23) +
      (sheets.length === 1 ? '_' + sheets[0].id : '') + '.pdf';
  }
  return Object.freeze({ PAGE, TEXT, MAX_START, SHEETS, validateStart, formatStudyNumber,
    sheetTitle, labelLines, labelPositions, createPdf, createPreviewSvg, fileName });
});
