/**
 * 主應用程序入口
 * 团・鐵道 Web Application
 * 
 * 此文件整合所有模塊並初始化應用程序
 */

import apiClient from './api/api-client.js';
import { SECTION_IDS, TINY_TIPS, DEFAULT_SCHEDULE } from './config.js';
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
let stationLedger = [];

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

    // 3. 並行載入成員、活動和車站數據
    const [members, events, stations] = await Promise.all([
      loadMembers(),
      loadEvents(),
      loadStations(),
    ]);

    // 4. 構建車站時間表
    stationLedger = renderer.buildStationLedger(stations, DEFAULT_SCHEDULE);
    renderSchedule();

    // 5. 渲染成員和活動卡片
    renderMembers(members);
    renderEvents(events);

    // 6. 載入初始章節
    const slug = episode.resolveInitialSlug(episodeIndex);
    await loadAndRenderEpisode(slug, false);

    // 7. 設置初始區域
    const initialSection = episode.parseHashSectionId(SECTION_IDS) || 'introSection';
    drawer.setActiveSection(SECTION_IDS, initialSection, !!window.location.hash);

    // 8. 監聽哈希變化
    setupHashListener();

    // 9. 隱藏加載器
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
 * 載入車站
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
 * 渲染時間表
 */
function renderSchedule() {
  const track = domUtils.getElement('#transitLedgerTrack');
  renderer.renderTransitLedger(track, stationLedger, DEFAULT_SCHEDULE);
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
