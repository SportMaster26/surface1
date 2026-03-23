/* ──────────────────────────────────────────────
   Surface 1 Sport Coatings — Product Calculator
   ────────────────────────────────────────────── */

const SQFT_PER_SQYD = 9;

// ── Coverage rates (sq ft per gallon) ──
const COVERAGE = {
  resurfacer: { concrete: 60, asphalt: 46, existingConcrete: 60, existingAsphalt: 60 },
  base:       { concrete: 80, asphalt: 80, existingConcrete: 80, existingAsphalt: 80 }
};

// ── Color options ──
const colorOptions = [
  { name: 'Not Selected' },
  { name: 'Light Blue' },
  { name: 'Blue' },
  { name: 'Light Green' },
  { name: 'Dark Green' },
  { name: 'Red' },
  { name: 'Gray' }
];

const colorHexMap = {
  'Not Selected': '#f0f0f0',
  'Light Blue': '#486186',
  'Blue': '#2D3B5B',
  'Light Green': '#445E34',
  'Dark Green': '#3B4133',
  'Red': '#6B3736',
  'Gray': '#6D6D74'
};

function getColorHex(name) {
  return colorHexMap[name] || '#d5d5d5';
}

// ── Crack filler reference ──
const crackFiller = { product: 'Acrylic Crack Filler', rateMin: 75, rateMax: 150, width: 'For Cracks up to 1" wide' };

// ── Court type zone definitions ──
const courtDefs = {
  tennis: {
    label: 'Tennis Court',
    defaultWidth: 60, defaultLength: 120,
    zones: [
      { name: 'Outside Area', sqftPerCourt: null },
      { name: 'Playing Area', sqftPerCourt: 2808 }
    ],
    stripingGallons: 1
  },
  pickleball: {
    label: 'Pickleball Court',
    defaultWidth: 30, defaultLength: 60,
    zones: [
      { name: 'Total Area', sqftPerCourt: null },
      { name: 'Service Area', sqftPerCourt: 600 },
      { name: 'Kitchen Area', sqftPerCourt: 280 }
    ],
    stripingGallons: 1
  },
  basketballFull: {
    label: 'Basketball Full Court',
    defaultWidth: 50, defaultLength: 84,
    zones: [
      { name: 'Court', sqftPerCourt: 4200 },
      { name: 'Border', sqftPerCourt: null },
      { name: 'Three Point Area', sqftPerCourt: 1224 },
      { name: 'Key', sqftPerCourt: 456 },
      { name: 'Free Throw Circle', sqftPerCourt: 113 },
      { name: 'Center Court Circle', sqftPerCourt: 113 }
    ],
    stripingGallons: 1
  },
  basketballHalf: {
    label: 'Basketball Half Court',
    defaultWidth: 50, defaultLength: 47,
    zones: [
      { name: 'Court', sqftPerCourt: 2100 },
      { name: 'Border', sqftPerCourt: null },
      { name: 'Three Point Area', sqftPerCourt: 612 },
      { name: 'Key', sqftPerCourt: 228 },
      { name: 'Free Throw Circle', sqftPerCourt: 57 }
    ],
    stripingGallons: 1
  },
  totalArea: {
    label: 'Total Area (Custom)',
    defaultWidth: 50, defaultLength: 64,
    zones: [
      { name: 'Total Area', sqftPerCourt: null }
    ],
    stripingGallons: 0
  }
};

// ────────────────────────────────────────────────────────
// SVG COURT PREVIEWS
// ────────────────────────────────────────────────────────

function renderCourtPreview(courtType, zoneColors) {
  const colors = zoneColors.map(c => getColorHex(c));
  switch (courtType) {
    case 'tennis': return renderTennisPreview(colors);
    case 'pickleball': return renderPickleballPreview(colors);
    case 'basketballFull': return renderBasketballFullPreview(colors);
    case 'basketballHalf': return renderBasketballHalfPreview(colors);
    default: return renderTotalAreaPreview(colors);
  }
}

function renderTennisPreview(c) {
  const out = c[0] || '#d5d5d5';
  const play = c[1] || '#d5d5d5';
  return `<svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg" class="court-svg">
    <rect x="0" y="0" width="300" height="150" fill="${out}" rx="3"/>
    <rect x="52.5" y="30" width="195" height="90" fill="${play}"/>
    <rect x="52.5" y="30" width="195" height="90" fill="none" stroke="#fff" stroke-width="2"/>
    <line x1="52.5" y1="41" x2="247.5" y2="41" stroke="#fff" stroke-width="1"/>
    <line x1="52.5" y1="109" x2="247.5" y2="109" stroke="#fff" stroke-width="1"/>
    <line x1="150" y1="27" x2="150" y2="123" stroke="#fff" stroke-width="1.5" stroke-dasharray="4,3"/>
    <line x1="97.5" y1="41" x2="97.5" y2="109" stroke="#fff" stroke-width="1.5"/>
    <line x1="202.5" y1="41" x2="202.5" y2="109" stroke="#fff" stroke-width="1.5"/>
    <line x1="97.5" y1="75" x2="202.5" y2="75" stroke="#fff" stroke-width="1.5"/>
    <line x1="52.5" y1="75" x2="56" y2="75" stroke="#fff" stroke-width="1.5"/>
    <line x1="244" y1="75" x2="247.5" y2="75" stroke="#fff" stroke-width="1.5"/>
  </svg>`;
}

function renderPickleballPreview(c) {
  const total = c[0] || '#d5d5d5';
  const service = c[1] || '#d5d5d5';
  const kitchen = c[2] || '#d5d5d5';
  return `<svg viewBox="0 0 300 160" xmlns="http://www.w3.org/2000/svg" class="court-svg">
    <rect x="0" y="0" width="300" height="160" fill="${total}" rx="3"/>
    <rect x="30" y="25" width="82" height="110" fill="${service}"/>
    <rect x="188" y="25" width="82" height="110" fill="${service}"/>
    <rect x="112" y="25" width="76" height="110" fill="${kitchen}"/>
    <rect x="30" y="25" width="240" height="110" fill="none" stroke="#fff" stroke-width="2"/>
    <line x1="112" y1="25" x2="112" y2="135" stroke="#fff" stroke-width="1.5"/>
    <line x1="188" y1="25" x2="188" y2="135" stroke="#fff" stroke-width="1.5"/>
    <line x1="150" y1="25" x2="150" y2="135" stroke="#fff" stroke-width="1" stroke-dasharray="4,3"/>
    <line x1="30" y1="80" x2="112" y2="80" stroke="#fff" stroke-width="1.5"/>
    <line x1="188" y1="80" x2="270" y2="80" stroke="#fff" stroke-width="1.5"/>
  </svg>`;
}

function renderBasketballFullPreview(c) {
  const court  = c[0] || '#d5d5d5';
  const border = c[1] || '#d5d5d5';
  const three  = c[2] || '#d5d5d5';
  const key    = c[3] || '#d5d5d5';
  const ft     = c[4] || '#d5d5d5';
  const center = c[5] || '#d5d5d5';
  return `<svg viewBox="0 0 340 200" xmlns="http://www.w3.org/2000/svg" class="court-svg">
    <rect x="0" y="0" width="340" height="200" fill="${border}" rx="3"/>
    <rect x="25" y="15" width="290" height="170" fill="${court}"/>
    <rect x="25" y="15" width="290" height="170" fill="none" stroke="#fff" stroke-width="2"/>
    <line x1="170" y1="15" x2="170" y2="185" stroke="#fff" stroke-width="1.5"/>
    <path d="M 25,30 L 58,30 A 58,70 0 0,1 58,170 L 25,170 Z" fill="${three}" stroke="#fff" stroke-width="1.5"/>
    <path d="M 315,30 L 282,30 A 58,70 0 0,0 282,170 L 315,170 Z" fill="${three}" stroke="#fff" stroke-width="1.5"/>
    <rect x="25" y="62" width="55" height="76" fill="${key}" stroke="#fff" stroke-width="1.5"/>
    <rect x="260" y="62" width="55" height="76" fill="${key}" stroke="#fff" stroke-width="1.5"/>
    <circle cx="80" cy="100" r="18" fill="${ft}" stroke="#fff" stroke-width="1.5"/>
    <line x1="80" y1="62" x2="80" y2="138" stroke="#fff" stroke-width="1.5"/>
    <circle cx="260" cy="100" r="18" fill="${ft}" stroke="#fff" stroke-width="1.5"/>
    <line x1="260" y1="62" x2="260" y2="138" stroke="#fff" stroke-width="1.5"/>
    <circle cx="170" cy="100" r="18" fill="${center}" stroke="#fff" stroke-width="1.5"/>
    <line x1="33" y1="92" x2="33" y2="108" stroke="#fff" stroke-width="2"/>
    <circle cx="38" cy="100" r="4" fill="none" stroke="#fff" stroke-width="1.2"/>
    <line x1="307" y1="92" x2="307" y2="108" stroke="#fff" stroke-width="2"/>
    <circle cx="302" cy="100" r="4" fill="none" stroke="#fff" stroke-width="1.2"/>
  </svg>`;
}

function renderBasketballHalfPreview(c) {
  const court  = c[0] || '#d5d5d5';
  const border = c[1] || '#d5d5d5';
  const three  = c[2] || '#d5d5d5';
  const key    = c[3] || '#d5d5d5';
  const ft     = c[4] || '#d5d5d5';
  return `<svg viewBox="0 0 220 200" xmlns="http://www.w3.org/2000/svg" class="court-svg">
    <rect x="0" y="0" width="220" height="200" fill="${border}" rx="3"/>
    <rect x="15" y="15" width="190" height="170" fill="${court}"/>
    <rect x="15" y="15" width="190" height="170" fill="none" stroke="#fff" stroke-width="2"/>
    <path d="M 15,30 L 48,30 A 58,70 0 0,1 48,170 L 15,170 Z" fill="${three}" stroke="#fff" stroke-width="1.5"/>
    <rect x="15" y="62" width="55" height="76" fill="${key}" stroke="#fff" stroke-width="1.5"/>
    <circle cx="70" cy="100" r="18" fill="${ft}" stroke="#fff" stroke-width="1.5"/>
    <line x1="70" y1="62" x2="70" y2="138" stroke="#fff" stroke-width="1.5"/>
    <line x1="205" y1="15" x2="205" y2="185" stroke="#fff" stroke-width="1" stroke-dasharray="4,3"/>
    <line x1="23" y1="92" x2="23" y2="108" stroke="#fff" stroke-width="2"/>
    <circle cx="28" cy="100" r="4" fill="none" stroke="#fff" stroke-width="1.2"/>
  </svg>`;
}

function renderTotalAreaPreview(c) {
  const total = c[0] || '#d5d5d5';
  return `<svg viewBox="0 0 260 180" xmlns="http://www.w3.org/2000/svg" class="court-svg">
    <rect x="0" y="0" width="260" height="180" fill="${total}" rx="3"/>
    <rect x="10" y="10" width="240" height="160" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="6,4"/>
  </svg>`;
}

function renderLegend(zones, zoneColors) {
  return zones.map((zone, i) => {
    const colorName = zoneColors[i] || 'Not Selected';
    const hex = getColorHex(colorName);
    return `<span class="legend-item"><i class="legend-swatch" style="background:${hex}"></i>${zone.name}</span>`;
  }).join('');
}

// ────────────────────────────────────────────────────────
// CALCULATION LOGIC
// ────────────────────────────────────────────────────────

function getHiddenZoneIndices(courtType, singleCourtSqFt) {
  const hidden = [];
  const def = courtDefs[courtType];
  if (courtType === 'pickleball' && singleCourtSqFt <= 880) {
    def.zones.forEach((z, i) => { if (z.name === 'Total Area') hidden.push(i); });
  }
  if (courtType === 'tennis' && singleCourtSqFt <= 2808) {
    def.zones.forEach((z, i) => { if (z.name === 'Outside Area') hidden.push(i); });
  }
  return hidden;
}

function computeZoneAreas(courtType, totalSqFt, numCourts, singleCourtSqFt) {
  const def = courtDefs[courtType];
  const hidden = getHiddenZoneIndices(courtType, singleCourtSqFt || (totalSqFt / (numCourts || 1)));
  const zones = [];
  for (let i = 0; i < def.zones.length; i++) {
    if (hidden.includes(i)) continue;
    const zone = def.zones[i];
    let areaSqFt;
    if (zone.sqftPerCourt !== null) {
      areaSqFt = Math.ceil(zone.sqftPerCourt * numCourts);
    } else {
      if (courtType === 'tennis') {
        areaSqFt = Math.max(0, totalSqFt - 2808 * numCourts);
      } else if (courtType === 'basketballFull') {
        areaSqFt = Math.max(0, totalSqFt - 4200 * numCourts);
      } else if (courtType === 'basketballHalf') {
        areaSqFt = Math.max(0, totalSqFt - 2100 * numCourts);
      } else {
        areaSqFt = totalSqFt;
      }
    }
    zones.push({ name: zone.name, sqft: areaSqFt, sqyd: areaSqFt / SQFT_PER_SQYD, zoneIndex: i });
  }
  return zones;
}

function getEntrySqFt(entry) {
  let singleCourtSqFt = 0;
  if (entry.areaInputMode === 'wxl') {
    singleCourtSqFt = entry.width * entry.length;
  } else {
    singleCourtSqFt = entry.areaValue;
  }
  return singleCourtSqFt * (entry.numCourts || 1);
}

function calculateEntry(entry, surfaceType) {
  const totalSqFt = getEntrySqFt(entry);
  const singleCourtSqFt = totalSqFt / (entry.numCourts || 1);
  const zoneAreas = computeZoneAreas(entry.courtType, totalSqFt, entry.numCourts, singleCourtSqFt);

  // Patch Binder: concrete surfaces only
  const needsPatchBinder = surfaceType === 'concrete' || surfaceType === 'existingConcrete';
  const patchBinderGallons = needsPatchBinder ? Math.ceil(totalSqFt / 300) : 0;

  // Resurfacer: total area
  const resurfacerRate = COVERAGE.resurfacer[surfaceType] || 60;
  const resurfacerCoats = (surfaceType === 'asphalt' || surfaceType === 'existingAsphalt') ? 2 : 1;
  const resurfacerGallons = Math.ceil((totalSqFt / resurfacerRate) * resurfacerCoats);

  // Sport Coating Base per zone
  const baseRate = COVERAGE.base[surfaceType] || 80;
  const baseCoats = 2;
  const zones = [];
  const colorTotals = {};

  zoneAreas.forEach(zone => {
    const colorName = entry.zoneColors[zone.zoneIndex] || 'Not Selected';
    const gallons = Math.ceil((zone.sqft / baseRate) * baseCoats);
    zones.push({
      name: zone.name,
      sqft: zone.sqft,
      colorName,
      baseGallons: gallons,
      baseCoats
    });
    if (colorName !== 'Not Selected') {
      if (!colorTotals[colorName]) colorTotals[colorName] = { area: 0, packs: 0 };
      colorTotals[colorName].area += zone.sqft;
      colorTotals[colorName].packs += Math.ceil(gallons / 5);
    }
  });

  // Striping
  const def = courtDefs[entry.courtType];
  const stripingGallons = def.stripingGallons > 0
    ? Math.ceil(entry.numCourts * def.stripingGallons / 2)
    : 0;

  return {
    label: def.label,
    courtType: entry.courtType,
    numCourts: entry.numCourts,
    totalSqFt,
    patchBinderGallons,
    needsPatchBinder,
    resurfacerGallons,
    resurfacerCoats,
    zones,
    colorTotals,
    stripingGallons,
    zoneAreas
  };
}

// ────────────────────────────────────────────────────────
// UI STATE & RENDERING
// ────────────────────────────────────────────────────────

const $ = id => document.getElementById(id);

let courtEntries = [];
let nextEntryId = 1;

function fmt(n) {
  if (typeof n !== 'number' || isNaN(n)) return n;
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n);
}

function createEntry(courtType) {
  courtType = courtType || 'tennis';
  const def = courtDefs[courtType];
  return {
    id: nextEntryId++,
    courtType,
    numCourts: 1,
    areaInputMode: 'wxl',
    width: def.defaultWidth,
    length: def.defaultLength,
    areaValue: def.defaultWidth * def.defaultLength,
    crackFiller: false,
    crackLinearFeet: 0,
    zoneColors: def.zones.map((z, i) => i === 0 ? 'Light Blue' : 'Blue')
  };
}

function readEntryFromDOM(entry) {
  const el = document.querySelector(`[data-entry-id="${entry.id}"]`);
  if (!el) return entry;
  entry.courtType = el.querySelector('.entry-court-type').value;
  entry.numCourts = Math.max(1, parseInt(el.querySelector('.entry-num-courts').value, 10) || 1);
  entry.areaInputMode = el.querySelector('.entry-area-mode').value;
  if (entry.areaInputMode === 'wxl') {
    entry.width = parseFloat(el.querySelector('.entry-width').value) || 0;
    entry.length = parseFloat(el.querySelector('.entry-length').value) || 0;
  } else {
    entry.areaValue = parseFloat(el.querySelector('.entry-area-value').value) || 0;
  }
  entry.crackFiller = el.querySelector('.entry-crack-filler').checked;
  entry.crackLinearFeet = parseFloat(el.querySelector('.entry-crack-feet').value) || 0;
  const colorSels = el.querySelectorAll('.entry-zone-color');
  colorSels.forEach(s => {
    const zi = parseInt(s.dataset.zone, 10);
    entry.zoneColors[zi] = s.value;
  });
  return entry;
}

function buildColorOptions(selectedValue) {
  return colorOptions.map(c =>
    `<option value="${c.name}"${c.name === selectedValue ? ' selected' : ''}>${c.name}</option>`
  ).join('');
}

function buildCourtTypeOptions(selectedValue) {
  return Object.entries(courtDefs).map(([key, def]) =>
    `<option value="${key}"${key === selectedValue ? ' selected' : ''}>${def.label}</option>`
  ).join('');
}

// ── Render court entry cards ──
function renderCourtEntries() {
  courtEntries.forEach(e => readEntryFromDOM(e));
  const container = $('courtEntriesContainer');
  container.innerHTML = '';

  courtEntries.forEach(entry => {
    const def = courtDefs[entry.courtType];
    const card = document.createElement('div');
    card.className = 'court-entry-card';
    card.dataset.entryId = entry.id;

    const showCourtsField = entry.courtType !== 'totalArea';
    const entrySqFt = getEntrySqFt(entry);
    const singleCourtSqFt = entrySqFt / (entry.numCourts || 1);
    const hiddenZones = getHiddenZoneIndices(entry.courtType, singleCourtSqFt);

    const zoneColorsHtml = def.zones.map((zone, i) => {
      const isHidden = hiddenZones.includes(i);
      const val = isHidden ? 'Not Selected' : (entry.zoneColors[i] || 'Not Selected');
      return `<label class="zone-color-label" data-zone-label="${i}" ${isHidden ? 'style="display:none"' : ''}>
        <span>${zone.name} Color</span>
        <select class="entry-zone-color" data-zone="${i}">${buildColorOptions(val)}</select>
      </label>`;
    }).join('');

    card.innerHTML = `
      <div class="entry-header">
        <h3>${def.label}</h3>
        ${courtEntries.length > 1 ? `<button class="btn-remove" data-remove="${entry.id}">Remove</button>` : ''}
      </div>
      <div class="entry-body">
        <div class="entry-fields">
          <div class="form-row">
            <label>
              <span>Court Type</span>
              <select class="entry-court-type">${buildCourtTypeOptions(entry.courtType)}</select>
            </label>
            <label ${showCourtsField ? '' : 'class="hidden"'}>
              <span>Number of Courts</span>
              <input class="entry-num-courts input-highlight" type="number" min="1" step="1" value="${entry.numCourts}" />
            </label>
            <label class="checkbox-label">
              <input type="checkbox" class="entry-crack-filler"${entry.crackFiller ? ' checked' : ''}>
              <span>Crack Filler</span>
            </label>
          </div>
          <div class="form-row entry-crack-section${entry.crackFiller ? '' : ' hidden'}">
            <label>
              <span>Linear Feet of Cracks</span>
              <input class="entry-crack-feet" type="number" min="0" step="1" value="${entry.crackLinearFeet}" />
            </label>
          </div>
          <div class="form-row">
            <label>
              <span>Area Input</span>
              <select class="entry-area-mode">
                <option value="wxl"${entry.areaInputMode === 'wxl' ? ' selected' : ''}>Width x Length (ft)</option>
                <option value="sqft"${entry.areaInputMode === 'sqft' ? ' selected' : ''}>Square Feet</option>
              </select>
            </label>
            <label class="entry-wxl-field${entry.areaInputMode !== 'wxl' ? ' hidden' : ''}">
              <span>Width (Feet)</span>
              <input class="entry-width input-highlight" type="number" min="0" step="0.1" value="${entry.width}" />
            </label>
            <label class="entry-wxl-field${entry.areaInputMode !== 'wxl' ? ' hidden' : ''}">
              <span>Length (Feet)</span>
              <input class="entry-length input-highlight" type="number" min="0" step="0.1" value="${entry.length}" />
            </label>
            <label class="entry-direct-field${entry.areaInputMode === 'wxl' ? ' hidden' : ''}">
              <span>Square Feet</span>
              <input class="entry-area-value input-highlight" type="number" min="0" step="0.1" value="${entry.areaValue}" />
            </label>
          </div>
          <div class="form-row">${zoneColorsHtml}</div>
        </div>
        <div class="entry-preview">
          <div class="preview-label">Color Preview</div>
          <div class="preview-svg">${renderCourtPreview(entry.courtType, entry.zoneColors)}</div>
          <div class="preview-legend">${renderLegend(def.zones, entry.zoneColors)}</div>
        </div>
      </div>
    `;

    container.appendChild(card);

    // Event: court type change
    card.querySelector('.entry-court-type').addEventListener('change', (e) => {
      const newType = e.target.value;
      const newDef = courtDefs[newType];
      entry.courtType = newType;
      entry.width = newDef.defaultWidth;
      entry.length = newDef.defaultLength;
      entry.areaValue = newDef.defaultWidth * newDef.defaultLength;
      entry.numCourts = newType === 'totalArea' ? 1 : entry.numCourts;
      entry.zoneColors = newDef.zones.map((z, i) => i === 0 ? 'Light Blue' : 'Blue');
      renderCourtEntries();
      renderResults();
    });

    // Event: generic field changes
    const onFieldChange = () => {
      readEntryFromDOM(entry);
      const previewDiv = card.querySelector('.preview-svg');
      const legendDiv = card.querySelector('.preview-legend');
      const currentDef = courtDefs[entry.courtType];
      previewDiv.innerHTML = renderCourtPreview(entry.courtType, entry.zoneColors);
      legendDiv.innerHTML = renderLegend(currentDef.zones, entry.zoneColors);
      renderResults();
    };

    card.querySelectorAll('input, select').forEach(el => {
      if (!el.classList.contains('entry-court-type') && !el.classList.contains('entry-area-mode')) {
        el.addEventListener('input', onFieldChange);
        el.addEventListener('change', onFieldChange);
      }
    });

    // Event: area input mode change
    card.querySelector('.entry-area-mode').addEventListener('change', () => {
      entry.areaInputMode = card.querySelector('.entry-area-mode').value;
      const currentSqFt = getEntrySqFt(entry);
      if (entry.areaInputMode === 'wxl') {
        if (!entry.width || !entry.length) {
          entry.width = Math.round(Math.sqrt(currentSqFt));
          entry.length = entry.width > 0 ? Math.round(currentSqFt / entry.width) : 0;
        }
      } else {
        entry.areaValue = Math.round(currentSqFt * 100) / 100;
      }
      renderCourtEntries();
      renderResults();
    });

    // Event: crack filler checkbox
    card.querySelector('.entry-crack-filler').addEventListener('change', () => {
      card.querySelector('.entry-crack-section').classList.toggle('hidden', !entry.crackFiller);
      renderResults();
    });

    // Event: remove button
    const removeBtn = card.querySelector('.btn-remove');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        courtEntries = courtEntries.filter(e => e.id !== entry.id);
        renderCourtEntries();
        renderResults();
      });
    }
  });
}

// ── Render calculation results ──
function renderResults() {
  const surfaceType = $('surfaceType').value;

  const entryResults = courtEntries.map(entry => {
    readEntryFromDOM(entry);
    return calculateEntry(entry, surfaceType);
  });

  const totalCombinedSqFt = entryResults.reduce((sum, r) => sum + r.totalSqFt, 0);
  const totalCombinedSqYd = totalCombinedSqFt / SQFT_PER_SQYD;

  // Summary
  const courtSummary = courtEntries.map(e => {
    const def = courtDefs[e.courtType];
    return e.numCourts + ' ' + def.label + (e.numCourts > 1 ? 's' : '');
  }).join(', ');

  $('summaryGrid').innerHTML = `
    <article class="summary-item"><span class="label">Courts</span><span class="value">${courtSummary}</span></article>
    <article class="summary-item"><span class="label">Total Area (sq ft)</span><span class="value">${fmt(totalCombinedSqFt)}</span></article>
    <article class="summary-item"><span class="label">Total Area (sq yd)</span><span class="value">${fmt(totalCombinedSqYd)}</span></article>
  `;

  // Zone area breakdown
  let zoneAreaHtml = '';
  entryResults.forEach((r, ri) => {
    const courtLabel = entryResults.length > 1 ? (r.label + ' (Court ' + (ri + 1) + ')') : r.label;
    r.zoneAreas.forEach(z => {
      zoneAreaHtml += `<tr><td>${courtLabel}</td><td>${z.name}</td><td>${fmt(z.sqft)}</td><td>${fmt(z.sqyd)}</td></tr>`;
    });
  });
  $('zoneAreasBody').innerHTML = zoneAreaHtml || '<tr><td colspan="4">Add courts above</td></tr>';

  // Total area materials (resurfacer)
  let totalAreaHtml = '';
  entryResults.forEach((r, ri) => {
    const courtLabel = entryResults.length > 1 ? (r.label + ' (Court ' + (ri + 1) + ')') : r.label;
    if (entryResults.length > 1) {
      totalAreaHtml += `<tr class="zone-header"><td colspan="4">${courtLabel}</td></tr>`;
    }
    if (r.needsPatchBinder) {
      const patchPails = Math.ceil(r.patchBinderGallons / 5);
      totalAreaHtml += `<tr><td>Patch Binder</td><td>1</td><td>${r.patchBinderGallons}</td><td>${patchPails} - 5-Gallon Pail(s)</td></tr>`;
    }
    const resurfacerPails = Math.ceil(r.resurfacerGallons / 5);
    totalAreaHtml += `<tr><td>Court Resurfacer</td><td>${r.resurfacerCoats}</td><td>${r.resurfacerGallons}</td><td>${resurfacerPails} - 5-Gallon Pail(s)</td></tr>`;
  });
  $('totalAreaBody').innerHTML = totalAreaHtml;

  // Zone products (base + tint per zone)
  let zoneHtml = '';
  entryResults.forEach((r, ri) => {
    const courtLabel = entryResults.length > 1
      ? (r.label + ' (Court ' + (ri + 1) + ') — ' + r.numCourts + ' court' + (r.numCourts > 1 ? 's' : '') + ' — ' + fmt(r.totalSqFt) + ' sq ft')
      : (r.label + ' (' + r.numCourts + ') — ' + fmt(r.totalSqFt) + ' sq ft');
    zoneHtml += `<tr class="zone-header"><td colspan="4">${courtLabel}</td></tr>`;
    r.zones.forEach(zone => {
      const zoneColorHex = getColorHex(zone.colorName || 'Not Selected');
      const zoneColorLabel = zone.colorName && zone.colorName !== 'Not Selected' ? ' — ' + zone.colorName : '';
      zoneHtml += `<tr class="zone-subheader"><td colspan="4"><span class="legend-swatch" style="background:${zoneColorHex};vertical-align:middle;margin-right:6px"></span>${zone.name} (${fmt(zone.sqft)} sq ft)${zoneColorLabel}</td></tr>`;
      const basePails = Math.ceil(zone.baseGallons / 5);
      zoneHtml += `<tr><td>Sport Coating Base</td><td>${zone.baseCoats}</td><td>${zone.baseGallons}</td><td>${basePails} - 5-Gallon Pail(s)</td></tr>`;
      if (zone.colorName !== 'Not Selected') {
        zoneHtml += `<tr><td>${zone.colorName} Tint Pack</td><td></td><td></td><td>${basePails} ${zone.colorName} Tint Pack(s)</td></tr>`;
      }
    });
  });
  $('zoneProductsBody').innerHTML = zoneHtml || '<tr><td colspan="4">No zone products</td></tr>';

  // Striping
  let stripingHtml = '';
  let anyStriping = false;
  entryResults.forEach((r, ri) => {
    if (r.stripingGallons <= 0) return;
    anyStriping = true;
    const courtLabel = entryResults.length > 1 ? (r.label + ' (Court ' + (ri + 1) + ')') : r.label;
    if (entryResults.length > 1) {
      stripingHtml += `<tr class="zone-header"><td colspan="3">${courtLabel}</td></tr>`;
    }
    stripingHtml += `<tr><td>Line Primer</td><td>${r.stripingGallons}</td><td>${r.stripingGallons} - 1 Gallon Jug(s)</td></tr>`;
    stripingHtml += `<tr><td>White Line Paint</td><td>${r.stripingGallons}</td><td>${r.stripingGallons} - 1 Gallon Jug(s)</td></tr>`;
  });
  $('stripingBody').innerHTML = anyStriping ? stripingHtml : '<tr><td colspan="3">N/A for this court type</td></tr>';

  // Crack filler estimates
  renderCrackFillers(entryResults);
}

function renderCrackFillers(entryResults) {
  const crackEntries = entryResults.filter((r, ri) => courtEntries[ri].crackFiller && courtEntries[ri].crackLinearFeet > 0);
  const anyCrack = crackEntries.length > 0;
  $('crackFillerSection').classList.toggle('hidden', !anyCrack);
  if (!anyCrack) { $('crackBody').innerHTML = ''; return; }

  let html = '';
  crackEntries.forEach((r, ri) => {
    const entry = courtEntries.find(e => {
      const res = calculateEntry(e, $('surfaceType').value);
      return res.label === r.label;
    }) || courtEntries[ri];
    const gallonsMin = Math.ceil(entry.crackLinearFeet / crackFiller.rateMax);
    const gallonsMax = Math.ceil(entry.crackLinearFeet / crackFiller.rateMin);
    const gallonsLabel = gallonsMin === gallonsMax ? gallonsMin : gallonsMin + ' - ' + gallonsMax;
    const pailsMin = Math.ceil(gallonsMin / 5);
    const pailsMax = Math.ceil(gallonsMax / 5);
    const pailsLabel = pailsMin === pailsMax ? pailsMin : pailsMin + ' - ' + pailsMax;
    html += `<tr>
      <td>${crackFiller.product}</td>
      <td>${crackFiller.width}</td>
      <td>${gallonsLabel}</td>
      <td>${gallonsLabel} - 1-Gallon Pail(s)</td>

    </tr>`;
  });
  $('crackBody').innerHTML = html;
}

// ────────────────────────────────────────────────────────
// INIT
// ────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  courtEntries.push(createEntry('tennis'));
  renderCourtEntries();
  renderResults();

  $('addCourtBtn').addEventListener('click', () => {
    courtEntries.push(createEntry('tennis'));
    renderCourtEntries();
    renderResults();
  });

  $('surfaceType').addEventListener('change', () => {
    renderResults();
  });
});
