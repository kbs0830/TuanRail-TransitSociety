import { createHomeController } from './modules/home-controller.js';

const controller = createHomeController();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => controller.init());
} else {
  controller.init();
}
