import { clearElement } from './dom-utils.js';

export function renderParagraphs(container, lines) {
  if (!container) {
    return;
  }
  clearElement(container);
  lines.forEach((text) => {
    const p = document.createElement('p');
    p.textContent = text;
    container.appendChild(p);
  });
}

export function renderKeywords(container, keywords, resolveAxisLabel) {
  if (!container) {
    return;
  }
  clearElement(container);
  keywords.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'keyword-item';
    const badge = item.category
      ? `<span class="axis-badge">${resolveAxisLabel(item.category)}</span>`
      : '';
    card.innerHTML = `<p><b>${item.label}</b>${badge}${item.desc}</p>`;
    container.appendChild(card);
  });
}

export function renderQA(container, qa) {
  if (!container) {
    return;
  }
  clearElement(container);
  qa.forEach((item) => {
    const node = document.createElement('article');
    node.className = 'qa-item';
    node.innerHTML = `<h3>${item.q}</h3><p>${item.a}</p>`;
    container.appendChild(node);
  });
}

export function renderTimeline(container, timeline) {
  if (!container) {
    return;
  }
  clearElement(container);
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

export function renderPrinciples(container, principles) {
  if (!container) {
    return;
  }
  clearElement(container);
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

export function renderSupportActions(container, actions) {
  if (!container) {
    return;
  }
  clearElement(container);
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

export function renderMembers(container, members, resolveAxisLabel) {
  if (!container) {
    return;
  }
  clearElement(container);
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
    const badge = item.category
      ? `<span class="axis-badge">${resolveAxisLabel(item.category)}</span>`
      : '';
    card.innerHTML = `<h3>${item.name}${badge}</h3><p class="member-role">${item.role}</p><p class="member-bio">${item.bio}</p>`;
    container.appendChild(card);
  });
}

export function renderEvents(container, events, resolveAxisLabel) {
  if (!container) {
    return;
  }
  clearElement(container);
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
    const badge = item.category
      ? `<span class="axis-badge">${resolveAxisLabel(item.category)}</span>`
      : '';
    card.innerHTML = `<h3>${item.title}${badge}</h3><p class="member-role">${item.date}・${item.location}</p><p class="member-bio">${item.desc}</p>`;
    container.appendChild(card);
  });
}

export function resolveAxisLabel(code, axisMeta) {
  if (!code) {
    return '';
  }

  const axis = axisMeta[code];
  if (!axis) {
    return code;
  }

  return `${axis.label}｜${axis.name}`;
}

export function renderEpisodeNav(nav, episodes, currentSlug, selectEpisode, closeDrawer) {
  if (!nav) {
    return;
  }
  clearElement(nav);

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

export function renderMainContent(data, setTextById, renderFunctions) {
  const ep = data.episode;

  setTextById('episodeTitle', ep.title);
  setTextById('siteQuote', data.site.quote);
  setTextById('siteSubtitle', data.site.subtitle);
  setTextById('historyTitle', ep.history.title);

  renderFunctions.renderParagraphs(
    document.getElementById('historyBody'),
    ep.history.body || []
  );

  renderFunctions.renderKeywords(
    document.getElementById('keywords'),
    ep.history.keywords || []
  );

  renderFunctions.renderTimeline(
    document.getElementById('timeline'),
    ep.history.timeline || []
  );

  setTextById('meaningTitle', ep.meaning.title);

  renderFunctions.renderParagraphs(
    document.getElementById('meaningBody'),
    ep.meaning.body || []
  );

  renderFunctions.renderPrinciples(
    document.getElementById('principles'),
    ep.meaning.principles || []
  );

  renderFunctions.renderQA(
    document.getElementById('qaList'),
    ep.qa || []
  );

  setTextById('ctaTitle', ep.cta.title);
  setTextById('ctaBody', ep.cta.body);

  renderFunctions.renderSupportActions(
    document.getElementById('supportActions'),
    ep.cta.actions || []
  );

  const fbLink = document.getElementById('fbLink');
  if (fbLink) {
    fbLink.href = data.site.fb;
    fbLink.textContent = `${data.site.name} Facebook 粉絲團`;
  }
}
