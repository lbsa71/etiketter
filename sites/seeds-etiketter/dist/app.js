(function () {
  'use strict';
  const api = window.SeedsLabels;
  const $ = id => document.getElementById(id);
  const input = $('start-number');
  const form = $('label-form');
  let zoomed = false;
  let currentStart = 1;
  const groups = [
    { id: 'before', title: '1. provtagning', subtitle: 'Före inkludering' },
    { id: 'after', title: '2. provtagning', subtitle: 'Efter inkludering' }
  ];
  $('sheet-groups').innerHTML = groups.map(group => '<fieldset><legend><strong>' +
    group.title + '</strong><span>' + group.subtitle + '</span></legend><div class="sheet-list">' +
    api.SHEETS.filter(sheet => sheet.group === group.id).map(sheet =>
      '<label class="sheet-option"><input type="checkbox" name="sheet" value="' + sheet.id +
      '" checked><span class="swatch" style="--swatch:' + sheet.color + '"></span><span>' +
      sheet.name + '</span><span class="sheet-count">24 st</span></label>').join('') + '</div></fieldset>').join('');

  function selectedIds() {
    return Array.from(form.querySelectorAll('input[name="sheet"]:checked'), node => node.value);
  }
  function updatePreview() {
    if (!$('preview-sheet').value || input.getAttribute('aria-invalid') === 'true') return;
    $('preview').innerHTML = api.createPreviewSvg({ startNumber: currentStart,
      sheetId: $('preview-sheet').value });
    $('preview').classList.toggle('zoomed', zoomed);
    $('preview').querySelector('svg').setAttribute('viewBox', zoomed ? '0 0 70 37.125' : '0 0 210 297');
    $('preview-description').textContent = zoomed ? 'Första etiketten på arket' : 'Ett ark med 24 etiketter';
  }
  function update() {
    let valid = true;
    try {
      currentStart = api.validateStart(input.value);
      $('number-error').hidden = true;
      input.removeAttribute('aria-invalid');
      $('number-range').textContent = api.formatStudyNumber(currentStart) + '–' +
        api.formatStudyNumber(currentStart + 23);
    } catch (error) {
      valid = false;
      $('number-error').textContent = error.message;
      $('number-error').hidden = false;
      input.setAttribute('aria-invalid', 'true');
      $('number-range').textContent = 'ange ett giltigt startnummer';
    }
    const ids = selectedIds();
    const previous = $('preview-sheet').value;
    $('preview-sheet').innerHTML = api.SHEETS.filter(sheet => ids.includes(sheet.id)).map(sheet =>
      '<option value="' + sheet.id + '">' + api.sheetTitle(sheet) + '</option>').join('');
    if (ids.includes(previous)) $('preview-sheet').value = previous;
    $('preview-sheet').disabled = !ids.length;
    $('zoom').disabled = !ids.length || !valid;
    $('download').disabled = !valid || !ids.length;
    $('preview').hidden = !valid || !ids.length;
    $('preview-empty').hidden = valid && Boolean(ids.length);
    $('preview-empty').textContent = !valid ? 'Ange ett giltigt startnummer för att se etiketterna.' :
      'Välj minst ett ark för att se förhandsvisningen.';
    $('selection-summary').textContent = ids.length ? ids.length + (ids.length === 1 ? ' ark' : ' ark') +
      ' · ' + ids.length * 24 + ' etiketter · ' + ids.length + (ids.length === 1 ? ' PDF-sida' : ' PDF-sidor') :
      'Välj minst ett ark att skriva ut.';
    $('toggle-all').textContent = ids.length === api.SHEETS.length ? 'Avmarkera alla' : 'Välj alla';
    $('download-status').textContent = '';
    if (valid && ids.length) updatePreview();
  }
  input.addEventListener('input', update);
  input.addEventListener('blur', () => {
    if (input.getAttribute('aria-invalid') !== 'true') input.value = api.formatStudyNumber(currentStart);
  });
  $('sheet-groups').addEventListener('change', update);
  $('toggle-all').addEventListener('click', () => {
    const check = selectedIds().length !== api.SHEETS.length;
    form.querySelectorAll('input[name="sheet"]').forEach(node => { node.checked = check; });
    update();
  });
  $('preview-sheet').addEventListener('change', updatePreview);
  $('zoom').addEventListener('click', () => {
    zoomed = !zoomed;
    $('zoom').textContent = zoomed ? 'Visa hela arket' : 'Visa en etikett';
    $('zoom').setAttribute('aria-pressed', String(zoomed));
    updatePreview();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if ($('download').disabled) return;
    try {
      const options = { startNumber: input.value, sheetIds: selectedIds() };
      api.createPdf(options).save(api.fileName(options));
      $('download-status').textContent = 'PDF:en är skapad. Skriv ut i 100 % / verklig storlek.';
    } catch (error) {
      $('download-status').textContent = 'PDF:en kunde inte skapas. ' + error.message;
    }
  });
  update();
})();
