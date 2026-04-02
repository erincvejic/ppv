(() => {
  const inputs = ['b', 'c', 'd', 'e'].map(id =>
    document.getElementById(id)
  );

  // =====================
  // Ratio handling (ONCE)
  // =====================
  const ratioInput = document.getElementById('c_ratio');
  const cHidden = document.getElementById('c');
  const cError = document.getElementById('c-error');
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

  // =====================
  // Calculation
  // =====================
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
    const num = (1 - b + e * b) * c;
    const den = num + (d + e * (1 - d));
    const ppv = num / den;

    set('res1', power.toFixed(1));
    set('res4', ppv.toFixed(3));
  }

  function set(id, val) {
    document.getElementById(id).textContent = val;
  }

  document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('b').value = 0.2;
    document.getElementById('d').value = 0.05;
    document.getElementById('e').value = 0;
    applyRatio('1:1');
  });

  inputs.forEach(i => i.addEventListener('input', updateResults));
  updateResults();
})();
