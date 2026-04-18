let episodeIndex = [];
let currentSlug = '';
let axisMeta = {};
const SECTION_IDS = ['introSection', 'orgSection', 'historySection', 'meaningSection', 'qaSection', 'supportSection', 'membersSection', 'eventsSection'];
const tinyTips = [
  '搭乘列車時，先下後上，月台通行會更順暢。',
  '公車上車前預先準備票卡，可讓停靠更有效率。',
  '尖峰時段若能錯峰 10 分鐘，通勤體感會明顯改善。',
  '拍攝鐵道時請站在安全線外，文化熱情也要以安全為先。',
];

async function loadEpisodeIndex() {
  const res = await fetch('/api/episodes');
  if (!res.ok) {
    throw new Error('無法載入內容');
  }

  const payload = await res.json();
  if (!payload.ok) {
    throw new Error('內容格式錯誤');
  }

  return payload.data;
}

async function loadEpisode(slug) {
  const res = await fetch(`/api/episodes/${slug}`);
  if (!res.ok) {
    throw new Error('無法載入章節');
  }

  const payload = await res.json();
  if (!payload.ok) {
    throw new Error('章節格式錯誤');
  }

  return payload.data;
}

async function loadMembers() {
  const res = await fetch('/api/members');
  if (!res.ok) {
    throw new Error('無法載入成員資料');
  }

  const payload = await res.json();
  if (!payload.ok) {
    throw new Error('成員資料格式錯誤');
  }

  return payload.data.members || [];
}

async function loadEvents() {
  const res = await fetch('/api/events');
  if (!res.ok) {
    throw new Error('無法載入活動資料');
  }

  const payload = await res.json();
  if (!payload.ok) {
    throw new Error('活動資料格式錯誤');
  }

  return payload.data.events || [];
}

function renderParagraphs(container, lines) {
  container.innerHTML = '';
  lines.forEach((text) => {
    const p = document.createElement('p');
    p.textContent = text;
    container.appendChild(p);
  });
}

function renderKeywords(container, keywords) {
  container.innerHTML = '';
  keywords.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'keyword-item';
    const badge = item.category ? `<span class="axis-badge">${resolveAxisLabel(item.category)}</span>` : '';
    card.innerHTML = `<p><b>${item.label}</b>${badge}${item.desc}</p>`;
    container.appendChild(card);
  });
}

function renderQA(container, qa) {
  container.innerHTML = '';
  qa.forEach((item) => {
    const node = document.createElement('article');
    node.className = 'qa-item';
    node.innerHTML = `<h3>${item.q}</h3><p>${item.a}</p>`;
    container.appendChild(node);
  });
}

function renderTimeline(container, timeline) {
  container.innerHTML = '';
  if (!timeline || !timeline.length) {
    container.style.display = 'none';
    return;
  }

  container.style.display = '';
  timeline.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'timeline-item';
    row.innerHTML = `<p class="timeline-phase">${item.phase}</p><p class="timeline-detail">${item.detail}</p>`;
    container.appendChild(row);
  });
}

function renderPrinciples(container, principles) {
  container.innerHTML = '';
  if (!principles || !principles.length) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'grid';
  principles.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'principle-item';
    card.innerHTML = `<h3>${item.title}</h3><p>${item.desc}</p>`;
    container.appendChild(card);
  });
}

function renderSupportActions(container, actions) {
  container.innerHTML = '';
  if (!actions || !actions.length) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'grid';
  actions.forEach((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    container.appendChild(li);
  });
}

function renderMembers(container, members) {
  container.innerHTML = '';
  if (!members || !members.length) {
    const empty = document.createElement('article');
    empty.className = 'event-empty';
    empty.innerHTML = '<p>成員資料準備中，敬請期待。</p>';
    container.appendChild(empty);
    return;
  }

  members.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'member-card';
    const badge = item.category ? `<span class="axis-badge">${resolveAxisLabel(item.category)}</span>` : '';
    card.innerHTML = `<h3>${item.name}${badge}</h3><p class="member-role">${item.role}</p><p class="member-bio">${item.bio}</p>`;
    container.appendChild(card);
  });
}

function renderEvents(container, events) {
  container.innerHTML = '';
  if (!events || !events.length) {
    const empty = document.createElement('article');
    empty.className = 'event-empty';
    empty.innerHTML = '<p>目前活動時程暫留空白，正式公告後會在此更新。</p>';
    container.appendChild(empty);
    return;
  }

  events.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'member-card';
    const badge = item.category ? `<span class="axis-badge">${resolveAxisLabel(item.category)}</span>` : '';
    card.innerHTML = `<h3>${item.title}${badge}</h3><p class="member-role">${item.date}・${item.location}</p><p class="member-bio">${item.desc}</p>`;
    container.appendChild(card);
  });
}

function resolveAxisLabel(code) {
  if (!code) {
    return '';
  }

  const axis = axisMeta[code];
  if (!axis) {
    return code;
  }

  return `${axis.label}｜${axis.name}`;
}

function renderEpisodeNav(episodes, currentSlug) {
  const nav = document.getElementById('episodeNav');
  if (!nav) {
    return;
  }
  nav.innerHTML = '';

  episodes.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `episode-item ${item.status === 'draft' ? 'draft' : ''}`;
    if (item.slug === currentSlug) {
      button.classList.add('active');
    }
    button.innerHTML = `<strong>${item.title}</strong><small>${item.summary}</small>`;
    button.addEventListener('click', () => {
      selectEpisode(item.slug, true);
      closeDrawer();
    });
    nav.appendChild(button);
  });
}

function parseHashEpisodeSlug() {
  const hash = window.location.hash.replace('#', '').trim().toLowerCase();
  const matched = episodeIndex.find((item) => item.slug === hash);
  return matched ? hash : null;
}

function parseHashSectionId() {
  const hash = window.location.hash.replace('#', '').trim();
  const found = SECTION_IDS.find((id) => id === hash);
  return found || null;
}

function resolveInitialSlug() {
  return parseHashEpisodeSlug() || (episodeIndex.length ? episodeIndex[0].slug : 'ep1');
}

function openDrawer() {
  document.body.classList.add('sidebar-open');
}

function bindBackToTop() {
  const button = document.getElementById('backToTop');
  if (!button) {
    return;
  }

  const onScroll = () => {
    button.classList.toggle('show', window.scrollY > 240);
  };

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function hideLoader() {
  const loader = document.getElementById('pageLoader');
  if (!loader) {
    return;
  }
  loader.classList.add('is-hidden');
}

function renderTinyTip() {
  const tip = document.getElementById('tinyTip');
  if (!tip) {
    return;
  }

  const idx = Math.floor(Math.random() * tinyTips.length);
  tip.textContent = tinyTips[idx];
}

function closeDrawer() {
  document.body.classList.remove('sidebar-open');
}

function bindDrawer() {
  const toggle = document.getElementById('drawerToggle');
  const overlay = document.getElementById('drawerOverlay');
  const sidebar = document.getElementById('sidebar');

  toggle.addEventListener('click', () => {
    if (document.body.classList.contains('sidebar-open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  overlay.addEventListener('click', closeDrawer);

  sidebar.querySelectorAll('.anchor-link').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const target = link.getAttribute('href') || '';
      const sectionId = target.replace('#', '');
      if (SECTION_IDS.includes(sectionId)) {
        setActiveSection(sectionId, true);
      }
      closeDrawer();
    });
  });
}

function setActiveSection(activeId, syncHash) {
  SECTION_IDS.forEach((id) => {
    const section = document.getElementById(id);
    if (!section) {
      return;
    }

    if (id === activeId) {
      section.classList.remove('hidden-section');
      section.classList.add('visible-section');
    } else {
      section.classList.remove('visible-section');
      section.classList.add('hidden-section');
    }
  });

  document.querySelectorAll('.anchor-link').forEach((link) => {
    const href = link.getAttribute('href') || '';
    const targetId = href.replace('#', '');
    link.classList.toggle('active', targetId === activeId);
  });

  if (syncHash) {
    window.location.hash = activeId;
  }
}

function startLiveClock() {
  const clock = document.getElementById('liveClock');
  if (!clock) {
    return;
  }

  const tick = () => {
    const now = new Date();
    clock.textContent = now.toLocaleString('zh-TW', {
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Taipei',
    });
  };

  tick();
  window.setInterval(tick, 1000);
}

function render(data) {
  const ep = data.episode;

  document.getElementById('episodeTitle').textContent = ep.title;
  document.getElementById('siteQuote').textContent = data.site.quote;
  document.getElementById('siteSubtitle').textContent = data.site.subtitle;
  document.getElementById('historyTitle').textContent = ep.history.title;
  renderParagraphs(document.getElementById('historyBody'), ep.history.body || []);
  renderKeywords(document.getElementById('keywords'), ep.history.keywords || []);
  renderTimeline(document.getElementById('timeline'), ep.history.timeline || []);

  document.getElementById('meaningTitle').textContent = ep.meaning.title;
  renderParagraphs(document.getElementById('meaningBody'), ep.meaning.body || []);
  renderPrinciples(document.getElementById('principles'), ep.meaning.principles || []);

  renderQA(document.getElementById('qaList'), ep.qa || []);

  document.getElementById('ctaTitle').textContent = ep.cta.title;
  document.getElementById('ctaBody').textContent = ep.cta.body;
  renderSupportActions(document.getElementById('supportActions'), ep.cta.actions || []);

  const fbLink = document.getElementById('fbLink');
  fbLink.href = data.site.fb;
  fbLink.textContent = `${data.site.name} Facebook 粉絲團`;
}

async function selectEpisode(slug, syncHash) {
  const data = await loadEpisode(slug);
  render(data);
  renderEpisodeNav(episodeIndex, slug);
  currentSlug = slug;

  if (syncHash) {
    window.location.hash = slug;
  }
}

async function init() {
  try {
    bindDrawer();
    bindBackToTop();
    startLiveClock();
    renderTinyTip();

    const meta = await loadEpisodeIndex();
    episodeIndex = meta.episodes;
    axisMeta = meta.axes || {};

    const [members, events] = await Promise.all([loadMembers(), loadEvents()]);
    renderMembers(document.getElementById('membersList'), members);
    renderEvents(document.getElementById('eventsList'), events);

    const slug = resolveInitialSlug();
    await selectEpisode(slug, false);

    const initialSection = parseHashSectionId() || 'introSection';
    setActiveSection(initialSection, !!window.location.hash);

    window.addEventListener('hashchange', async () => {
      const hashSlug = parseHashEpisodeSlug();
      if (hashSlug && hashSlug !== currentSlug) {
        await selectEpisode(hashSlug, false);
      }

      const sectionId = parseHashSectionId();
      if (sectionId) {
        setActiveSection(sectionId, false);
      }
    });

    hideLoader();
  } catch (err) {
    document.getElementById('episodeTitle').textContent = '載入失敗';
    document.getElementById('siteQuote').textContent = '請稍後重新整理頁面。';
    hideLoader();
  }
}

init();
