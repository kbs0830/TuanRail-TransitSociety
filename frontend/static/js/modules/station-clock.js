const REDUCE_MOTION_QUERY = window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : null;
const shouldReduceMotion = () => Boolean(REDUCE_MOTION_QUERY && REDUCE_MOTION_QUERY.matches);
const FLIP_DURATION = 360;
const FLIP_MID = 165;

function buildClockDOM(container) {
  const seg = (id) =>
    `<div class="sc-segment" id="${id}"><span class="sc-tile">0</span><span class="sc-tile">0</span></div>`;

  container.innerHTML = `
    <div class="sc-board" aria-hidden="true">
      <div class="sc-header">
        <span class="sc-label-en">TAIPEI TIME</span>
        <span class="sc-label-tc">臺北時刻</span>
      </div>
      <div class="sc-digits">
        ${seg('scHH')}
        <span class="sc-colon">:</span>
        ${seg('scMM')}
        <span class="sc-colon">:</span>
        ${seg('scSS')}
      </div>
    </div>`;
}

function flipTile(tile, newChar) {
  if (tile.textContent === newChar) return;

  if (shouldReduceMotion()) {
    tile.textContent = newChar;
    return;
  }

  tile.classList.add('sc-flipping');
  setTimeout(() => {
    tile.textContent = newChar;
  }, FLIP_MID);
  setTimeout(() => {
    tile.classList.remove('sc-flipping');
  }, FLIP_DURATION + 20);
}

function updateSegment(container, id, value) {
  const tiles = container.querySelectorAll(`#${id} .sc-tile`);
  [...String(value)].forEach((char, i) => {
    if (tiles[i]) flipTile(tiles[i], char);
  });
}

export function createStationClock(container) {
  if (!container) return null;

  buildClockDOM(container);

  let prev = { hh: '', mm: '', ss: '' };

  const tick = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');

    if (hh !== prev.hh) { updateSegment(container, 'scHH', hh); prev.hh = hh; }
    if (mm !== prev.mm) { updateSegment(container, 'scMM', mm); prev.mm = mm; }
    if (ss !== prev.ss) { updateSegment(container, 'scSS', ss); prev.ss = ss; }

    container.setAttribute('aria-label', `目前時間 ${hh} 時 ${mm} 分 ${ss} 秒`);
  };

  tick();
  return window.setInterval(tick, 1000);
}
