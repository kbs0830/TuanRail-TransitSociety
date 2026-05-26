export function setTextById(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = value;
  }
}

export function getElement(selector) {
  return document.querySelector(selector);
}

export function getAllElements(selector) {
  return document.querySelectorAll(selector);
}

export function addClass(element, className) {
  if (element) {
    element.classList.add(className);
  }
}

export function removeClass(element, className) {
  if (element) {
    element.classList.remove(className);
  }
}

export function clearElement(element) {
  if (element) {
    element.innerHTML = '';
  }
}

export function addEventListener(element, event, handler, options = {}) {
  if (element) {
    element.addEventListener(event, handler, options);
  }
}
