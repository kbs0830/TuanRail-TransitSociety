import { getElement } from './dom-utils.js';

export function parseHashEpisodeSlug(episodeIndex) {
  const hash = window.location.hash.replace('#', '').trim().toLowerCase();
  const matched = episodeIndex.find((item) => item.slug === hash);
  return matched ? hash : null;
}

export function parseHashSectionId(sectionIds) {
  const hash = window.location.hash.replace('#', '').trim();
  const found = sectionIds.find((id) => id === hash);
  return found || null;
}

export function resolveInitialSlug(episodeIndex) {
  return parseHashEpisodeSlug(episodeIndex) || (episodeIndex.length ? episodeIndex[0].slug : '');
}

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
      (newSlug, hashSync) =>
        selectEpisode(
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
