/**
 * 抽屜菜單模塊
 * 處理側邊欄開關和导航
 */

import { getElement, getAllElements, addClass, removeClass, addEventListener } from './dom-utils.js';

/**
 * 綁定抽屜菜單
 */
export function bindDrawer(sectionIds, setActiveSection, closeDrawer) {
  const toggle = getElement('#drawerToggle');
  const overlay = getElement('#drawerOverlay');
  const sidebar = getElement('#sidebar');

  if (!toggle || !overlay || !sidebar) return;

  addEventListener(toggle, 'click', () => {
    const isOpen = document.body.classList.contains('sidebar-open');
    if (isOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  addEventListener(overlay, 'click', closeDrawer);

  sidebar.querySelectorAll('.anchor-link[href^="#"]').forEach((link) => {
    addEventListener(link, 'click', (event) => {
      const target = link.getAttribute('href') || '';
      event.preventDefault();
      const sectionId = target.replace('#', '');
      if (sectionIds.includes(sectionId)) {
        setActiveSection(sectionId, true);
      }
      closeDrawer();
    });
  });
}

/**
 * 打開抽屜
 */
export function openDrawer() {
  addClass(document.body, 'sidebar-open');
}

/**
 * 關閉抽屜
 */
export function closeDrawer() {
  removeClass(document.body, 'sidebar-open');
}

/**
 * 設置活動區域
 */
export function setActiveSection(sectionIds, activeId, syncHash) {
  sectionIds.forEach((id) => {
    const section = getElement(`#${id}`);
    if (!section) return;

    if (id === activeId) {
      removeClass(section, 'hidden-section');
      addClass(section, 'visible-section');
    } else {
      removeClass(section, 'visible-section');
      addClass(section, 'hidden-section');
    }
  });

  getAllElements('.anchor-link').forEach((link) => {
    const href = link.getAttribute('href') || '';
    const targetId = href.replace('#', '');
    if (targetId === activeId) {
      addClass(link, 'active');
    } else {
      removeClass(link, 'active');
    }
  });

  if (syncHash) {
    window.location.hash = activeId;
  }
}
