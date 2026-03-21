
(function () {
  // === Configuration you can tweak ===
  const DECIMALS = 3; // number of decimal places for results

  // Map of input ids to friendly labels (used for messages & share link)
  const INPUT_LABELS = { a: 'A', b: 'B', c: 'C', d: 'D', e: 'E' };

  const form = document.getElementById('calcForm');
  const inputs = ['a','b','c','d','e'].map(id => /** @type {HTMLInputElement} */(document.getElementById(id)));

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

    const { a, b, c, d, e } = v;

    // === Your formulas here ===
    const res1 = (1 - b)*100;               		// Power
    const res2 = ((a*(1-b)*c)+(e*a*b*c))/(c+1); 	// Expectation 1
    const res3 = ((a*d)+((e*a)*(1-d)))/(c+1);    	// Expectation 2
    const res4 = res2/(res2+res3);                 			// PPV
    

    setOutputs(res1, res2, res3, res4);
  };

  // Write into outputs with rounding
  const setOutputs = (...vals) => {
    const ids = ['res1','res2','res3','res4'];
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
