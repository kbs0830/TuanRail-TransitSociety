import apiClient from '../api/api-client.js';
import { safeFetch } from '../api/api-utils.js';
import { SECTION_IDS, TINY_TIPS } from '../config.js';
import * as domUtils from './dom-utils.js';
import * as renderer from './renderer.js';
import * as peopleRenderer from './people-renderer.js';
import * as drawer from './drawer.js';
import * as scroll from './scroll.js';
import * as episode from './episode.js';
import { createTrainBoard } from './train-board.js';
import { createStationClock } from './station-clock.js';

export function createHomeController() {
  const state = {
    episodeIndex: [],
    currentSlug: '',
    axisMeta: {},
  };

  const elements = {
    nextTrainBoard: null,
    membersList: null,
    eventsList: null,
    stationClock: null,
  };

  let trainBoard = null;
  let drawerController = null;

  const renderFunctions = {
    renderParagraphs: renderer.renderParagraphs,
    renderKeywords: (container, keywords) =>
      renderer.renderKeywords(container, keywords, (code) =>
        renderer.resolveAxisLabel(code, state.axisMeta)
      ),
    renderQA: renderer.renderQA,
    renderTimeline: renderer.renderTimeline,
    renderPrinciples: renderer.renderPrinciples,
    renderSupportActions: renderer.renderSupportActions,
  };

  const cacheDom = () => {
    elements.nextTrainBoard = domUtils.getElement('#nextTrainBoard');
    elements.membersList = domUtils.getElement('#membersList');
    elements.eventsList = domUtils.getElement('#eventsList');
    elements.stationClock = domUtils.getElement('#stationClock');
  };

  const setupDrawer = () => {
    drawerController = drawer.createDrawerController({
      sectionIds: SECTION_IDS,
      onSectionChange: (sectionId, syncHash) =>
        drawer.setActiveSection(SECTION_IDS, sectionId, syncHash),
    });
  };

  const setupEventListeners = () => {
    scroll.bindBackToTop();
    scroll.startLiveClock();
    scroll.renderTinyTip(TINY_TIPS);
    setupDrawer();
    createStationClock(elements.stationClock);

    window.addEventListener('hashchange', handleHashChange);
  };

  const handleHashChange = async () => {
    const hashSlug = episode.parseHashEpisodeSlug(state.episodeIndex);
    if (hashSlug && hashSlug !== state.currentSlug) {
      await loadAndRenderEpisode(hashSlug, false);
    }

    const sectionId = episode.parseHashSectionId(SECTION_IDS);
    if (sectionId) {
      drawer.setActiveSection(SECTION_IDS, sectionId, false);
    }
  };

  const loadMetadata = async () => {
    try {
      return await apiClient.getEpisodeIndex();
    } catch (error) {
      console.error('無法載入索引:', error);
      throw error;
    }
  };

  const loadAndRenderEpisode = async (slug, syncHash) => {
    const updatedSlug = await episode.selectEpisode(
      slug,
      syncHash,
      state.currentSlug,
      state.episodeIndex,
      apiClient,
      renderer.renderMainContent,
      (nav, episodes, currentSlug, selectFn, closeFn) =>
        renderer.renderEpisodeNav(nav, episodes, currentSlug, selectFn, closeFn),
      domUtils.setTextById,
      () => {
        if (drawerController) {
          drawerController.close();
        }
      },
      renderFunctions
    );

    state.currentSlug = updatedSlug;
  };

  const initTrainBoard = (stations) => {
    if (!elements.nextTrainBoard) {
      return;
    }

    trainBoard = createTrainBoard(elements.nextTrainBoard);
    trainBoard.setStations(stations);
    trainBoard.start();
  };

  const renderMembers = (members) => {
    peopleRenderer.renderMembers(
      elements.membersList,
      members,
      (code) => renderer.resolveAxisLabel(code, state.axisMeta)
    );
  };

  const renderEvents = (events) => {
    peopleRenderer.renderEvents(
      elements.eventsList,
      events,
      (code) => renderer.resolveAxisLabel(code, state.axisMeta)
    );
  };

  const init = async () => {
    try {
      cacheDom();
      setupEventListeners();

      const meta = await loadMetadata();
      state.episodeIndex = meta.episodes || [];
      state.axisMeta = meta.axes || {};

      const [members, events, stations] = await Promise.all([
        safeFetch(() => apiClient.getMembers(), [], '成員'),
        safeFetch(() => apiClient.getEvents(), [], '活動'),
        safeFetch(() => apiClient.getStations(), [], '車站資料'),
      ]);

      renderMembers(members);
      renderEvents(events);
      initTrainBoard(stations);

      const slug = episode.resolveInitialSlug(state.episodeIndex);
      if (slug) {
        await loadAndRenderEpisode(slug, false);
      }

      const initialSection = episode.parseHashSectionId(SECTION_IDS) || 'introSection';
      drawer.setActiveSection(SECTION_IDS, initialSection, !!window.location.hash);
    } catch (err) {
      console.error('應用程序初始化錯誤:', err);
      domUtils.setTextById('episodeTitle', '載入失敗');
      domUtils.setTextById('siteQuote', '請稍後重新整理頁面。');
    } finally {
      scroll.hideLoader();
    }
  };

  return {
    init,
  };
}
