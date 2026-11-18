
(()=>{
  function initAmViewmodeMenu(){
    const btn = document.getElementById('viewmodeBtn');
    const menu = document.getElementById('viewmodeMenu');
    const backdrop = document.getElementById('viewmodeMenuBackdrop');
    const closeBtn = document.getElementById('viewmodeMenuClose');
    if (!btn || !menu) return;

    function syncMenuStates(){
      const rec = document.getElementById('preRenderRecordBtn');
      if (rec && window.timelinePreRender) {
        const active = !!timelinePreRender.recordModeActive;
        rec.classList.toggle('active', active);
        rec.setAttribute('aria-pressed', active ? 'true' : 'false');
      }
      const cam = document.getElementById('cameraView');
      if (cam && window.model) {
        const active = !!model.cameraView;
        cam.classList.toggle('active', active);
      }
      const t3d = document.getElementById('toggle3d');
      if (t3d && window.model) {
        const active = !!model.scene3DActive?.();
        t3d.classList.toggle('active', active);
      }
    }

    function openMenu(){
      syncMenuStates();
      menu.classList.remove('hidden');
      backdrop?.classList.remove('hidden');
      btn.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');

      // Smart positioning: calculate whether to open downward or upward
      const br = btn.getBoundingClientRect();
      const menuH = menu.offsetHeight || 260;
      const spaceBelow = window.innerHeight - br.bottom;

      menu.style.position = 'fixed';
      // Align right edge near button
      const rightPos = Math.max(10, Math.min(window.innerWidth - 60, window.innerWidth - br.right));
      menu.style.right = `${rightPos}px`;
      menu.style.left = 'auto';

      if (spaceBelow >= menuH + 16 || spaceBelow > br.top) {
        // Open downwards (desktop mode / top toolbar)
        menu.style.top = `${Math.min(window.innerHeight - menuH - 12, br.bottom + 8)}px`;
        menu.style.bottom = 'auto';
      } else {
        // Open upwards (mobile bottom transport)
        menu.style.bottom = `${Math.max(10, window.innerHeight - br.top + 8)}px`;
        menu.style.top = 'auto';
      }
    }

    function closeMenu(){
      menu.classList.add('hidden');
      backdrop?.classList.add('hidden');
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
    }

    function toggleMenu(e){
      e?.stopPropagation?.();
      if (menu.classList.contains('hidden')) {
        openMenu();
      } else {
        closeMenu();
      }
    }

    btn.onclick = toggleMenu;
    closeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenu();
    });
    backdrop?.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      closeMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.classList.contains('hidden')) {
        closeMenu();
      }
    });

    // Close menu when clicking outside
    document.addEventListener('pointerdown', (e) => {
      if (!menu.classList.contains('hidden') && !menu.contains(e.target) && !btn.contains(e.target) && !backdrop?.contains(e.target)) {
        closeMenu();
      }
    });
  }

  // Desktop Sideways Splitter Logic
  function initDesktopHorizontalSplitter(){
    const splitter = document.getElementById('desktopHorizontalSplitter');
    const main = document.querySelector('.editorMain');
    if (!splitter || !main || splitter.dataset.bound) return;
    splitter.dataset.bound = 'true';

    // Remove any legacy 3-line split button if present
    document.getElementById('desktopCanvasSplitToolbarBtn')?.remove();

    function applyGridWidth(widthNum, { markManual = false } = {}){
      const mainRect = main.getBoundingClientRect();
      const totalW = mainRect.width || window.innerWidth;
      const minP = 300;
      const maxP = Math.max(minP, totalW - 328);
      const widthPx = Math.max(minP, Math.min(maxP, Math.round(widthNum)));
      main.style.setProperty('grid-template-columns', `${widthPx}px 8px minmax(320px, 1fr)`, 'important');
      main.style.setProperty('grid-template-rows', '1fr', 'important');
      try {
        const available = Math.max(1, totalW - 8);
        const ratio = Math.max(0.15, Math.min(0.85, widthPx / available));
        sessionStorage.setItem('omsDesktopCanvasSplitRatioV441A', String(ratio));
        if (markManual) {
          localStorage.setItem('oms-desktop-manual-ratio', String(ratio));
          localStorage.setItem('oms-desktop-preview-width', String(widthPx));
        }
        document.documentElement.style.setProperty('--oms-desktop-preview-width', `${widthPx}px`);
        if (window.DesktopCanvasSplitController?.recordManualRatio) {
          window.DesktopCanvasSplitController.recordManualRatio(ratio);
        }
      } catch(e){}
      try {
        if (window.ui?.fit) ui.fit();
      } catch(e){}
    }

    // Restore saved manual ratio if available, otherwise default to 50:50
    try {
      if (window.innerWidth >= 900) {
        const manualRatio = parseFloat(localStorage.getItem('oms-desktop-manual-ratio'));
        const mainRect = main.getBoundingClientRect();
        const totalW = mainRect.width || window.innerWidth;
        const available = Math.max(1, totalW - 8);
        if (Number.isFinite(manualRatio) && manualRatio >= 0.15 && manualRatio <= 0.85) {
          applyGridWidth(Math.round(available * manualRatio), { markManual: true });
        } else {
          applyGridWidth(Math.round(available * 0.5), { markManual: false });
        }
      }
    } catch(e){}

    let isDragging = false;
    let startX = 0;
    let startWidth = 0;

    function onPointerMove(e){
      if (!isDragging) return;
      e.preventDefault();
      const mainRect = main.getBoundingClientRect();
      const deltaX = e.clientX - startX;
      const minP = 300;
      const maxP = Math.max(minP, mainRect.width - 328);
      const newWidth = Math.max(minP, Math.min(maxP, startWidth + deltaX));
      applyGridWidth(newWidth, { markManual: true });
    }

    function onPointerUp(e){
      if (!isDragging) return;
      isDragging = false;
      splitter.classList.remove('dragging');
      try { splitter.releasePointerCapture(e.pointerId); } catch(e){}
      window.removeEventListener('pointermove', onPointerMove, true);
      window.removeEventListener('pointerup', onPointerUp, true);
      window.removeEventListener('pointercancel', onPointerUp, true);

      try {
        window.DesktopCanvasSplitController?.endFit?.();
      } catch(e){}

      try {
        if (window.ui?.fit) ui.fit();
        if (window.timeline?.rebuild) timeline.rebuild();
        if (window.renderer) { renderer.resize?.(); renderer.render?.(); }
      } catch(e){}
    }

    splitter.addEventListener('pointerdown', (e) => {
      if (window.innerWidth < 900) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      isDragging = true;
      startX = e.clientX;
      const prevArea = main.querySelector('.previewArea');
      startWidth = prevArea ? prevArea.getBoundingClientRect().width : Math.round((main.getBoundingClientRect().width - 8) * 0.5);
      splitter.classList.add('dragging');
      try { splitter.setPointerCapture(e.pointerId); } catch(e){}
      try { window.DesktopCanvasSplitController?.beginFit?.(); } catch(e){}
      window.addEventListener('pointermove', onPointerMove, true);
      window.addEventListener('pointerup', onPointerUp, true);
      window.addEventListener('pointercancel', onPointerUp, true);
      e.preventDefault();
    });

    // Double-click to reset back to default 50:50
    splitter.addEventListener('dblclick', () => {
      if (window.innerWidth < 900) return;
      try {
        localStorage.removeItem('oms-desktop-manual-ratio');
        localStorage.removeItem('oms-desktop-preview-width');
        sessionStorage.removeItem('omsDesktopCanvasSplitRatioV441A');
      } catch(e){}
      const mainRect = main.getBoundingClientRect();
      const half = Math.round((mainRect.width - 8) * 0.5);
      applyGridWidth(half, { markManual: false });
      try {
        if (window.ui?.fit) ui.fit();
        if (window.timeline?.rebuild) timeline.rebuild();
      } catch(e){}
    });
  }

  function boot() {
    initAmViewmodeMenu();
    initDesktopHorizontalSplitter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
