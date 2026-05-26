const TRAIN_VIA_OPTIONS = ['南迴', '北迴', '山線', '海線'];
const TRAIN_TYPES = ['區間', '自強'];
const FALLBACK_STATIONS = ['臺北', '臺中', '高雄', '花蓮', '屏東'];
const DEFAULT_REFRESH_MS = 3000;
const DEFAULT_ROWS = 2;
const REDUCE_MOTION_QUERY = window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : null;
const shouldReduceMotion = () => Boolean(REDUCE_MOTION_QUERY && REDUCE_MOTION_QUERY.matches);

export function createTrainBoard(container, options = {}) {
  const mediaQuery = window.matchMedia('(max-width: 768px)');
  const refreshMs = options.refreshMs || DEFAULT_REFRESH_MS;
  const resolveRows = () => (options.rows ? options.rows : mediaQuery.matches ? 1 : DEFAULT_ROWS);
  let rows = resolveRows();
  let stations = [];
  let intervalId = null;

  const render = (animate) => {
    if (!container) {
      return;
    }

    container.innerHTML = '';
    const dataRows = buildNextTrainRows(stations, rows);
    dataRows.forEach((row, index) => {
      const item = document.createElement('div');
      item.className = 'flip-row';
      item.setAttribute('data-row', String(index + 1));
      item.appendChild(createFlipPair('開往', row.destination, 'destination'));
      item.appendChild(createFlipPair('車次', row.trainNo, 'trainNo'));
      item.appendChild(createFlipPair('經由', row.via, 'via'));
      item.appendChild(createFlipPair('車種', row.type, 'type'));
      item.appendChild(createFlipPair('開車時刻', row.time, 'time'));
      container.appendChild(item);
    });

    if (animate) {
      triggerFlipAnimation(container);
    }
  };

  const setStations = (nextStations) => {
    stations = Array.isArray(nextStations) ? nextStations : [];
    render(false);
  };

  const handleBreakpoint = () => {
    if (options.rows) {
      return;
    }
    rows = resolveRows();
    render(false);
  };

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleBreakpoint);
  } else if (mediaQuery.addListener) {
    mediaQuery.addListener(handleBreakpoint);
  }

  const start = () => {
    stop();
    intervalId = window.setInterval(() => {
      render(true);
    }, refreshMs);
  };

  const stop = () => {
    if (intervalId) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  };

  return {
    setStations,
    start,
    stop,
    render,
  };
}

function triggerFlipAnimation(container) {
  if (shouldReduceMotion()) {
    return;
  }

  const rows = container.querySelectorAll('.flip-row');
  if (!rows.length) {
    return;
  }

  window.requestAnimationFrame(() => {
    rows.forEach((row) => row.classList.add('is-flipping'));
    window.setTimeout(() => {
      rows.forEach((row) => row.classList.remove('is-flipping'));
    }, 650);
  });
}

function createFlipPair(label, value, key) {
  const pair = document.createElement('span');
  pair.className = 'flip-pair';
  if (key) {
    pair.dataset.key = key;
  }

  const labelNode = document.createElement('span');
  labelNode.className = 'flip-label';
  labelNode.textContent = label;

  const valueNode = document.createElement('span');
  valueNode.className = 'flip-value';
  valueNode.textContent = value;

  pair.append(labelNode, valueNode);
  return pair;
}

function buildNextTrainRows(stations, count) {
  const names = Array.from(
    new Set((stations || []).map((item) => item.stationName || item.name).filter(Boolean))
  );
  const pool = names.length ? names : FALLBACK_STATIONS;
  const picks = [];

  while (picks.length < count && picks.length < pool.length) {
    const candidate = pool[Math.floor(Math.random() * pool.length)];
    if (!picks.includes(candidate)) {
      picks.push(candidate);
    }
  }

  while (picks.length < count) {
    picks.push(pool[Math.floor(Math.random() * pool.length)]);
  }

  return picks.map((destination, index) => buildTrainRow(destination, 10 + index * 12));
}

function buildTrainRow(destination, offsetMinutes) {
  const via = TRAIN_VIA_OPTIONS[Math.floor(Math.random() * TRAIN_VIA_OPTIONS.length)];
  const type = TRAIN_TYPES[Math.floor(Math.random() * TRAIN_TYPES.length)];
  const trainNo = String(Math.floor(100 + Math.random() * 900));
  const time = formatTime(new Date(Date.now() + offsetMinutes * 60000));

  return {
    destination,
    trainNo,
    via,
    type,
    time,
  };
}

function formatTime(date) {
  return date.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
