
(()=>{
  try {
    const sync = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
        (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1);
      const isStandalone = window.navigator.standalone === true || 
        window.matchMedia?.('(display-mode: standalone)').matches === true;
      const root = document.documentElement;

      if (isStandalone) {
        root.classList.add('omsStandalone');
        if (isIOS) {
          root.classList.add('omsIOSStandalone');
          if (window.screen && window.screen.height) {
            const isLandscape = window.innerWidth > window.innerHeight;
            const screenH = isLandscape 
              ? Math.min(window.screen.width, window.screen.height) 
              : Math.max(window.screen.width, window.screen.height);
            root.style.setProperty('--oms-screen-height', screenH + 'px');
          }
        } else {
          root.classList.remove('omsIOSStandalone');
          root.style.removeProperty('--oms-screen-height');
        }
      } else {
        root.classList.remove('omsStandalone');
        root.classList.remove('omsIOSStandalone');
        root.style.removeProperty('--oms-screen-height');
      }
    };
    sync();
    window.matchMedia?.('(display-mode: standalone)').addEventListener?.('change', sync);
    window.addEventListener('resize', sync);
    window.addEventListener('orientationchange', sync);
  } catch(e){}
})();
