let episodeIndex = [];
let currentSlug = '';

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
    card.innerHTML = `<p><b>${item.label}</b>${item.desc}</p>`;
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

function resolveInitialSlug() {
  return parseHashEpisodeSlug() || (episodeIndex.length ? episodeIndex[0].slug : 'ep1');
}

function openDrawer() {
  document.body.classList.add('sidebar-open');
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
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });
}

function render(data) {
  const ep = data.episode;

  document.getElementById('episodeTitle').textContent = ep.title;
  document.getElementById('siteQuote').textContent = data.site.quote;
  document.getElementById('siteSubtitle').textContent = data.site.subtitle;
  document.getElementById('author').textContent = `作者：${ep.author}`;

  renderParagraphs(document.getElementById('lead'), ep.lead || []);

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

    const meta = await loadEpisodeIndex();
    episodeIndex = meta.episodes;

    const slug = resolveInitialSlug();
    await selectEpisode(slug, !window.location.hash);

    window.addEventListener('hashchange', async () => {
      const hashSlug = parseHashEpisodeSlug();
      if (hashSlug && hashSlug !== currentSlug) {
        await selectEpisode(hashSlug, false);
      }
    });
  } catch (err) {
    document.getElementById('episodeTitle').textContent = '載入失敗';
    document.getElementById('siteQuote').textContent = '請稍後重新整理頁面。';
  }
}

init();
