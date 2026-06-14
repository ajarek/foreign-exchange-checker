const api = {
  latest: (base) => `https://open.er-api.com/v6/latest/${base}`,
  history: (base, quote, start, end) => `https://api.frankfurter.app/${start}..${end}?from=${base}&to=${quote}`,
};

const popularCurrencies = {
  USD: 'United States Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen',
  PLN: 'Polish Złoty', AUD: 'Australian Dollar', CAD: 'Canadian Dollar', CHF: 'Swiss Franc'
};

const state = {
  currencies: popularCurrencies,
  sendCurrency: 'USD',
  receiveCurrency: 'EUR',
  sendAmount: 1000,
  latestRate: 0.86,
  rateHistory: [],
  favorites: JSON.parse(localStorage.getItem('fx_favs') || '[]'),
  logs: JSON.parse(localStorage.getItem('fx_logs') || '[]'),
  pickerTarget: null,
  chart: null,
};

let el = {};

function initElements() {
  const get = id => document.getElementById(id);
  el = {
    currencyCount: get('currencyCount'),
    tickerTrack: get('tickerTrack'),
    sendAmount: get('sendAmount'),
    receiveAmount: get('receiveAmount'),
    sendCurrencyButton: get('sendCurrencyButton'),
    receiveCurrencyButton: get('receiveCurrencyButton'),
    sendCurrencyCode: get('sendCurrencyCode'),
    receiveCurrencyCode: get('receiveCurrencyCode'),
    sendFlag: get('sendFlag'),
    receiveFlag: get('receiveFlag'),
    rateSummary: get('rateSummary'),
    favoriteButton: get('favoriteButton'),
    logConversionButton: get('logConversionButton'),
    clearLogButton: get('clearLogButton'),
    tabs: Array.from(document.querySelectorAll('.tab-button')),
    panels: Array.from(document.querySelectorAll('.tab-panel')),
    chartArea: get('chartArea'),
    chartCanvas: get('historyChart'),
    chartPair: get('chartPair'),
    compareList: get('compareList'),
    favoritesList: get('favoritesList'),
    logList: get('logList'),
    currencyPicker: get('currencyPicker'),
    currencySearch: get('currencySearch'),
    currencySelect: get('currencySelect'),
    closePickerButton: get('closePickerButton'),
    swapButton: get('swapButton'),
  };
}

function getFlagPath(code) {
  const mapping = { USD: 'us', EUR: 'eu', GBP: 'gb', JPY: 'jp', AUD: 'au', CAD: 'ca', CHF: 'ch', CNY: 'cn', PLN: 'pl' };
  const country = mapping[code] || code.slice(0, 2).toLowerCase();
  return `https://flagcdn.com/w40/${country}.png`;
}

function updateUI() {
  if (el.sendCurrencyCode) el.sendCurrencyCode.textContent = state.sendCurrency;
  if (el.receiveCurrencyCode) el.receiveCurrencyCode.textContent = state.receiveCurrency;
  if (el.sendFlag) el.sendFlag.src = getFlagPath(state.sendCurrency);
  if (el.receiveFlag) el.receiveFlag.src = getFlagPath(state.receiveCurrency);
  
  const converted = state.sendAmount * state.latestRate;
  if (el.receiveAmount) el.receiveAmount.textContent = converted.toFixed(2);
  if (el.rateSummary) el.rateSummary.textContent = `1 ${state.sendCurrency} = ${state.latestRate.toFixed(4)} ${state.receiveCurrency}`;
  if (el.chartPair) el.chartPair.textContent = `${state.sendCurrency}/${state.receiveCurrency}`;
  if (el.currencyCount) el.currencyCount.textContent = Object.keys(state.currencies).length;
  
  updateFavoriteButton();
  renderFavorites();
  renderLogs();
}

function updateFavoriteButton() {
  if (!el.favoriteButton) return;
  const isFav = state.favorites.some(f => f.from === state.sendCurrency && f.to === state.receiveCurrency);
  const star = el.favoriteButton.querySelector('svg');
  if (star) {
    star.setAttribute('fill', isFav ? '#fbbf24' : 'none');
    star.setAttribute('stroke', isFav ? '#fbbf24' : 'currentColor');
  }
  el.favoriteButton.lastChild.textContent = isFav ? ' Favorited' : ' Favorite';
}

function toggleFavorite() {
  const pair = { from: state.sendCurrency, to: state.receiveCurrency };
  const idx = state.favorites.findIndex(f => f.from === pair.from && f.to === pair.to);
  if (idx > -1) state.favorites.splice(idx, 1);
  else state.favorites.push(pair);
  
  localStorage.setItem('fx_favs', JSON.stringify(state.favorites));
  updateUI();
}

function renderFavorites() {
  const badge = document.getElementById('favoriteCount');
  if (badge) badge.textContent = state.favorites.length;
  if (!el.favoritesList) return;
  if (state.favorites.length === 0) {
    el.favoritesList.innerHTML = '<p style="color:var(--muted); text-align:center; padding:20px;">No pinned pairs yet.</p>';
    return;
  }
  el.favoritesList.innerHTML = state.favorites.map(f => `
    <div class="favorite-row" style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:rgba(255,255,255,0.04); border-radius:16px; margin-bottom:8px; cursor:pointer;" onclick="loadFavorite('${f.from}', '${f.to}')">
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="display:flex; gap:4px;">
          <img src="${getFlagPath(f.from)}" style="width:20px; height:14px; border-radius:2px;">
          <img src="${getFlagPath(f.to)}" style="width:20px; height:14px; border-radius:2px;">
        </div>
        <strong>${f.from} / ${f.to}</strong>
      </div>
      <button class="outline-button" style="padding:6px 10px; font-size:12px; border-radius:8px;" onclick="event.stopPropagation(); removeFavorite('${f.from}', '${f.to}')">Remove</button>
    </div>
  `).join('');
}

function logConversion() {
  const log = {
    id: Date.now(),
    from: state.sendCurrency,
    to: state.receiveCurrency,
    amount: state.sendAmount,
    result: (state.sendAmount * state.latestRate).toFixed(2),
    rate: state.latestRate.toFixed(4),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  state.logs.unshift(log);
  if (state.logs.length > 20) state.logs.pop();
  localStorage.setItem('fx_logs', JSON.stringify(state.logs));
  updateUI();
}

function renderLogs() {
  const badge = document.getElementById('logCount');
  if (badge) badge.textContent = state.logs.length;
  if (!el.logList) return;
  if (state.logs.length === 0) {
    el.logList.innerHTML = '<p style="color:var(--muted); text-align:center; padding:20px;">No conversions logged yet.</p>';
    return;
  }
  el.logList.innerHTML = state.logs.map(l => `
    <div class="log-row" style="display:grid; grid-template-columns: 1fr auto; gap:12px; padding:12px; background:rgba(255,255,255,0.04); border-radius:16px; margin-bottom:8px;">
      <div>
        <div style="font-size:12px; color:var(--muted); margin-bottom:4px;">${l.time} · Rate: ${l.rate}</div>
        <strong>${l.amount} ${l.from}</strong> → <strong>${l.result} ${l.to}</strong>
      </div>
      <button class="outline-button" style="padding:6px 10px; font-size:12px; border-radius:8px; color:#fb7185; border-color:rgba(251,113,133,0.2);" onclick="removeLog(${l.id})">Delete</button>
    </div>
  `).join('');
}

window.removeLog = (id) => {
  state.logs = state.logs.filter(l => l.id !== id);
  localStorage.setItem('fx_logs', JSON.stringify(state.logs));
  updateUI();
};

window.loadFavorite = (from, to) => {
  state.sendCurrency = from;
  state.receiveCurrency = to;
  fetchRates();
};

window.removeFavorite = (from, to) => {
  state.favorites = state.favorites.filter(f => !(f.from === from && f.to === to));
  localStorage.setItem('fx_favs', JSON.stringify(state.favorites));
  updateUI();
};

async function fetchRates() {
  try {
    const res = await fetch(api.latest(state.sendCurrency));
    const data = await res.json();
    if (data && data.rates) {
      state.latestRate = data.rates[state.receiveCurrency] || 1;
      state.currencies = data.rates;
      renderCompare(data.rates);
      renderTicker(data.rates);
    }
    updateUI();
    fetchHistory();
  } catch (e) { console.error('API Error', e); updateUI(); }
}

async function fetchHistory() {
  if (!el.chartCanvas) return;
  const end = new Date().toISOString().split('T')[0];
  const start = new Date(Date.now() - 30 * 24 * 3600000).toISOString().split('T')[0];
  try {
    const res = await fetch(api.history(state.sendCurrency, state.receiveCurrency, start, end));
    if (!res.ok) throw new Error('History API down');
    const data = await res.json();
    state.rateHistory = Object.entries(data.rates).map(([d, r]) => ({ d, v: r[state.receiveCurrency] }));
    renderChart();
  } catch (e) {
    const base = state.latestRate || 1;
    state.rateHistory = Array.from({length: 30}, (_, i) => ({
      d: new Date(Date.now() - (30 - i) * 24 * 3600000).toISOString().split('T')[0],
      v: base + (Math.random() - 0.5) * (base * 0.05)
    }));
    renderChart();
  }
}

function renderChart() {
  if (!el.chartCanvas || !state.rateHistory.length || typeof Chart === 'undefined') {
    if (typeof Chart === 'undefined') setTimeout(renderChart, 300);
    return;
  }
  const ctx = el.chartCanvas.getContext('2d');
  if (state.chart) state.chart.destroy();
  state.chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: state.rateHistory.map(p => p.d),
      datasets: [{
        label: `${state.sendCurrency}/${state.receiveCurrency}`,
        data: state.rateHistory.map(p => p.v),
        borderColor: '#a78bfa',
        backgroundColor: 'rgba(167, 139, 250, 0.15)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#a78bfa'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
      scales: {
        x: { display: true, grid: { display: false }, ticks: { color: '#6b7280', maxTicksLimit: 6 } },
        y: { display: true, grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false }, ticks: { color: '#6b7280' } }
      }
    }
  });
}

function renderTicker(rates) {
  if (!el.tickerTrack) return;
  const targets = ['EUR', 'GBP', 'JPY', 'PLN', 'AUD'];
  el.tickerTrack.innerHTML = targets.map(c => `<div class="ticker-item"><span>USD/${c}</span><strong>${(rates[c] || 0).toFixed(4)}</strong></div>`).join('');
}

function renderCompare(rates) {
  if (!el.compareList) return;
  const targets = ['EUR', 'GBP', 'JPY', 'PLN', 'CHF', 'CAD', 'AUD', 'NZD'];
  el.compareList.innerHTML = targets.map(c => `
    <div class="compare-row" style="display:flex; justify-content:space-between; padding:12px; background:rgba(255,255,255,0.04); border-radius:12px; margin-bottom:8px;">
      <div style="display:flex; align-items:center; gap:8px;"><img src="${getFlagPath(c)}" style="width:24px; height:16px;"><strong>${c}</strong></div>
      <strong>${((rates[c] || 0) * state.sendAmount).toFixed(2)}</strong>
    </div>
  `).join('');
}

function bindEvents() {
  el.sendAmount?.addEventListener('input', e => { state.sendAmount = Number(e.target.value); updateUI(); });
  el.sendCurrencyButton?.addEventListener('click', () => openPicker('send'));
  el.receiveCurrencyButton?.addEventListener('click', () => openPicker('receive'));
  el.closePickerButton?.addEventListener('click', () => el.currencyPicker.classList.add('hidden'));
  el.favoriteButton?.addEventListener('click', toggleFavorite);
  el.logConversionButton?.addEventListener('click', logConversion);
  el.clearLogButton?.addEventListener('click', () => { state.logs = []; localStorage.setItem('fx_logs', '[]'); updateUI(); });
  el.swapButton?.addEventListener('click', () => {
    [state.sendCurrency, state.receiveCurrency] = [state.receiveCurrency, state.sendCurrency];
    fetchRates();
  });
  el.currencySearch?.addEventListener('input', e => {
    const term = e.target.value.toLowerCase();
    Array.from(el.currencySelect.options).forEach(o => o.style.display = o.text.toLowerCase().includes(term) ? '' : 'none');
  });
  el.currencySelect?.addEventListener('change', e => {
    if (state.pickerTarget === 'send') state.sendCurrency = e.target.value; else state.receiveCurrency = e.target.value;
    fetchRates(); el.currencyPicker.classList.add('hidden');
  });
  el.tabs.forEach(b => b.addEventListener('click', () => {
    el.tabs.forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    el.panels.forEach(p => p.classList.toggle('active', p.id === `panel-${b.dataset.panel}`));
    if (b.dataset.panel === 'history') setTimeout(renderChart, 50);
  }));
}

function openPicker(target) {
  state.pickerTarget = target;
  if (el.currencySearch) el.currencySearch.value = '';
  el.currencyPicker?.classList.remove('hidden');
  const opts = Object.keys(state.currencies).sort().map(c => `<option value="${c}" ${c === (target === 'send' ? state.sendCurrency : state.receiveCurrency) ? 'selected' : ''}>${c} - ${popularCurrencies[c] || c}</option>`).join('');
  if (el.currencySelect) { el.currencySelect.innerHTML = opts; Array.from(el.currencySelect.options).forEach(o => o.style.display = ''); }
  if (el.currencySearch) el.currencySearch.focus();
}

function init() {
  initElements();
  bindEvents();
  updateUI();
  fetchRates();
}

document.addEventListener('DOMContentLoaded', init);
