let episodeIndex = [];

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

function renderEpisodeNav(episodes, currentSlug) {
  const nav = document.getElementById('episodeNav');
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

function resolveSlug() {
  const hash = window.location.hash.replace('#', '').trim().toLowerCase();
  const exists = episodeIndex.find((item) => item.slug === hash);
  if (exists) {
    return hash;
  }
  return episodeIndex.length ? episodeIndex[0].slug : 'ep1';
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
  document.getElementById('episodeTitle').textContent = data.episode.title;
  document.getElementById('siteQuote').textContent = data.site.quote;
  document.getElementById('siteSubtitle').textContent = data.site.subtitle;
  document.getElementById('author').textContent = `作者：${data.episode.author}`;

  renderParagraphs(document.getElementById('lead'), data.episode.lead);

  document.getElementById('historyTitle').textContent = data.history.title;
  renderParagraphs(document.getElementById('historyBody'), data.history.body);
  renderKeywords(document.getElementById('keywords'), data.history.keywords);

  document.getElementById('meaningTitle').textContent = data.meaning.title;
  renderParagraphs(document.getElementById('meaningBody'), data.meaning.body);

  renderQA(document.getElementById('qaList'), data.qa);

  document.getElementById('ctaTitle').textContent = data.cta.title;
  document.getElementById('ctaBody').textContent = data.cta.body;

  const fbLink = document.getElementById('fbLink');
  fbLink.href = data.site.fb;
  fbLink.textContent = `${data.site.name} Facebook 粉絲團`;
}

async function selectEpisode(slug, syncHash) {
  const data = await loadEpisode(slug);
  render(data);
  renderEpisodeNav(episodeIndex, slug);

  if (syncHash) {
    window.location.hash = slug;
  }
}

async function init() {
  try {
    bindDrawer();

    const meta = await loadEpisodeIndex();
    episodeIndex = meta.episodes;

    const slug = resolveSlug();
    await selectEpisode(slug, !window.location.hash);

    window.addEventListener('hashchange', async () => {
      const hashSlug = resolveSlug();
      await selectEpisode(hashSlug, false);
    });
  } catch (err) {
    document.getElementById('episodeTitle').textContent = '載入失敗';
    document.getElementById('siteQuote').textContent = '請稍後重新整理頁面。';
  }
}

init();
