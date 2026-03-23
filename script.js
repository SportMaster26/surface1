document.addEventListener('DOMContentLoaded', () => {
  const COVERAGE_RESURFACER = 60; // sq ft per gallon
  const COVERAGE_BASE = 80;       // sq ft per gallon

  const COLOR_HEX = {
    'Light Blue': '#87CEEB',
    'Blue': '#2563EB',
    'Light Green': '#90EE90',
    'Dark Green': '#006400',
    'Gray': '#808080',
    'Red': '#DC2626',
  };

  let zoneCounter = 1;
  const zonesContainer = document.getElementById('zones-container');
  const addZoneBtn = document.getElementById('add-zone-btn');
  const calculateBtn = document.getElementById('calculate-btn');
  const resultsSection = document.getElementById('results-section');
  const zoneTemplate = document.getElementById('zone-template');

  // Event delegation on zones container
  zonesContainer.addEventListener('change', (e) => {
    if (e.target.classList.contains('input-mode-radio')) {
      const card = e.target.closest('.zone-card');
      toggleInputMode(card, e.target.value);
    }
  });

  zonesContainer.addEventListener('input', (e) => {
    if (e.target.classList.contains('dim-length') || e.target.classList.contains('dim-width')) {
      computeAreaFromDimensions(e.target.closest('.zone-card'));
    }
    // Clear error state on any input
    const card = e.target.closest('.zone-card');
    if (card) {
      card.classList.remove('error');
      const err = card.querySelector('.zone-error');
      if (err) err.remove();
    }
  });

  zonesContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-remove-zone')) {
      removeZone(e.target.closest('.zone-card'));
    }
  });

  addZoneBtn.addEventListener('click', addZone);
  calculateBtn.addEventListener('click', calculate);

  function addZone() {
    zoneCounter++;
    const clone = zoneTemplate.content.cloneNode(true);
    const card = clone.querySelector('.zone-card');
    card.dataset.zoneId = zoneCounter;

    // Set unique radio name
    const radios = card.querySelectorAll('.input-mode-radio');
    radios.forEach(r => r.name = 'mode-' + zoneCounter);

    // Set zone name
    card.querySelector('.zone-name').value = 'Zone ' + zoneCounter;

    zonesContainer.appendChild(clone);
    updateRemoveButtons();

    // Scroll to new zone
    const cards = zonesContainer.querySelectorAll('.zone-card');
    cards[cards.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function removeZone(card) {
    card.remove();
    updateRemoveButtons();
    renumberZones();
  }

  function updateRemoveButtons() {
    const cards = zonesContainer.querySelectorAll('.zone-card');
    cards.forEach(card => {
      const btn = card.querySelector('.btn-remove-zone');
      btn.style.display = cards.length > 1 ? '' : 'none';
    });
  }

  function renumberZones() {
    const cards = zonesContainer.querySelectorAll('.zone-card');
    cards.forEach((card, i) => {
      const nameInput = card.querySelector('.zone-name');
      // Only renumber if name matches the default pattern
      if (/^Zone \d+$/.test(nameInput.value)) {
        nameInput.value = 'Zone ' + (i + 1);
      }
    });
  }

  function toggleInputMode(card, mode) {
    const sqftDiv = card.querySelector('.sqft-input');
    const dimDiv = card.querySelector('.dimensions-input');
    if (mode === 'sqft') {
      sqftDiv.style.display = '';
      dimDiv.style.display = 'none';
    } else {
      sqftDiv.style.display = 'none';
      dimDiv.style.display = '';
      computeAreaFromDimensions(card);
    }
  }

  function computeAreaFromDimensions(card) {
    const length = parseFloat(card.querySelector('.dim-length').value) || 0;
    const width = parseFloat(card.querySelector('.dim-width').value) || 0;
    const area = length * width;
    card.querySelector('.area-display').textContent = area.toLocaleString();
  }

  function getZoneData() {
    const cards = zonesContainer.querySelectorAll('.zone-card');
    const zones = [];
    let valid = true;

    // Clear previous errors
    cards.forEach(card => {
      card.classList.remove('error');
      const err = card.querySelector('.zone-error');
      if (err) err.remove();
    });

    cards.forEach(card => {
      const mode = card.querySelector('.input-mode-radio:checked').value;
      let sqft;

      if (mode === 'sqft') {
        sqft = parseFloat(card.querySelector('.sqft-value').value) || 0;
      } else {
        const length = parseFloat(card.querySelector('.dim-length').value) || 0;
        const width = parseFloat(card.querySelector('.dim-width').value) || 0;
        sqft = length * width;
      }

      const color = card.querySelector('.color-dropdown').value;
      const name = card.querySelector('.zone-name').value;

      if (sqft <= 0) {
        valid = false;
        card.classList.add('error');
        const errMsg = document.createElement('p');
        errMsg.className = 'zone-error';
        errMsg.textContent = 'Please enter a valid area greater than 0.';
        card.querySelector('.input-fields').appendChild(errMsg);
      }

      zones.push({ sqft, color, name });
    });

    return valid ? zones : null;
  }

  function calculate() {
    const zones = getZoneData();
    if (!zones) return;

    const totalSqFt = zones.reduce((sum, z) => sum + z.sqft, 0);
    const resurfacerGallons = Math.ceil(totalSqFt / COVERAGE_RESURFACER);

    // Accumulate area per color
    const colorAreas = {};
    zones.forEach(z => {
      colorAreas[z.color] = (colorAreas[z.color] || 0) + z.sqft;
    });

    // Compute base gallons and tint packs per color (round up each)
    const colorGallons = {};
    let totalBaseGallons = 0;
    for (const color in colorAreas) {
      const gallons = Math.ceil(colorAreas[color] / COVERAGE_BASE);
      colorGallons[color] = gallons;
      totalBaseGallons += gallons;
    }

    displayResults(totalSqFt, resurfacerGallons, totalBaseGallons, colorGallons, colorAreas);
  }

  function displayResults(totalSqFt, resurfacerGallons, totalBaseGallons, colorGallons, colorAreas) {
    document.getElementById('result-total-area').textContent = totalSqFt.toLocaleString() + ' sq ft';
    document.getElementById('result-resurfacer').textContent = resurfacerGallons.toLocaleString() + ' gallons';
    document.getElementById('result-base').textContent = totalBaseGallons.toLocaleString() + ' gallons';

    // Build tint pack rows
    const tintContainer = document.getElementById('result-tint-packs');
    tintContainer.innerHTML = '';

    for (const color in colorGallons) {
      const row = document.createElement('div');
      row.className = 'tint-row';

      const swatch = document.createElement('span');
      swatch.className = 'color-swatch';
      swatch.style.backgroundColor = COLOR_HEX[color] || '#ccc';

      const name = document.createElement('span');
      name.className = 'tint-color-name';
      name.textContent = color;

      const qty = document.createElement('span');
      qty.className = 'tint-qty';
      qty.textContent = colorGallons[color] + ' packs';

      const area = document.createElement('span');
      area.className = 'tint-area';
      area.textContent = '(' + colorAreas[color].toLocaleString() + ' sq ft)';

      row.appendChild(swatch);
      row.appendChild(name);
      row.appendChild(qty);
      row.appendChild(area);
      tintContainer.appendChild(row);
    }

    // Show results
    resultsSection.style.display = '';
    // Trigger reflow for transition
    void resultsSection.offsetHeight;
    resultsSection.classList.add('visible');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});
