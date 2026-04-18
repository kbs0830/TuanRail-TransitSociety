/**
 * 章節管理模塊
 * 處理章節選擇和哈希管理
 */

import { getElement } from './dom-utils.js';

/**
 * 解析哈希中的章節 slug
 */
export function parseHashEpisodeSlug(episodeIndex) {
  const hash = window.location.hash.replace('#', '').trim().toLowerCase();
  const matched = episodeIndex.find((item) => item.slug === hash);
  return matched ? hash : null;
}

/**
 * 解析哈希中的區域 ID
 */
export function parseHashSectionId(sectionIds) {
  const hash = window.location.hash.replace('#', '').trim();
  const found = sectionIds.find((id) => id === hash);
  return found || null;
}

/**
 * 解析初始 slug
 */
export function resolveInitialSlug(episodeIndex) {
  return parseHashEpisodeSlug(episodeIndex) || (episodeIndex.length ? episodeIndex[0].slug : '');
}

/**
 * 選擇章節
 */
export async function selectEpisode(
  slug,
  syncHash,
  currentSlug,
  episodeIndex,
  apiClient,
  renderMainContent,
  renderEpisodeNav,
  setTextById,
  closeDrawer,
  renderFunctions
) {
  try {
    const data = await apiClient.getEpisode(slug);
    
    renderMainContent(data, setTextById, renderFunctions);
    renderEpisodeNav(
      getElement('#episodeNav'),
      episodeIndex,
      slug,
      (newSlug, hashSync) => selectEpisode(
        newSlug,
        hashSync,
        slug,
        episodeIndex,
        apiClient,
        renderMainContent,
        renderEpisodeNav,
        setTextById,
        closeDrawer,
        renderFunctions
      ),
      closeDrawer
    );

    if (syncHash) {
      window.location.hash = slug;
    }

    return slug;
  } catch (error) {
    console.error('無法載入章節:', error);
    setTextById('episodeTitle', '載入失敗');
    setTextById('siteQuote', '請稍後重新整理頁面。');
    throw error;
  }
}
