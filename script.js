(() => {
  const DECIMALS = 3;

  const numericIds = ['b', 'd', 'e'];   // sliders
  const allInputs  = ['b', 'c', 'd', 'e'];

  const numericInputs = numericIds.map(id => document.getElementById(id));
  const allInputEls   = allInputs.map(id => document.getElementById(id));

  // ======================================================
  // SLIDERS (for numeric inputs only)
  // ======================================================
  function attachSliders() {
    numericInputs.forEach(numEl => {
      const field = numEl.closest('.field');
      if (!field) return;

      const label = field.querySelector(`label[for="${numEl.id}"]`);
      if (label && !label.id) label.id = `${numEl.id}-label`;

      const row = document.createElement('div');
      row.className = 'slider-row';

      const slider = document.createElement('input');
      slider.type  = 'range';
      slider.min   = numEl.min ?? 0;
      slider.max   = numEl.max ?? 1;
      slider.step  = numEl.step ?? 0.01;
      slider.value = numEl.value;

      if (label) slider.setAttribute('aria-labelledby', label.id);

      const live = document.createElement('span');
      live.className = 'slider-value';
      live.textContent = slider.value;

      row.appendChild(slider);
      row.appendChild(live);

      const error = field.querySelector('.error');
      field.insertBefore(row, error ?? null);

      // slider → number
      slider.addEventListener('input', () => {
        numEl.value = slider.value;
        live.textContent = slider.value;
        updateResults();
      });

      // number → slider
      numEl.addEventListener('input', () => {
        slider.value = numEl.value;
        live.textContent = slider.value;
      });
    });
  }

  // ======================================================
  // RATIO INPUT (Pre‑study odds R)
  // ======================================================
  const ratioInput = document.getElementById('c_ratio');
  const cHidden    = document.getElementById('c');
  const cError     = document.getElementById('c-error');
  const presetBtns = document.querySelectorAll('.ratio-presets button');

  function parseRatio(str) {
    const m = str.trim().match(/^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/);
    if (!m) return null;
    const a = +m[1], b = +m[2];
    return (a > 0 && b > 0) ? a / b : null;
  }

  function applyRatio(r) {
    const val = parseRatio(r);
    if (val === null) {
      cError.textContent = 'Use format n:m (e.g. 1:10)';
      cHidden.value = '';
      return;
    }
    ratioInput.value = r;
    cHidden.value = val;
    cError.textContent = '';
    updateResults();
  }

  ratioInput.value = '1:1';
  ratioInput.addEventListener('input', () => applyRatio(ratioInput.value));
  presetBtns.forEach(b =>
    b.addEventListener('click', () => applyRatio(b.dataset.ratio))
  );

  // ======================================================
  // CALCULATION
  // ======================================================
  function updateResults() {
    const b = parseFloat(document.getElementById('b').value);
    const c = parseFloat(document.getElementById('c').value);
    const d = parseFloat(document.getElementById('d').value);
    const e = parseFloat(document.getElementById('e').value);

    if (![b, c, d, e].every(Number.isFinite)) {
      set('res1', '—');
      set('res4', '—');
      return;
    }

    const power = (1 - b) * 100;
    const numerator   = (1 - b + e * b) * c;
    const denominator = numerator + (d + e * (1 - d));
    const ppv = numerator / denominator;

    set('res1', power.toFixed(1));
    set('res4', ppv.toFixed(DECIMALS));
  }

  function set(id, val) {
    document.getElementById(id).textContent = val;
  }

  // ======================================================
  // RESET
  // ======================================================
  document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('b').value = 0.2;
    document.getElementById('d').value = 0.05;
    document.getElementById('e').value = 0;
    applyRatio('1:1');
    updateResults();
  });

  // ======================================================
  // INIT
  // ======================================================
  attachSliders();
  allInputEls.forEach(el => el.addEventListener('input', updateResults));
  updateResults();
})();
``
