// AutoPrácticas - Content Script
// Runs on Outlook Web, Gmail and Localhost (React App)

(function() {
  'use strict';

  // Avoid running multiple times
  if (window.autoPracticasInjected) return;
  window.autoPracticasInjected = true;

  // Detect context
  const isOutlook = window.location.hostname.includes('outlook');
  const isGmail = window.location.hostname.includes('mail.google.com');
  const isApp = window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1' ||
                window.location.hostname.endsWith('.netlify.app') ||
                window.location.hostname.endsWith('.vercel.app');

  // ==========================================
  // 1. MODO INTEGRACIÓN (CORRE EN LOCALHOST)
  // ==========================================
  if (isApp) {
    initAppIntegration();
    return;
  }

  // ==========================================
  // 2. MODO CAPTURA (CORRE EN OUTLOOK/GMAIL)
  // ==========================================

  // Create floating capture button
  function createCaptureButton() {
    const existing = document.getElementById('autopracticas-capture-btn');
    if (existing) existing.remove();

    const btn = document.createElement('div');
    btn.id = 'autopracticas-capture-btn';
    btn.innerHTML = `
      <div class="ap-btn-inner">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span>Capturar</span>
      </div>
    `;
    btn.addEventListener('click', captureCurrentEmail);
    document.body.appendChild(btn);
    console.log('AutoPrácticas: Botón de captura inyectado con éxito.');
  }

  // Extract email data based on the service
  function extractEmailData() {
    if (isOutlook) {
      return extractOutlookEmail();
    } else if (isGmail) {
      return extractGmailEmail();
    }
    return null;
  }

  // Extract from Outlook Web
  function extractOutlookEmail() {
    try {
      console.log('AutoPrácticas: Iniciando extracción de Outlook...');

      // Get the email reading pane container
      const readingPane = document.querySelector('[role="main"]') ||
                          document.querySelector('.ReadingPaneContents') ||
                          document.querySelector('[data-app-section="ReadingPane"]') ||
                          document.querySelector('[aria-label="Mensaje"]') ||
                          document.querySelector('[aria-label="Reading Pane"]');

      if (!readingPane) {
        console.warn('AutoPrácticas: No se encontró el contenedor del panel de lectura principal.');
      }

      // 1. Text Selection Fallback (High priority)
      const selectedText = window.getSelection().toString().trim();

      // 2. Subject Extraction
      let subject = '';
      const subjectSelectors = [
        '[role="heading"]',
        'span[title][class*="subject"]',
        'h1',
        '[data-testid="readingpane-subject"]',
        '[class*="Subject"]'
      ];

      let subjectEl = null;
      if (readingPane) {
        for (const sel of subjectSelectors) {
          subjectEl = readingPane.querySelector(sel);
          if (subjectEl) break;
        }
      }
      if (!subjectEl) {
        for (const sel of subjectSelectors) {
          subjectEl = document.querySelector(sel);
          if (subjectEl) break;
        }
      }

      if (subjectEl) {
        subject = (subjectEl.innerText || subjectEl.title || '').trim();
      }

      // Fallback subject from Document Title
      if (!subject && document.title) {
        subject = document.title.replace(/ - Outlook$/i, '')
                                .replace(/ - Correo - .*$/i, '')
                                .trim();
      }

      // 3. Sender Extraction (From)
      let from = '';
      let fromName = '';

      if (readingPane) {
        const fromEl = readingPane.querySelector('[class*="fromAddress"]') ||
                       readingPane.querySelector('[class*="From"]') ||
                       readingPane.querySelector('button[title*="@"]') ||
                       readingPane.querySelector('[data-testid="PersonaControl"]') ||
                       readingPane.querySelector('[aria-label*="De:"]') ||
                       readingPane.querySelector('[aria-label*="From:"]');

        if (fromEl) {
          const text = fromEl.innerText || '';
          const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
          if (emailMatch) {
            from = emailMatch[0];
            fromName = text.replace(from, '').replace(/[<>:;]/g, '').trim();
          } else {
            // Check if title or aria-label contains the email
            const title = fromEl.getAttribute('title') || fromEl.getAttribute('aria-label') || '';
            const emailMatch2 = title.match(/[\w.-]+@[\w.-]+\.\w+/);
            if (emailMatch2) {
              from = emailMatch2[0];
              fromName = title.replace(from, '').replace(/[<>:;()]/g, '').replace('De:', '').trim();
            }
          }
        }

        // If not found, scan any text inside the reading pane for an email address
        if (!from) {
          const allText = readingPane.innerText || '';
          const emailMatches = allText.match(/[\w.-]+@[\w.-]+\.\w+/g);
          if (emailMatches && emailMatches.length > 0) {
            from = emailMatches[0];
            fromName = 'Remitente';
          }
        }
      }

      // 4. Body Extraction
      let body = '';

      if (selectedText) {
        console.log('AutoPrácticas: Usando texto seleccionado por el usuario.');
        body = selectedText;
      } else if (readingPane) {
        const bodySelectors = [
          '[role="document"]',
          '.ReadingPaneContents',
          '[class*="body"]',
          '[aria-label="Cuerpo del mensaje"]',
          '[aria-label="Message body"]',
          '[class*="messageBody"]',
          '[class*="MessageBody"]'
        ];

        let bodyEl = null;
        for (const sel of bodySelectors) {
          const elements = Array.from(readingPane.querySelectorAll(sel)).filter(el => el.offsetWidth > 0 || el.offsetHeight > 0);
          if (elements.length > 0) {
            bodyEl = elements[elements.length - 1]; // Get last visible one
            break;
          }
        }

        if (bodyEl) {
          body = bodyEl.innerText || '';
        }
      }

      // Ultimate body fallback: scan paragraphs
      if (!body && readingPane) {
        body = readingPane.innerText || '';
      }

      // 5. Date Extraction
      let date = new Date().toISOString();
      if (readingPane) {
        const dateEl = readingPane.querySelector('time') ||
                       readingPane.querySelector('[class*="date"]') ||
                       readingPane.querySelector('[class*="timestamp"]') ||
                       readingPane.querySelector('[id*="Date"]') ||
                       readingPane.querySelector('[class*="SentDate"]');
        if (dateEl) {
          const dateAttr = dateEl.getAttribute('datetime') || dateEl.getAttribute('title') || dateEl.innerText;
          if (dateAttr) {
            const parsed = new Date(dateAttr);
            if (!isNaN(parsed.getTime())) date = parsed.toISOString();
          }
        }
      }

      if (!subject && !body) {
        console.error('AutoPrácticas: No se pudo extraer ni el asunto ni el cuerpo del correo.');
        return null;
      }

      console.log('AutoPrácticas: Extracción de Outlook exitosa:', { subject, from });

      return {
        from: from || 'desconocido@correo.com',
        fromName: fromName || 'Remitente',
        subject: subject || 'Sin asunto',
        body: body.substring(0, 15000),
        date: date,
        source: 'outlook',
        capturedAt: new Date().toISOString()
      };
    } catch (e) {
      console.error('AutoPrácticas: Error al extraer correo de Outlook:', e);
      return null;
    }
  }

  // Extract from Gmail
  function extractGmailEmail() {
    try {
      console.log('AutoPrácticas: Iniciando extracción de Gmail...');

      const emailContainer = document.querySelector('[role="main"]');
      if (!emailContainer) {
        console.warn('AutoPrácticas: No se encontró el contenedor principal de Gmail.');
      }

      // 1. Text Selection Fallback
      const selectedText = window.getSelection().toString().trim();

      // 2. Subject Extraction
      let subject = '';
      const subjectSelectors = [
        'h2[data-thread-perm-id]',
        '.ha h2',
        '.hP',
        'h2.hP',
        '[role="main"] h2'
      ];

      let subjectEl = null;
      for (const sel of subjectSelectors) {
        subjectEl = document.querySelector(sel);
        if (subjectEl) break;
      }

      if (subjectEl) {
        subject = (subjectEl.innerText || '').trim();
      }

      // Document Title Fallback
      if (!subject && document.title) {
        subject = document.title.replace(/ - [^-]+@gmail\.com.*$/i, '')
                                .replace(/ - Gmail$/i, '')
                                .trim();
      }

      // 3. From (sender) Extraction
      let from = '';
      let fromName = '';

      // Find expanded messages inside Gmail thread
      const expandedMessages = Array.from(document.querySelectorAll('[role="listitem"]')).filter(el => el.offsetWidth > 0 || el.offsetHeight > 0);
      let activeMessage = expandedMessages[expandedMessages.length - 1] || document;

      // Selectors for from
      const fromEl = activeMessage.querySelector('[email]') ||
                     activeMessage.querySelector('.gD') ||
                     activeMessage.querySelector('[data-hovercard-id*="@"]') ||
                     document.querySelector('[email]') ||
                     document.querySelector('.gD');

      if (fromEl) {
        from = fromEl.getAttribute('email') || fromEl.getAttribute('data-hovercard-id') || '';
        fromName = fromEl.getAttribute('name') || fromEl.innerText || '';

        if (from.includes('p:')) {
          from = from.replace('p:', '');
        }

        if (!from) {
          const emailMatch = fromEl.innerText.match(/[\w.-]+@[\w.-]+\.\w+/);
          if (emailMatch) from = emailMatch[0];
        }
      }

      if (!from && activeMessage !== document) {
        // Search text inside active message headers
        const headerText = activeMessage.innerText || '';
        const emailMatch = headerText.match(/[\w.-]+@[\w.-]+\.\w+/);
        if (emailMatch) {
          from = emailMatch[0];
        }
      }

      // 4. Body Extraction
      let body = '';

      if (selectedText) {
        console.log('AutoPrácticas: Usando texto seleccionado por el usuario.');
        body = selectedText;
      } else {
        // Select the last visible message body (the active one)
        const visibleBodies = Array.from(document.querySelectorAll('.a3s')).filter(el => el.offsetWidth > 0 || el.offsetHeight > 0);

        let bodyEl = null;
        if (visibleBodies.length > 0) {
          bodyEl = visibleBodies[visibleBodies.length - 1];
        } else {
          bodyEl = document.querySelector('.a3s.aiL') ||
                   document.querySelector('[data-message-id] .ii.gt') ||
                   document.querySelector('.gs .ii');
        }

        if (bodyEl) {
          body = bodyEl.innerText || '';
        }
      }

      if (!body && emailContainer) {
        body = emailContainer.innerText || '';
      }

      // 5. Date Extraction
      let date = new Date().toISOString();
      const dateEl = activeMessage.querySelector('.g3') ||
                     activeMessage.querySelector('[alt="date"]') ||
                     document.querySelector('.g3');
      if (dateEl) {
        const dateStr = dateEl.getAttribute('title') || dateEl.innerText;
        if (dateStr) {
          const parsed = new Date(dateStr);
          if (!isNaN(parsed.getTime())) date = parsed.toISOString();
        }
      }

      if (!subject && !body) {
        console.error('AutoPrácticas: No se pudo extraer ni el asunto ni el cuerpo de Gmail.');
        return null;
      }

      console.log('AutoPrácticas: Extracción de Gmail exitosa:', { subject, from });

      return {
        from: from || 'desconocido@correo.com',
        fromName: fromName || 'Remitente',
        subject: subject || 'Sin asunto',
        body: body.substring(0, 15000),
        date: date,
        source: 'gmail',
        capturedAt: new Date().toISOString()
      };
    } catch (e) {
      console.error('AutoPrácticas: Error al extraer correo de Gmail:', e);
      return null;
    }
  }

  // Capture current email
  async function captureCurrentEmail() {
    const btn = document.getElementById('autopracticas-capture-btn');
    if (!btn) return;
    const btnInner = btn.querySelector('.ap-btn-inner');

    // Visual feedback
    btnInner.innerHTML = `
      <svg class="ap-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" stroke-dasharray="30 60"/>
      </svg>
      <span>Capturando...</span>
    `;
    btn.className = 'ap-loading';

    try {
      const emailData = extractEmailData();

      if (!emailData) {
        throw new Error('No se pudo extraer información de este correo. Intenta seleccionando texto.');
      }

      // Check if chrome.storage.local is available
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
        throw new Error('API de Chrome desactualizada. Por favor, recarga esta pestaña (F5).');
      }

      // Get existing captured emails
      const result = await chrome.storage.local.get(['capturedEmails']);
      const emails = result.capturedEmails || [];

      // Check for duplicates (same subject, sender email, and captured within last 10 minutes)
      const isDuplicate = emails.some(e =>
        e.subject === emailData.subject &&
        e.from === emailData.from &&
        (new Date() - new Date(e.capturedAt)) < 600000
      );

      if (!isDuplicate) {
        const newEmail = {
          id: Date.now().toString(),
          ...emailData
        };
        emails.unshift(newEmail);

        // Keep only last 100 emails
        const trimmed = emails.slice(0, 100);
        await chrome.storage.local.set({ capturedEmails: trimmed });

        // Copy to clipboard automatically on capture!
        // This is a powerful backup: the captured email is immediately copied to clipboard in JSON format
        try {
          const singleExport = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            source: 'autopracticas-extension-quick',
            emails: [{
              from: emailData.from,
              fromName: emailData.fromName,
              subject: emailData.subject,
              body: emailData.body,
              date: emailData.date
            }]
          };
          await navigator.clipboard.writeText(JSON.stringify(singleExport, null, 2));
          console.log('AutoPrácticas: Correo copiado automáticamente al portapapeles.');
        } catch (clipErr) {
          console.warn('AutoPrácticas: No se pudo auto-copiar al portapapeles:', clipErr);
        }

        // Success feedback
        btnInner.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>¡Copiado!</span>
        `;
        btn.className = 'ap-success';

        // Update badge
        try {
          if (chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ action: 'updateBadge', count: trimmed.length });
          }
        } catch (badgeErr) {
          console.warn('AutoPrácticas: No se pudo actualizar el badge:', badgeErr);
        }
      } else {
        // Already captured recently
        btnInner.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>Ya copiado</span>
        `;
        btn.className = 'ap-warning';
      }
    } catch (err) {
      console.error('AutoPrácticas: Error al capturar correo:', err);

      // Error feedback
      btnInner.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <span>Recargar (F5)</span>
      `;
      btn.className = 'ap-error';

      // Let the user know they need to refresh
      if (err.message && err.message.includes('Extension context invalidated')) {
        alert('Extensión actualizada. Por favor, recarga esta pestaña de correo (presiona F5 o refresca el navegador) para que los cambios tengan efecto.');
      } else {
        alert('Error al capturar: ' + err.message);
      }
    }

    // Reset button after delay
    setTimeout(() => {
      btn.className = '';
      btnInner.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span>Capturar</span>
      `;
    }, 3000);
  }

  // Initialize email capture client
  function initCaptureMode() {
    // Wait a bit for the page to fully load
    setTimeout(createCaptureButton, 1500);

    // Re-create button when navigating (Gmail & Outlook are SPAs)
    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(createCaptureButton, 1000);
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  // ==========================================
  // 3. MODO INTEGRACIÓN (LOCAL COMPANION)
  // ==========================================
  function initAppIntegration() {
    console.log("AutoPrácticas: Modo integración con aplicación web iniciado.");

    // Helper to fetch and dispatch emails to React
    async function syncEmailsToApp() {
      try {
        const result = await chrome.storage.local.get(['capturedEmails']);
        const emails = result.capturedEmails || [];
        console.log(`AutoPrácticas: Sincronizando ${emails.length} correos hacia la aplicación.`);
        window.dispatchEvent(new CustomEvent('AutoPracticasSendEmails', { detail: emails }));
      } catch (err) {
        console.error("AutoPrácticas: Error al obtener correos para sincronizar:", err);
      }
    }

    // Listen for manual requests from React
    window.addEventListener('AutoPracticasFetchEmails', () => {
      console.log("AutoPrácticas: Aplicación solicitó refresco de datos.");
      syncEmailsToApp();
    });

    // Listen for single email deletions from React
    window.addEventListener('AutoPracticasDeleteEmail', async (e) => {
      const emailId = e.detail;
      console.log(`AutoPrácticas: Petición de borrado para correo ${emailId}`);
      try {
        const result = await chrome.storage.local.get(['capturedEmails']);
        let emails = result.capturedEmails || [];
        emails = emails.filter(em => em.id !== emailId);
        await chrome.storage.local.set({ capturedEmails: emails });
        syncEmailsToApp();
      } catch (err) {
        console.error("AutoPrácticas: Error al eliminar correo desde la app:", err);
      }
    });

    // Listen for clear requests from React
    window.addEventListener('AutoPracticasClearEmails', async () => {
      console.log("AutoPrácticas: Petición de limpieza total.");
      try {
        await chrome.storage.local.set({ capturedEmails: [] });
        syncEmailsToApp();
      } catch (err) {
        console.error("AutoPrácticas: Error al limpiar correos desde la app:", err);
      }
    });

    // Watch for extension storage modifications (e.g. captured in another tab) and sync
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local' && changes.capturedEmails) {
        console.log("AutoPrácticas: Detección de cambio en almacenamiento local. Sincronizando...");
        const newEmails = changes.capturedEmails.newValue || [];
        window.dispatchEvent(new CustomEvent('AutoPracticasSendEmails', { detail: newEmails }));
      }
    });

    // Let the React app know the extension bridge is active
    let tries = 0;
    function notifyAppReady() {
      window.dispatchEvent(new CustomEvent('AutoPracticasExtensionReady', { detail: true }));
      syncEmailsToApp();

      // Retry a few times in case the React page is still loading its state handlers
      if (tries < 3) {
        tries++;
        setTimeout(notifyAppReady, 600 + (tries * 400));
      }
    }

    setTimeout(notifyAppReady, 500);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (isApp) initAppIntegration();
      else initCaptureMode();
    });
  } else {
    if (isApp) initAppIntegration();
    else initCaptureMode();
  }
})();
