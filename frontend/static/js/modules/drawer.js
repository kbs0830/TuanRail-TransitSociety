import { getElement, getAllElements, addClass, removeClass, addEventListener } from './dom-utils.js';

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const BODY_OPEN_CLASS = 'sidebar-open';
let currentActiveId = null;

export function createDrawerController({
  sectionIds = [],
  onSectionChange,
  toggleSelector = '#drawerToggle',
  overlaySelector = '#drawerOverlay',
  sidebarSelector = '#sidebar',
  mainContentSelector = '#mainContent',
} = {}) {
  const toggle = getElement(toggleSelector);
  const overlay = getElement(overlaySelector);
  const sidebar = getElement(sidebarSelector);
  const mainContent = getElement(mainContentSelector);
  const mediaQuery = window.matchMedia ? window.matchMedia('(max-width: 768px)') : null;
  let drawerMode = Boolean(mediaQuery && mediaQuery.matches);

  if (!toggle || !overlay || !sidebar) {
    return {
      open: () => {},
      close: () => {},
      toggle: () => {},
      isOpen: () => false,
    };
  }

  let isOpen = false;
  let lastFocused = null;
  let focusable = [];

  const updateFocusable = () => {
    focusable = getFocusableElements(sidebar);
  };

  const setMainContentState = (hidden) => {
    if (!mainContent) {
      return;
    }

    if (hidden) {
      mainContent.setAttribute('aria-hidden', 'true');
      if ('inert' in mainContent) {
        mainContent.inert = true;
      } else {
        mainContent.setAttribute('inert', '');
      }
    } else {
      mainContent.removeAttribute('aria-hidden');
      if ('inert' in mainContent) {
        mainContent.inert = false;
      }
      mainContent.removeAttribute('inert');
    }
  };

  const setSidebarState = (open) => {
    if ('inert' in sidebar) {
      sidebar.inert = !open;
    } else if (open) {
      sidebar.removeAttribute('inert');
    } else {
      sidebar.setAttribute('inert', '');
    }
  };

  const setAriaState = (open) => {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (!drawerMode) {
      sidebar.setAttribute('aria-hidden', 'false');
      setSidebarState(true);
      return;
    }
    sidebar.setAttribute('aria-hidden', open ? 'false' : 'true');
    setSidebarState(open);
  };

  const open = () => {
    if (!drawerMode || isOpen) {
      return;
    }
    isOpen = true;
    lastFocused = document.activeElement;
    addClass(document.body, BODY_OPEN_CLASS);
    setAriaState(true);
    setMainContentState(true);
    updateFocusable();

    const target = focusable[0] || toggle;
    if (target && typeof target.focus === 'function') {
      target.focus();
    }
  };

  const close = () => {
    if (!drawerMode || !isOpen) {
      return;
    }
    isOpen = false;
    removeClass(document.body, BODY_OPEN_CLASS);
    setAriaState(false);
    setMainContentState(false);

    if (lastFocused && document.contains(lastFocused)) {
      lastFocused.focus();
    } else {
      toggle.focus();
    }
  };

  const toggleDrawer = () => {
    if (!drawerMode) {
      return;
    }
    if (isOpen) {
      close();
    } else {
      open();
    }
  };

  if (!toggle.hasAttribute('aria-controls')) {
    toggle.setAttribute('aria-controls', sidebar.id || 'sidebar');
  }
  const updateDrawerMode = () => {
    drawerMode = Boolean(mediaQuery && mediaQuery.matches);
    if (!drawerMode) {
      removeClass(document.body, BODY_OPEN_CLASS);
      isOpen = false;
      setMainContentState(false);
    }
    setAriaState(isOpen);
  };

  updateDrawerMode();

  if (mediaQuery && mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', updateDrawerMode);
  } else if (mediaQuery && mediaQuery.addListener) {
    mediaQuery.addListener(updateDrawerMode);
  }

  addEventListener(toggle, 'click', toggleDrawer);
  addEventListener(overlay, 'click', close);

  sidebar.querySelectorAll('.anchor-link[href^="#"]').forEach((link) => {
    addEventListener(link, 'click', (event) => {
      const target = link.getAttribute('href') || '';
      if (!target.startsWith('#')) {
        return;
      }
      event.preventDefault();
      const sectionId = target.replace('#', '');
      if (sectionIds.includes(sectionId) && typeof onSectionChange === 'function') {
        onSectionChange(sectionId, true);
      }
      close();
    });
  });

  addEventListener(window, 'keydown', (event) => {
    if (!isOpen) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === 'Tab') {
      trapFocus(event, sidebar, toggle);
    }
  });

  return {
    open,
    close,
    toggle: toggleDrawer,
    isOpen: () => isOpen,
  };
}

function getFocusableElements(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS)).filter((element) => {
    if (element.hasAttribute('disabled')) {
      return false;
    }
    if (element.getAttribute('aria-hidden') === 'true') {
      return false;
    }
    return true;
  });
}

function trapFocus(event, sidebar, fallback) {
  const focusable = getFocusableElements(sidebar);
  if (!focusable.length) {
    event.preventDefault();
    fallback.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;

  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
    return;
  }

  if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

export function setActiveSection(sectionIds, activeId, syncHash) {
  if (activeId && activeId === currentActiveId && !syncHash) {
    return;
  }

  currentActiveId = activeId || null;

  sectionIds.forEach((id) => {
    const section = getElement(`#${id}`);
    if (!section) {
      return;
    }

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
      link.setAttribute('aria-current', 'page');
    } else {
      removeClass(link, 'active');
      link.removeAttribute('aria-current');
    }
  });

  if (syncHash && activeId) {
    window.location.hash = activeId;
  }
}
