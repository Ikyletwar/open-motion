
(()=>{
  function getAppModel() {
    return window.model || (typeof model !== 'undefined' ? model : null);
  }
  function getAppUi() {
    return window.ui || (typeof ui !== 'undefined' ? ui : null);
  }

  function initTitleRename() {
    const titleEl = document.getElementById('editorTitle');
    if (!titleEl || titleEl.dataset.renameBound) return;
    titleEl.dataset.renameBound = 'true';
    titleEl.title = 'Ketuk untuk mengubah nama proyek';
    titleEl.setAttribute('role', 'button');
    titleEl.setAttribute('tabindex', '0');
    titleEl.setAttribute('aria-label', 'Ubah nama proyek');

    function startEdit(e) {
      if (e) e.stopPropagation();
      if (titleEl.querySelector('input')) return;

      const m = getAppModel();
      const smallEl = titleEl.querySelector('small');
      const smallText = smallEl ? smallEl.outerHTML : '<small>1080 × 1920 • 30 fps</small>';
      
      let currentTitle = '';
      if (m?.project?.name) {
        currentTitle = m.project.name;
      } else {
        const clone = titleEl.cloneNode(true);
        const sm = clone.querySelector('small');
        if (sm) sm.remove();
        currentTitle = clone.textContent.trim() || 'Tanpa judul';
      }

      titleEl.innerHTML = `
        <div style="display:flex;align-items:center;gap:6px;width:100%;">
          <input type="text" id="editorTitleInlineInput" class="editorTitleInlineInput" value="${currentTitle.replace(/"/g, '&quot;')}" maxlength="60" spellcheck="false" autocomplete="off">
          ${smallText}
        </div>
      `;

      const input = document.getElementById('editorTitleInlineInput');
      if (!input) return;
      input.focus();
      input.select();

      let committed = false;
      function commit() {
        if (committed) return;
        committed = true;
        const newName = input.value.trim() || 'Tanpa judul';
        const modelRef = getAppModel();
        if (modelRef?.project) {
          modelRef.project.name = newName;
        }
        titleEl.innerHTML = `${newName} ${smallText}`;
        const uiRef = getAppUi();
        if (uiRef?.syncProject && modelRef?.project) {
          try { uiRef.syncProject(); } catch (e) {}
        }
        try {
          uiRef?.saveLocal?.(false);
        } catch (err) {}
        if (typeof toast === 'function') toast(`Nama proyek: ${newName}`);
      }

      function cancel() {
        if (committed) return;
        committed = true;
        titleEl.innerHTML = `${currentTitle} ${smallText}`;
      }

      input.addEventListener('keydown', (ke) => {
        ke.stopPropagation();
        if (ke.key === 'Enter') {
          ke.preventDefault();
          commit();
        } else if (ke.key === 'Escape') {
          ke.preventDefault();
          cancel();
        }
      });

      input.addEventListener('blur', () => {
        commit();
      });

      input.addEventListener('click', (ie) => ie.stopPropagation());
    }

    titleEl.addEventListener('click', startEdit);
    titleEl.addEventListener('keydown', (ke) => {
      if (ke.key === 'Enter' || ke.key === ' ') {
        ke.preventDefault();
        startEdit();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTitleRename);
  } else {
    initTitleRename();
  }
})();
