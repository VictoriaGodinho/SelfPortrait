const CLICK_COST = 3.0;

async function loadAds(){
  const res = await fetch('ads.json');
  return await res.json();
}

function money(n){
  return `$${n.toFixed(2)}`;
}

(async function init(){
  const [ads, clickedAds, viewedAds] = await Promise.all([
    loadAds(),
    Promise.resolve(JSON.parse(localStorage.getItem('clickedAds') || '[]')),
    Promise.resolve(JSON.parse(localStorage.getItem('viewedAds') || '[]'))
  ]);

  const linesEl = document.getElementById('lines');
  const sessionMeta = document.getElementById('sessionMeta');
  const grandEl = document.getElementById('grandTotal');

  // Simple session meta
  const when = new Date().toLocaleString();
  const clicks = clickedAds.length;
  const views = (viewedAds || []).length;
  sessionMeta.textContent = `${when} — Viewed ${views}, Clicked ${clicks}`;

  // Build a map for faster lookup
  const clickSet = new Set(clickedAds.map(c => c.title));
  let grand = 0;

  // For the receipt: show each viewed item with base viewCost and add +$3 if clicked
  ads.slice(0,16).forEach(ad => {
    const base = Number(ad.viewCost ?? 0.5);
    const wasClicked = clickSet.has(ad.title);
    const extra = wasClicked ? CLICK_COST : 0;
    const total = base + extra;
    grand += total;

    const row = document.createElement('div');
    row.className = 'line';
    const label = document.createElement('div');
    const right = document.createElement('div');

    label.innerHTML = `<strong>${ad.title}</strong> <span class="muted">${wasClicked ? '(clicked, +$3.00)' : '(view only)'}</span>`;
    right.textContent = money(total);

    row.appendChild(label);
    row.appendChild(right);
    linesEl.appendChild(row);
  });

  grandEl.textContent = money(grand);
})();
