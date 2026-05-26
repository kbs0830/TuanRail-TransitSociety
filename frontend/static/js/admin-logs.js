const elements = {
  renderCheckBtn: document.getElementById('renderCheckBtn'),
  renderSyncBtn: document.getElementById('renderSyncBtn'),
  renderCheckStatus: document.getElementById('renderCheckStatus'),
  renderSyncStatus: document.getElementById('renderSyncStatus'),
};

async function postJson(url) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const payload = await res.json();
  return { res, payload };
}

function bindAction({ button, status, endpoint, pendingText, fallbackError, buildSuccess, reloadOnSuccess }) {
  if (!button || !status) {
    return;
  }

  const setBusy = (busy) => {
    button.disabled = busy;
    status.setAttribute('aria-busy', busy ? 'true' : 'false');
  };

  setBusy(false);

  button.addEventListener('click', async () => {
    if (button.disabled) {
      return;
    }

    setBusy(true);
    status.textContent = pendingText;
    try {
      const { res, payload } = await postJson(endpoint);
      if (!res.ok || !payload.ok) {
        status.textContent = payload.message || fallbackError;
        return;
      }

      status.textContent = buildSuccess(payload);
      if (reloadOnSuccess) {
        window.location.reload();
      }
    } catch (_err) {
      status.textContent = fallbackError;
    } finally {
      setBusy(false);
    }
  });
}

bindAction({
  button: elements.renderCheckBtn,
  status: elements.renderCheckStatus,
  endpoint: '/api/admin/render-check',
  pendingText: '檢查中...',
  fallbackError: 'Render 檢查失敗，請稍後再試。',
  buildSuccess: (payload) =>
    `Render 連線成功，HTTP ${payload.data.status}。${payload.data.note}`,
  reloadOnSuccess: true,
});

bindAction({
  button: elements.renderSyncBtn,
  status: elements.renderSyncStatus,
  endpoint: '/api/admin/render-sync',
  pendingText: '同步中...',
  fallbackError: 'Render logs 同步失敗，請稍後再試。',
  buildSuccess: (payload) => payload.message || 'Render logs 同步完成。',
  reloadOnSuccess: true,
});
