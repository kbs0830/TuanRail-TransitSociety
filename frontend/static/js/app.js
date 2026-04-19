/**
 * 主應用程序入口
 * 团・鐵道 Web Application
 * 
 * 此文件整合所有模塊並初始化應用程序
 */

import apiClient from './api/api-client.js';
import { SECTION_IDS, TINY_TIPS } from './config.js';
import * as domUtils from './modules/dom-utils.js';
import * as renderer from './modules/renderer.js';
import * as drawer from './modules/drawer.js';
import * as scroll from './modules/scroll.js';
import * as episode from './modules/episode.js';

// ============================================
// 全局狀態
// ============================================

let episodeIndex = [];
let currentSlug = '';
let axisMeta = {};
let stationCache = [];
let trainBoardIntervalId = null;

const TRAIN_VIA_OPTIONS = ['南迴', '北迴', '山線', '海線'];
const TRAIN_TYPES = ['區間', '自強'];
const FALLBACK_STATIONS = ['臺北', '臺中', '高雄', '花蓮', '屏東'];

// ============================================
// 初始化函數
// ============================================

/**
 * 主初始化函數
 */
async function init() {
  try {
    // 1. 設置基本事件監聽
    setupEventListeners();
    
    // 2. 載入索引和元數據
    const meta = await loadMetadata();
    episodeIndex = meta.episodes;
    axisMeta = meta.axes || {};

    // 3. 並行載入成員和活動數據
    const [members, events, stations] = await Promise.all([
      loadMembers(),
      loadEvents(),
      loadStations(),
    ]);

    // 4. 渲染成員和活動卡片
    renderMembers(members);
    renderEvents(events);
    stationCache = stations;
    renderNextTrainBoard(stationCache, false);
    startTrainBoardRefresh();

    // 5. 載入初始章節
    const slug = episode.resolveInitialSlug(episodeIndex);
    await loadAndRenderEpisode(slug, false);

    // 6. 設置初始區域
    const initialSection = episode.parseHashSectionId(SECTION_IDS) || 'introSection';
    drawer.setActiveSection(SECTION_IDS, initialSection, !!window.location.hash);

    // 7. 監聽哈希變化
    setupHashListener();

    // 8. 隱藏加載器
    scroll.hideLoader();
  } catch (err) {
    console.error('應用程序初始化錯誤:', err);
    domUtils.setTextById('episodeTitle', '載入失敗');
    domUtils.setTextById('siteQuote', '請稍後重新整理頁面。');
    scroll.hideLoader();
  }
}

// ============================================
// 設置函數
// ============================================

/**
 * 設置事件監聽
 */
function setupEventListeners() {
  scroll.bindBackToTop();
  scroll.startLiveClock();
  scroll.renderTinyTip(TINY_TIPS);
  
  // 綁定抽屜菜單
  const closeDrawerFn = () => drawer.closeDrawer();
  const setActiveSectionFn = (sectionId, syncHash) => 
    drawer.setActiveSection(SECTION_IDS, sectionId, syncHash);
  
  drawer.bindDrawer(SECTION_IDS, setActiveSectionFn, closeDrawerFn);
}

/**
 * 設置哈希變化監聽
 */
function setupHashListener() {
  window.addEventListener('hashchange', async () => {
    const hashSlug = episode.parseHashEpisodeSlug(episodeIndex);
    if (hashSlug && hashSlug !== currentSlug) {
      await loadAndRenderEpisode(hashSlug, false);
    }

    const sectionId = episode.parseHashSectionId(SECTION_IDS);
    if (sectionId) {
      drawer.setActiveSection(SECTION_IDS, sectionId, false);
    }
  });
}

// ============================================
// 數據加載函數
// ============================================

/**
 * 載入元數據
 */
async function loadMetadata() {
  try {
    const data = await apiClient.getEpisodeIndex();
    return data;
  } catch (error) {
    console.error('無法載入索引:', error);
    throw error;
  }
}

/**
 * 載入成員
 */
async function loadMembers() {
  try {
    return await apiClient.getMembers();
  } catch (error) {
    console.error('無法載入成員:', error);
    return [];
  }
}

/**
 * 載入活動
 */
async function loadEvents() {
  try {
    return await apiClient.getEvents();
  } catch (error) {
    console.error('無法載入活動:', error);
    return [];
  }
}

/**
 * 載入車站資料
 */
async function loadStations() {
  try {
    return await apiClient.getStations();
  } catch (error) {
    console.error('無法載入車站資料:', error);
    return [];
  }
}

// ============================================
// 渲染函數
// ============================================

/**
 * 載入並渲染章節
 */
async function loadAndRenderEpisode(slug, syncHash) {
  const renderFunctions = {
    renderParagraphs: renderer.renderParagraphs,
    renderKeywords: (container, keywords) => 
      renderer.renderKeywords(container, keywords, (code) => 
        renderer.resolveAxisLabel(code, axisMeta)
      ),
    renderQA: renderer.renderQA,
    renderTimeline: renderer.renderTimeline,
    renderPrinciples: renderer.renderPrinciples,
    renderSupportActions: renderer.renderSupportActions,
  };

  const updatedSlug = await episode.selectEpisode(
    slug,
    syncHash,
    currentSlug,
    episodeIndex,
    apiClient,
    renderer.renderMainContent,
    (nav, episodes, currentSlug, selectFn, closeFn) =>
      renderer.renderEpisodeNav(nav, episodes, currentSlug, selectFn, closeFn),
    domUtils.setTextById,
    drawer.closeDrawer,
    renderFunctions
  );

  currentSlug = updatedSlug;
}

/**
 * 渲染成員卡片
 */
function renderMembers(members) {
  const container = domUtils.getElement('#membersList');
  renderer.renderMembers(
    container,
    members,
    (code) => renderer.resolveAxisLabel(code, axisMeta)
  );
}

/**
 * 渲染活動卡片
 */
function renderEvents(events) {
  const container = domUtils.getElement('#eventsList');
  renderer.renderEvents(
    container,
    events,
    (code) => renderer.resolveAxisLabel(code, axisMeta)
  );
}

/**
 * 渲染翻牌顯示器
 */
function renderNextTrainBoard(stations, animate) {
  const container = domUtils.getElement('#nextTrainBoard');
  if (!container) {
    return;
  }

  domUtils.clearElement(container);
  const rows = buildNextTrainRows(stations, 2);
  rows.forEach((row, index) => {
    const item = document.createElement('div');
    item.className = 'flip-row';
    item.setAttribute('data-row', String(index + 1));
    item.appendChild(createFlipPair('開往', row.destination));
    item.appendChild(createFlipPair('車次', row.trainNo));
    item.appendChild(createFlipPair('經由', row.via));
    item.appendChild(createFlipPair('車種', row.type));
    item.appendChild(createFlipPair('開車時刻', row.time));
    container.appendChild(item);
  });

  if (animate) {
    triggerFlipAnimation(container);
  }
}

function startTrainBoardRefresh() {
  if (trainBoardIntervalId) {
    window.clearInterval(trainBoardIntervalId);
  }

  trainBoardIntervalId = window.setInterval(() => {
    renderNextTrainBoard(stationCache, true);
  }, 3000);
}

function triggerFlipAnimation(container) {
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

function createFlipPair(label, value) {
  const pair = document.createElement('span');
  pair.className = 'flip-pair';

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

  return picks.map((destination, index) =>
    buildTrainRow(destination, 10 + index * 12)
  );
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

// ============================================
// 應用程序啟動
// ============================================

// 當 DOM 準備完畢時啟動應用
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
