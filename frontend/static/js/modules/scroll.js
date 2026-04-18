/**
 * 滾動相關模塊
 * 處理返回頂部、滾動監聽等
 */

import { getElement, addClass, removeClass } from './dom-utils.js';

/**
 * 綁定返回頂部按鈕
 */
export function bindBackToTop() {
  const button = getElement('#backToTop');
  if (!button) return;

  const onScroll = () => {
    if (window.scrollY > 240) {
      addClass(button, 'show');
    } else {
      removeClass(button, 'show');
    }
  };

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/**
 * 隱藏加載器
 */
export function hideLoader() {
  const loader = getElement('#pageLoader');
  if (!loader) return;
  addClass(loader, 'is-hidden');
}

/**
 * 啟動實時時鐘
 */
export function startLiveClock() {
  const clock = getElement('#liveClock');
  if (!clock) return;

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

/**
 * 渲染小提示
 */
export function renderTinyTip(tips) {
  const tip = getElement('#tinyTip');
  if (!tip) return;

  const idx = Math.floor(Math.random() * tips.length);
  tip.textContent = tips[idx];
}
