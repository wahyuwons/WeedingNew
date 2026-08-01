(() => {
  'use strict';

  const CONFIG = Object.freeze({
    sourceCandidates: [
      './demo-heritage-series-aruna',
      './Index.html.txt'
    ],
    originalBaseUrl: 'https://attarivitation.com/demo-heritage-series-aruna/',
    removeThirdPartyTracking: true,
    preserveQueryString: true
  });

  const loader = document.getElementById('arunaLoader');
  const errorNode = document.getElementById('arunaLoaderError');

  function showError(message) {
    if (loader) loader.classList.add('is-error');
    if (errorNode) errorNode.textContent = message;
    console.error('[Aruna loader]', message);
  }

  async function fetchFirstAvailable(paths) {
    let lastError = null;

    for (const path of paths) {
      try {
        const response = await fetch(path, {
          cache: 'no-store',
          credentials: 'same-origin'
        });

        if (!response.ok) {
          throw new Error(`${path} returned HTTP ${response.status}`);
        }

        const html = await response.text();
        if (!html.trim().toLowerCase().includes('<html')) {
          throw new Error(`${path} does not contain a complete HTML document`);
        }

        return html;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('No source file could be loaded.');
  }

  function removeTracking(doc) {
    if (!CONFIG.removeThirdPartyTracking) return;

    const blockedHosts = [
      'connect.facebook.net',
      'www.facebook.com/tr',
      'googletagmanager.com',
      'google-analytics.com'
    ];

    doc.querySelectorAll('script[src], img[src], iframe[src]').forEach((node) => {
      const src = node.getAttribute('src') || '';
      if (blockedHosts.some((host) => src.includes(host))) {
        node.remove();
      }
    });

    doc.querySelectorAll('script:not([src])').forEach((script) => {
      const code = script.textContent || '';
      if (/\bfbq\s*\(|facebook-domain-verification|gtag\s*\(|GoogleAnalyticsObject/i.test(code)) {
        script.remove();
      }
    });

    doc.querySelectorAll('meta[name="facebook-domain-verification"]').forEach((node) => node.remove());
  }

  function makeLocalUrl(relativePath) {
    return new URL(relativePath, window.location.href).href;
  }

  function injectRuntimeSafety(doc) {
    const base = doc.createElement('base');
    base.href = CONFIG.originalBaseUrl;
    doc.head.prepend(base);

    const canonical = doc.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = window.location.href;

    const ogUrl = doc.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.content = window.location.href;

    const fallbackStyle = doc.createElement('style');
    fallbackStyle.id = 'aruna-static-runtime-fixes';
    fallbackStyle.textContent = `
      html, body { min-height: 100%; margin: 0; }
      img { max-width: 100%; }
      .namatamu { overflow-wrap: anywhere; }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          scroll-behavior: auto !important;
        }
      }
    `;
    doc.head.appendChild(fallbackStyle);

    const fallbackScript = doc.createElement('script');
    fallbackScript.id = 'aruna-static-runtime-script';
    fallbackScript.src = makeLocalUrl('./aruna-runtime.js');
    fallbackScript.defer = true;
    doc.body.appendChild(fallbackScript);
  }

  function prepareDocument(sourceHtml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(sourceHtml, 'text/html');

    removeTracking(doc);
    injectRuntimeSafety(doc);

    return '<!doctype html>\n' + doc.documentElement.outerHTML;
  }

  async function boot() {
    try {
      const sourceHtml = await fetchFirstAvailable(CONFIG.sourceCandidates);
      const preparedHtml = prepareDocument(sourceHtml);

      document.open();
      document.write(preparedHtml);
      document.close();
    } catch (error) {
      showError(
        'Source undangan tidak dapat dimuat. Pastikan file “demo-heritage-series-aruna” atau “Index.html.txt” berada di root repository. Detail: ' +
        (error && error.message ? error.message : String(error))
      );
    }
  }

  boot();
})();
