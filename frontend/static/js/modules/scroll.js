import { getElement, addClass, removeClass } from './dom-utils.js';

const REDUCE_MOTION_QUERY = window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : null;
const shouldReduceMotion = () => Boolean(REDUCE_MOTION_QUERY && REDUCE_MOTION_QUERY.matches);

export function bindBackToTop() {
  const button = getElement('#backToTop');
  if (!button) {
    return;
  }

  let isVisible = false;
  let isTicking = false;

  const updateVisibility = () => {
    const shouldShow = window.scrollY > 240;
    if (shouldShow !== isVisible) {
      isVisible = shouldShow;
      if (shouldShow) {
        addClass(button, 'show');
        button.removeAttribute('aria-hidden');
        button.tabIndex = 0;
      } else {
        removeClass(button, 'show');
        button.setAttribute('aria-hidden', 'true');
        button.tabIndex = -1;
      }
    }
    isTicking = false;
  };

  const onScroll = () => {
    if (!isTicking) {
      isTicking = true;
      window.requestAnimationFrame(updateVisibility);
    }
  };

  button.addEventListener('click', () => {
    const behavior = shouldReduceMotion() ? 'auto' : 'smooth';
    window.scrollTo({ top: 0, behavior });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  updateVisibility();
}

export function hideLoader() {
  const loader = getElement('#pageLoader');
  if (!loader) {
    return;
  }
  addClass(loader, 'is-hidden');
}

export function startLiveClock() {
  const clock = getElement('#liveClock');
  if (!clock) {
    return;
  }

  const tick = () => {
    const now = new Date();
    clock.textContent = now.toLocaleString('zh-TW', {
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Taipei',
    });
  };

  tick();
  window.setInterval(tick, 1000);
}

export function renderTinyTip(tips) {
  const tip = getElement('#tinyTip');
  if (!tip) {
    return;
  }

  if (!Array.isArray(tips) || tips.length === 0) {
    tip.textContent = '';
    return;
  }

  const idx = Math.floor(Math.random() * tips.length);
  tip.textContent = tips[idx];
}
