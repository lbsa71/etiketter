const assert = require('node:assert/strict');
const test = require('node:test');
const labels = require('../dist/labels.js');
const { jsPDF } = require('../dist/vendor/jspdf.umd.min.js');

test('24 consecutive IDs fill columns downwards on the physical 3 × 8 stock', () => {
  const positions = labels.labelPositions('025');
  assert.equal(positions.length, 24);
  assert.deepEqual(positions.map(p => p.number), Array.from({ length: 24 }, (_, i) => 25 + i));
  assert.deepEqual(positions[0], { number: 25, x: 0, y: 0 });
  assert.deepEqual(positions[7], { number: 32, x: 0, y: 259.875 });
  assert.deepEqual(positions[8], { number: 33, x: 70, y: 0 });
  assert.deepEqual(positions[23], { number: 48, x: 140, y: 259.875 });
  for (const p of positions) {
    assert(p.x + 5 >= 5 && p.x + 65 <= 205);
    assert(p.y + 5 >= 5 && p.y + 32.125 <= 292);
  }
});

test('sampling text and date fields preserve the distinction in the references', () => {
  const lines = id => labels.labelLines(labels.SHEETS.find(s => s.id === id), 1).map(l => l.text);
  assert.equal(lines('edta-1')[3], '1. provtagning EDTA');
  assert.equal(lines('serum-1')[3], '1. provtagning Serum');
  assert.equal(lines('edta-2')[3], '2. provtagning EDTA');
  assert.equal(lines('serum-2')[3], '2. provtagning Serum');
  assert.equal(lines('faeces')[3], 'Faeces');
  assert.equal(lines('faeces')[4], 'Datum och klockslag:');
  for (const id of ['likvor', 'nasofarynx', 'svalg']) assert.equal(lines(id)[4], 'Datum:');
});

test('reference typography stays left aligned, bold and 10 pt on every line', () => {
  for (const sheet of labels.SHEETS) {
    const lines = labels.labelLines(sheet, 999999);
    assert.equal(lines.length, 5);
    for (const line of lines) {
      assert.equal(line.x, 7);
      assert.equal(line.align, 'left');
      assert.equal(line.size, 10);
      assert.equal(line.bold, true);
    }
    for (let i = 1; i < lines.length; i++)
      assert(Math.abs(lines[i].y - lines[i - 1].y - 4.1) < 0.000001);
  }
  const svg = labels.createPreviewSvg({ startNumber: 1, sheetId: 'edta-1' });
  assert.match(svg, /text-anchor="start"/);
  assert.doesNotMatch(svg, /text-anchor="middle"/);
});

test('bad start numbers and invalid selections cannot create misleading labels', () => {
  for (const value of ['', ' ', '1.5', '-1', '0', '1e3', '2x', '999977', NaN, Infinity])
    assert.throws(() => labels.validateStart(value));
  assert.equal(labels.validateStart('001'), 1);
  assert.equal(labels.validateStart('999976'), 999976);
  assert.equal(labels.formatStudyNumber(1000), '1000');
  for (const sheetIds of [[], ['unknown'], ['edta-1', 'edta-1'], null])
    assert.throws(() => labels.createPdf({ startNumber: 1, sheetIds }, jsPDF));
});

test('PDF has precisely the selected pages, exact A4 and no automatic print scaling', () => {
  const doc = labels.createPdf({ startNumber: 999976, sheetIds: ['serum-2', 'edta-1'] }, jsPDF);
  assert.equal(doc.getNumberOfPages(), 2);
  assert(Math.abs(doc.internal.pageSize.getWidth() - 210) < 0.001);
  assert(Math.abs(doc.internal.pageSize.getHeight() - 297) < 0.001);
  assert.match(doc.output(), /\/PrintScaling \/None/);
  assert.match(doc.output(), /\/Duplex \/Simplex/);
  assert.equal(labels.fileName({ startNumber: 25, sheetIds: ['edta-2'] }), 'SEEDS_025-048_edta-2.pdf');
});

test('preview uses the same full sheet, correct sampling and final ID', () => {
  const svg = labels.createPreviewSvg({ startNumber: 25, sheetId: 'serum-2' });
  assert.match(svg, /viewBox="0 0 210 297"/);
  assert.equal((svg.match(/2\. provtagning Serum/g) || []).length, 24);
  assert.match(svg, /Studie ID\. 025/);
  assert.match(svg, /Studie ID\. 048/);
  assert.doesNotMatch(svg, /1\. provtagning/);
});
