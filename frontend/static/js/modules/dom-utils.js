/**
 * DOM 工具函數
 * 提供常用的 DOM 操作
 */

/**
 * 根據 ID 設置元素文本
 */
export function setTextById(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = value;
  }
}

/**
 * 取得 DOM 元素
 */
export function getElement(selector) {
  return document.querySelector(selector);
}

/**
 * 取得所有符合的 DOM 元素
 */
export function getAllElements(selector) {
  return document.querySelectorAll(selector);
}

/**
 * 添加 CSS 類
 */
export function addClass(element, className) {
  if (element) {
    element.classList.add(className);
  }
}

/**
 * 移除 CSS 類
 */
export function removeClass(element, className) {
  if (element) {
    element.classList.remove(className);
  }
}

/**
 * 切換 CSS 類
 */
export function toggleClass(element, className, force) {
  if (element) {
    element.classList.toggle(className, force);
  }
}

/**
 * 檢查元素是否有類
 */
export function hasClass(element, className) {
  return element ? element.classList.contains(className) : false;
}

/**
 * 清空元素內容
 */
export function clearElement(element) {
  if (element) {
    element.innerHTML = '';
  }
}

/**
 * 添加事件監聽器
 */
export function addEventListener(element, event, handler, options = {}) {
  if (element) {
    element.addEventListener(event, handler, options);
  }
}

/**
 * 移除事件監聽器
 */
export function removeEventListener(element, event, handler) {
  if (element) {
    element.removeEventListener(event, handler);
  }
}

/**
 * 平滑滾動到元素
 */
export function smoothScrollTo(element, offset = 0) {
  if (element) {
    const top = element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

/**
 * 創建 DOM 元素
 */
export function createElement(tag, options = {}) {
  const element = document.createElement(tag);
  if (options.className) {
    element.className = options.className;
  }
  if (options.text) {
    element.textContent = options.text;
  }
  if (options.html) {
    element.innerHTML = options.html;
  }
  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }
  return element;
}
