// AutoPrácticas - Popup Script

let emails = [];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadEmails();
  setupEventListeners();
});

// Load emails from storage
async function loadEmails() {
  const result = await chrome.storage.local.get(['capturedEmails']);
  emails = result.capturedEmails || [];
  renderEmails();
  updateStats();
}

// Render email list
function renderEmails() {
  const list = document.getElementById('emailList');
  const empty = document.getElementById('emptyState');

  if (emails.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = emails.map((email, index) => `
    <div class="email-item" data-index="${index}">
      <button class="email-delete" data-delete="${index}" title="Eliminar">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div class="email-header">
        <span class="email-from">${escapeHtml(email.fromName || email.from)}</span>
        <span class="email-source">${email.source}</span>
      </div>
      <div class="email-subject">${escapeHtml(email.subject)}</div>
      <div class="email-date">${formatDate(email.capturedAt)}</div>
    </div>
  `).join('');
}

// Update statistics
function updateStats() {
  document.getElementById('totalCount').textContent = emails.length;

  const today = new Date().toDateString();
  const todayCount = emails.filter(e =>
    new Date(e.capturedAt).toDateString() === today
  ).length;
  document.getElementById('todayCount').textContent = todayCount;
}

// Setup event listeners
function setupEventListeners() {
  // Email click
  document.getElementById('emailList').addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('[data-delete]');
    if (deleteBtn) {
      const index = parseInt(deleteBtn.dataset.delete);
      deleteEmail(index);
      return;
    }

    const item = e.target.closest('.email-item');
    if (item) {
      const index = parseInt(item.dataset.index);
      showDetail(index);
    }
  });

  // Back button
  document.getElementById('backBtn').addEventListener('click', hideDetail);

  // Copy all
  document.getElementById('copyBtn').addEventListener('click', copyAll);

  // Clear all
  document.getElementById('clearBtn').addEventListener('click', clearAll);
}

// Show email detail
function showDetail(index) {
  const email = emails[index];
  if (!email) return;

  document.getElementById('listView').style.display = 'none';
  document.getElementById('detailView').classList.add('active');

  document.getElementById('detailContent').innerHTML = `
    <div class="detail-field">
      <div class="detail-label">De</div>
      <div class="detail-value">${escapeHtml(email.fromName)} &lt;${escapeHtml(email.from)}&gt;</div>
    </div>
    <div class="detail-field">
      <div class="detail-label">Asunto</div>
      <div class="detail-value">${escapeHtml(email.subject)}</div>
    </div>
    <div class="detail-field">
      <div class="detail-label">Fecha</div>
      <div class="detail-value">${formatDate(email.date)}</div>
    </div>
    <div class="detail-field">
      <div class="detail-label">Contenido</div>
      <div class="detail-value detail-body">${escapeHtml(email.body)}</div>
    </div>
  `;
}

// Hide detail view
function hideDetail() {
  document.getElementById('listView').style.display = 'block';
  document.getElementById('detailView').classList.remove('active');
}

// Delete single email
async function deleteEmail(index) {
  emails.splice(index, 1);
  await chrome.storage.local.set({ capturedEmails: emails });
  renderEmails();
  updateStats();
  showToast('Correo eliminado');
}

// Copy all emails as JSON
async function copyAll() {
  if (emails.length === 0) {
    showToast('No hay correos para copiar');
    return;
  }

  // Format for import into AutoPrácticas
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    source: 'autopracticas-extension',
    emails: emails.map(e => ({
      from: e.from,
      fromName: e.fromName,
      subject: e.subject,
      body: e.body,
      date: e.date
    }))
  };

  try {
    await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    showToast(`${emails.length} correo(s) copiados al portapapeles`);
  } catch (err) {
    showToast('Error al copiar');
  }
}

// Clear all emails
async function clearAll() {
  if (emails.length === 0) return;

  if (confirm('¿Eliminar todos los correos capturados?')) {
    emails = [];
    await chrome.storage.local.set({ capturedEmails: [] });
    renderEmails();
    updateStats();
    showToast('Todos los correos eliminados');
  }
}

// Show toast notification
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// Format date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-PA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}
