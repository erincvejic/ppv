
(function () {
  // === Configuration you can tweak ===
  const DECIMALS = 3; // number of decimal places for results

  // Map of input ids to friendly labels (used for messages & share link)
  const INPUT_LABELS = {b: 'B', c: 'C', d: 'D', e: 'E' };

  const form = document.getElementById('calcForm');
  const inputs = ['b','c','d','e'].map(id => /** @type {HTMLInputElement} */(document.getElementById(id)));


// === Create a range slider for each number input and keep them in sync ===
(function attachSliders() {
  inputs.forEach((numEl) => {
    // Find the field wrapper
    const field = numEl.closest('.field');
    if (!field) return;

    // Find associated label; ensure it has an id for ARIA
    const label = field.querySelector(`label[for="${numEl.id}"]`);
    const labelId = label ? (label.id || (label.id = `${numEl.id}-label`)) : undefined;

    // Build slider row: <input type="range"> + live value <span>
    const row = document.createElement('div');
    row.className = 'slider-row';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = `${numEl.id}-slider`;
    slider.min = numEl.min || '0';
    slider.max = numEl.max || '100';
    slider.step = numEl.step || '1';
    slider.value = numEl.value || numEl.getAttribute('value') || '0';

    if (labelId) slider.setAttribute('aria-labelledby', labelId);

    const live = document.createElement('span');
    live.className = 'slider-value';
    live.textContent = slider.value;

    row.appendChild(slider);
    row.appendChild(live);

    // Insert slider just above the error element (if present)
    const errorEl = field.querySelector('.error');
    if (errorEl) {
      field.insertBefore(row, errorEl);
    } else {
      field.appendChild(row);
    }

    // Sync: slider -> number
    slider.addEventListener('input', () => {
      numEl.value = slider.value;
      live.textContent = slider.value;
      // trigger validation + recalculation
      numEl.dispatchEvent(new Event('input', { bubbles: true }));
      numEl.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Sync: number -> slider (if user types or resets)
    const syncBack = () => {
      // clamp to slider range and respect step
      const v = numEl.value === '' ? slider.min : numEl.value;
      slider.value = v;
      live.textContent = slider.value;
    };
    numEl.addEventListener('input', syncBack);
    numEl.addEventListener('change', syncBack);
  });
})();



  
  // Read values safely as numbers (NaN -> null)
  const readValues = () => {
    const v = {};
    for (const el of inputs) {
      const n = el.value.trim() === '' ? null : Number(el.value);
      v[el.id] = Number.isFinite(n) ? n : null;
    }
    return v; // {a:number|null, ...}
  };

  // Display results based on current values
  const updateResults = () => {
    const v = readValues();
    const errs = validateAll();
    const hasErrors = Object.values(errs).some(Boolean);

    if (hasErrors) {
      setOutputs('—','—','—','—');
      return;
    }

    const { b, c, d, e } = v;

// ======================================================
// Pre‑study odds (R): ratio input + presets
// ======================================================

const ratioInput = document.getElementById('c_ratio');
const cHidden    = document.getElementById('c');
const cError     = document.getElementById('c-error');
const presetBtns = document.querySelectorAll('.ratio-presets button');

// ---- Parse "n:m" → numeric R ----
function parseRatio(str) {
  if (!str) return null;

  const match = str.trim().match(/^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/);
  if (!match) return null;

  const left  = Number(match[1]);
  const right = Number(match[2]);

  if (left <= 0 || right <= 0) return null;

  return left / right;
}

// ---- Apply ratio (from typing or preset) ----
function applyRatio(ratioStr) {
  const numericR = parseRatio(ratioStr);

  if (numericR === null) {
    cError.textContent = 'Enter odds as n:m (e.g. 1:10)';
    cHidden.value = '';
    return;
  }

  ratioInput.value = ratioStr;
  cHidden.value = numericR;
  cError.textContent = '';

  // Trigger existing validation + recalculation
  cHidden.dispatchEvent(new Event('input',  { bubbles: true }));
  cHidden.dispatchEvent(new Event('change', { bubbles: true }));
}

// ---- Initialise default ----
applyRatio('1:1');

// ---- Listen to manual typing ----
ratioInput.addEventListener('input', () => {
  applyRatio(ratioInput.value);
});

// ---- Preset buttons ----
presetBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    applyRatio(btn.dataset.ratio);
  });
});

    
    // === Your formulas here ===
    const res1 = (1 - b)*100;               		// Power
    const res2 = ((1*(1-b)*c)+(e*1*b*c))/(c+1); 	// Expectation 1
    const res3 = ((1*d)+((e*1)*(1-d)))/(c+1);    	// Expectation 2
    const res4 = res2/(res2+res3);                 			// PPV
    

    setOutputs(res1, res4);
  };

  // Write into outputs with rounding
  const setOutputs = (...vals) => {
    const ids = ['res1','res4'];
    ids.forEach((id, i) => {
      const el = document.getElementById(id);
      const v = vals[i];
      el.textContent = (typeof v === 'number' && Number.isFinite(v)) ? round(v, DECIMALS) : '—';
    });
  };

  const round = (x, dp=2) => {
    const f = Math.pow(10, dp);
    return (Math.round((x + Number.EPSILON) * f) / f).toFixed(dp);
  };

  // Validate an individual input and show custom messages
  const validate = (el) => {
    el.setCustomValidity('');
    const errorEl = document.getElementById(`${el.id}-error`);
    let msg = '';

    if (el.validity.valueMissing) {
      msg = `Please enter a value for ${INPUT_LABELS[el.id]}.`;
    } else if (el.validity.badInput) {
      msg = `Please enter a number for ${INPUT_LABELS[el.id]}.`;
    } else if (el.validity.stepMismatch) {
      const step = el.getAttribute('step');
      msg = `Value must align with step of ${step}.`;
    } else if (el.validity.rangeUnderflow) {
      msg = `Value must be ≥ ${el.getAttribute('min')}.`;
    } else if (el.validity.rangeOverflow) {
      msg = `Value must be ≤ ${el.getAttribute('max')}.`;
    }

    errorEl.textContent = msg;
    return msg;
  };

  const validateAll = () => Object.fromEntries(inputs.map(el => [el.id, validate(el)]));

  // Reset to default values declared in HTML
  const resetBtn = document.getElementById('resetBtn');
  resetBtn.addEventListener('click', () => {
    for (const el of inputs) {
      el.value = el.getAttribute('value') || '';
      validate(el);
    }
    updateResults();
    setShareStatus('');
    history.replaceState({}, '', location.pathname); // clear query params
  });

  // Handle live updates
  inputs.forEach(el => {
    ['input','change','blur'].forEach(evt => el.addEventListener(evt, () => {
      validate(el);
      updateResults();
    }));
  });

  // Load from query string (?a=10&b=20&...)
  const params = new URLSearchParams(window.location.search);
  let anyParam = false;
  for (const el of inputs) {
    if (params.has(el.id)) {
      const v = params.get(el.id);
      if (v !== null) {
        el.value = v;
        anyParam = true;
      }
    }
  }
  if (anyParam) {
    inputs.forEach(validate);
  }

  // Initial compute
  updateResults();

  // Shareable link
  const shareBtn = document.getElementById('shareBtn');
  const shareStatus = document.getElementById('shareStatus');

  const setShareStatus = (msg) => { shareStatus.textContent = msg; };

  shareBtn.addEventListener('click', async () => {
    const v = readValues();
    // If there are validation errors, don't share
    if (Object.values(validateAll()).some(Boolean)) {
      setShareStatus('Fix inputs before sharing.');
      return;
    }

    const url = new URL(window.location.href);
    const qs = new URLSearchParams();
    for (const key of Object.keys(v)) qs.set(key, String(v[key]));
    url.search = qs.toString();

    try {
      await navigator.clipboard.writeText(url.toString());
      setShareStatus('Link copied to clipboard!');
    } catch (e) {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = url.toString();
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setShareStatus('Link copied!');
    }
  });
})();
