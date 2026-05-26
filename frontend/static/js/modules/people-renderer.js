import { clearElement } from './dom-utils.js';

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
