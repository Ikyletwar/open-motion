
(() => {
  function initMobileDeviceOverhaul() {
    console.log('[OMS Mobile] Initializing mobile device layout & gestures...');

    // 1. Mobile Bottom Navigation Tab Switching
    const bottomNav = document.getElementById('mobileBottomNav');
    const tabs = bottomNav ? bottomNav.querySelectorAll('.mNavTab') : [];
    const views = {
      beranda: document.getElementById('omsTabBeranda'),
      tutorial: document.getElementById('omsTabTutorial'),
      proyek: document.getElementById('omsTabProyek'),
      template: document.getElementById('omsTabTemplate')
    };

    function switchMobileTab(targetTab) {
      if (!views[targetTab]) return;

      // Update tab buttons
      tabs.forEach(t => {
        t.classList.toggle('active', t.getAttribute('data-tab') === targetTab);
      });

      // Update views
      Object.keys(views).forEach(k => {
        if (views[k]) {
          views[k].classList.toggle('active', k === targetTab);
        }
      });

      // Special handling per tab
      if (targetTab === 'proyek') {
        if (typeof ui !== 'undefined' && ui.loadProjectList) {
          ui.loadProjectList();
        }
      } else if (targetTab === 'beranda') {
        refreshRecentProjects();
      }
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const t = tab.getAttribute('data-tab');
        if (t) switchMobileTab(t);
      });
    });

    // 2. Center FAB (+) Handler
    function triggerNewProject() {
      const desktopFab = document.getElementById('newProjectFab');
      const newModal = document.getElementById('newModal');
      if (desktopFab && typeof desktopFab.click === 'function') {
        desktopFab.click();
      } else if (newModal) {
        newModal.classList.remove('isClosing');
        newModal.classList.remove('hidden');
      }
    }

    const centerFab = document.getElementById('mNavCenterFab');
    if (centerFab) {
      centerFab.addEventListener('click', (e) => {
        e.preventDefault();
        triggerNewProject();
      });
    }

    // Quick action buttons in Beranda
    const heroNewBtn = document.getElementById('mHeroNewProjectBtn');
    if (heroNewBtn) heroNewBtn.addEventListener('click', triggerNewProject);

    const qNew = document.getElementById('mQuickNew');
    if (qNew) qNew.addEventListener('click', triggerNewProject);

    const qTut = document.getElementById('mQuickTut');
    if (qTut) qTut.addEventListener('click', () => switchMobileTab('tutorial'));

    const qTmpl = document.getElementById('mQuickTmpl');
    if (qTmpl) qTmpl.addEventListener('click', () => switchMobileTab('template'));

    const qImport = document.getElementById('mQuickImport');
    if (qImport) {
      qImport.addEventListener('click', () => {
        const imp = document.getElementById('projectInput');
        if (imp) imp.click();
      });
    }

    // Auto-deactivate portrait side controls if ever triggered
    try {
      if (typeof portraitSideControls !== 'undefined' && portraitSideControls?.active) {
        portraitSideControls.deactivate();
      }
    } catch (e) {}

    // Direct Alight Motion share link URL auto-importer
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const shareParam = urlParams.get('am') || urlParams.get('share') || urlParams.get('import') || urlParams.get('url');
      if (shareParam && /(alightcreative\.com|alight\.link)/i.test(shareParam)) {
        setTimeout(() => {
          if (typeof AMIndependentLinkUI !== 'undefined') {
            AMIndependentLinkUI.open();
            const input = document.querySelector('.amImportDialog [data-share]');
            if (input) input.value = shareParam;
          }
        }, 500);
      }
    } catch (e) {}

    const seeAllBtn = document.getElementById('mRecentSeeAll');
    if (seeAllBtn) {
      seeAllBtn.addEventListener('click', () => switchMobileTab('proyek'));
    }

    // 3. Mirror Recent Projects in Beranda shelf
    function refreshRecentProjects() {
      const sourceList = document.getElementById('projectList');
      const targetGrid = document.getElementById('mRecentProjectsGrid');
      if (!sourceList || !targetGrid) return;

      const cards = sourceList.querySelectorAll('.projectCard');
      if (!cards || cards.length === 0) {
        targetGrid.innerHTML = '<div class="mRecentEmptyHint">Belum ada proyek yang dibuat. Tekan <b>＋</b> untuk membuat proyek pertama!</div>';
        return;
      }

      targetGrid.innerHTML = '';
      const limit = Math.min(cards.length, 4);
      for (let i = 0; i < limit; i++) {
        const original = cards[i];
        const clone = original.cloneNode(true);

        const origThumb = original.querySelector('.projectThumb');
        const origImg = origThumb?.querySelector('.projectThumbImg');
        const cloneThumb = clone.querySelector('.projectThumb');
        let cloneImg = cloneThumb?.querySelector('.projectThumbImg');

        if (cloneThumb && (cloneImg || origImg)) {
          const src = cloneImg?.src || origImg?.src;
          if (src) {
            if (origThumb?.classList.contains('hasThumb') || (cloneImg && cloneImg.complete && cloneImg.naturalWidth > 0)) {
              cloneThumb.classList.add('hasThumb');
            } else {
              if (!cloneImg) {
                cloneImg = document.createElement('img');
                cloneImg.className = 'projectThumbImg';
                cloneImg.decoding = 'async';
                cloneImg.src = src;
                cloneThumb.appendChild(cloneImg);
              }
              const onDone = () => {
                if (cloneImg && cloneImg.naturalWidth > 0) cloneThumb.classList.add('hasThumb');
              };
              cloneImg.onload = onDone;
              cloneImg.onerror = () => { cloneThumb.classList.remove('hasThumb'); };
              if (cloneImg.complete && cloneImg.naturalWidth > 0) onDone();
            }
          }
        }

        // cloneNode does not copy listeners. Bind this card directly so the
        // actual pointer/keyboard event reaches the normal project opener.
        window.ui.bindProjectCardActivation(clone, original.dataset.projectId);
        targetGrid.appendChild(clone);
      }
    }
    window.omsRefreshRecentProjects = refreshRecentProjects;

    // Observe changes to projectList to automatically sync recent projects
    const pList = document.getElementById('projectList');
    if (pList && window.MutationObserver) {
      const observer = new MutationObserver(() => {
        refreshRecentProjects();
      });
      observer.observe(pList, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }

    // Initial recent projects refresh
    setTimeout(refreshRecentProjects, 100);
    setTimeout(refreshRecentProjects, 350);
    setTimeout(refreshRecentProjects, 800);

    // 4. One-tap Template Application
    document.querySelectorAll('[data-template-use]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tmplName = btn.getAttribute('data-template-use');
        if (!tmplName) return;

        if (typeof model !== 'undefined' && typeof ui !== 'undefined') {
          // If already in project, apply template directly
          if (model.project) {
            ui.authorizeEditorOpen?.();
            ui.showEditor();
            ui.applyTemplate(tmplName);
            if (typeof toast === 'function') toast('Templat berhasil diterapkan');
          } else {
            // Create a fresh project first
            try {
              model.createProject({
                name: 'Proyek ' + tmplName.toUpperCase(),
                width: 1080,
                height: 1920,
                fps: 30,
                background: '#000000'
              });
              ui.authorizeEditorOpen?.();
              ui.showEditor();
              setTimeout(() => {
                ui.applyTemplate(tmplName);
                if (typeof toast === 'function') toast('Templat berhasil diterapkan');
              }, 100);
            } catch (err) {
              console.warn('[OMS Mobile] Template create failed:', err);
              triggerNewProject();
            }
          }
        } else {
          triggerNewProject();
        }
      });
    });

    // 5. Interactive Tutorial Dialog
    const tutorialGuides = {
      keyframe: {
        title: 'Animasi Keyframe & Kurva Easing',
        body: '1. Pilih layer di timeline untuk membuka panel Inspector.\n2. Ketuk "Transform" lalu geser playhead ke detik awal.\n3. Tekan tombol "+" Keyframe untuk menandai posisi pertama.\n4. Geser playhead dan pindahkan objek.\n5. Buka tombol "Kurva Easing" untuk mengatur kelembutan gerak!'
      },
      '3d': {
        title: 'Ruang Komposisi 3D & Kamera',
        body: '1. Di timeline, pilih layer yang ingin dipindahkan ke ruang 3D.\n2. Buka Inspector dan aktifkan opsi "TRUE 3D".\n3. Gunakan sumbu Z untuk mengatur kedalaman layer.\n4. Tekan tombol Kamera di preview tools untuk melihat dari sudut pandang kamera!'
      },
      masking: {
        title: 'Masking Shape & Blending Mode',
        body: '1. Buat shape geometri (lingkaran, kotak, atau bintang).\n2. Letakkan shape di atas foto atau video Anda.\n3. Di Inspector, buka menu "Mask" dan pilih "Mask Shape".\n4. Gunakan "Blending & Opacity" untuk memadukan warna objek.'
      },
      effects: {
        title: 'Katalog Efek & Spectrum Audio',
        body: '1. Pilih layer lalu tekan tile "Efek" pada Inspector.\n2. Jelajahi ratusan efek: Chroma Key, Glow, Wave Warp, Spectrum Preset.\n3. Atur parameter efek secara langsung dengan preview real-time!'
      },
      export: {
        title: 'Ekspor Video Resolusi Penuh 60 FPS',
        body: '1. Tekan tombol Ekspor di pojok kanan atas editor.\n2. Pilih resolusi 720p, 1080p, atau 4K Ultra.\n3. Pilih framerate 30 atau 60 FPS.\n4. Gunakan WebCodecs GPU Fast untuk ekspor super cepat langsung di peramban.'
      }
    };

    document.querySelectorAll('[data-tut]').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const key = card.getAttribute('data-tut');
        const tut = tutorialGuides[key];
        if (tut) {
          alert('=== ' + tut.title + ' ===\n\n' + tut.body);
        }
      });
    });

    // 6. Mobile Bottom Sheet Swipe Down to Dismiss (#drawer)
    const drawer = document.getElementById('drawer');
    if (drawer) {
      let touchStartY = 0;
      let isDraggingDrawer = false;

      drawer.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1 && e.target.closest('.drawerHead, #drawer::before')) {
          touchStartY = e.touches[0].clientY;
          isDraggingDrawer = true;
        }
      }, { passive: true });

      drawer.addEventListener('touchmove', (e) => {
        if (!isDraggingDrawer) return;
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - touchStartY;
        if (deltaY > 0) {
          drawer.style.transform = `translateY(${deltaY}px)`;
        }
      }, { passive: true });

      drawer.addEventListener('touchend', (e) => {
        if (!isDraggingDrawer) return;
        isDraggingDrawer = false;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchEndY - touchStartY;
        drawer.style.transform = '';
        if (deltaY > 60) {
          if (typeof ui !== 'undefined' && ui.closeDrawer) {
            ui.closeDrawer();
          } else {
            drawer.classList.add('hidden');
          }
        }
      });
    }

    // 7. Pinch-to-zoom in Editor Viewport for Mobile Devices
    const viewport = document.getElementById('viewport');
    if (viewport && typeof model !== 'undefined') {
      let initialDist = 0;
      let initialZoom = 1;

      viewport.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
          initialDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          initialZoom = model.zoom || 1;
        }
      }, { passive: true });

      viewport.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && initialDist > 0) {
          const currentDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          const factor = currentDist / initialDist;
          const newZoom = Math.max(0.2, Math.min(4.0, initialZoom * factor));
          model.zoom = newZoom;
          if (typeof ui !== 'undefined' && ui.applyCompositionFitZoom) {
            const wrap = document.getElementById('canvasWrap');
            if (wrap) wrap.style.transform = `scale(${newZoom})`;
          }
        }
      }, { passive: true });

      viewport.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
          initialDist = 0;
        }
      });
    }

    console.log('[OMS Mobile] Mobile device overhaul loaded successfully.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileDeviceOverhaul);
  } else {
    initMobileDeviceOverhaul();
  }
})();
