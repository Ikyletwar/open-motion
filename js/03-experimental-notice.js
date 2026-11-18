
(() => {
  const notice = document.getElementById('experimentalNotice');
  const accept = document.getElementById('experimentalNoticeAccept');
  const dontShow = document.getElementById('experimentalNoticeDontShow');
  if (!notice) return;

  const STORAGE_KEY = 'oms_hide_experimental_notice';
  const shouldHide = () => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch(e) {
      return false;
    }
  };

  const closeNotice = (persist = false) => {
    notice.setAttribute('aria-hidden', 'true');
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, '1');
      } catch(e) {}
    }
    // V5.32 — PWA promotion is allowed only after the user explicitly accepts
    // the experimental notice. This prevents the install card from competing
    // with the first-run notice or covering the Home UI during startup.
    window.__omsExperimentalNoticeAccepted = true;
    window.dispatchEvent(new CustomEvent('oms:experimental-notice-accepted'));
  };

  if (shouldHide()) {
    notice.setAttribute('aria-hidden', 'true');
    window.__omsExperimentalNoticeAccepted = true;
  }

  accept?.addEventListener('click', () => {
    closeNotice(false);
  });
  dontShow?.addEventListener('click', () => {
    closeNotice(true);
  });
  notice.addEventListener('click', (event) => {
    if (event.target === notice) closeNotice(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && notice.getAttribute('aria-hidden') !== 'true') closeNotice(false);
  });
  if (!shouldHide() && accept) {
    requestAnimationFrame(() => accept.focus({ preventScroll: true }));
  }
})();
