
(()=>{
  // Mode drawer yang termasuk "panel layer". 'settings', 'multi', 'tool' (menu +), 'relink' sengaja tidak masuk.
  const LAYER_MODES=['root','move','color','blend','effects','effect-browser','mask','text','shape','three','hier','keys','group-settings','motion-track','motion-warp','camera-track'];
  const TRASH='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V4.5h6V7"/><path d="M6.5 7l1 13h9l1-13"/><path d="M10 11v6M14 11v6"/></svg>';
  let bar=null,input=null,queued=false;

  const layerById=id=>(window.model?.layers||[]).find(l=>l.id===id)||null;

  function ensureBar(){
    const top=document.querySelector('#editor .editorTop');
    if(!top)return null;
    if(bar&&bar.isConnected)return bar;
    bar=document.createElement('div');
    bar.className='omsLayerBar250';
    bar.innerHTML=
      '<button type="button" data-layer-bar-back aria-label="Keluar dari panel layer" title="Keluar">←</button>'+
      '<input type="text" class="omsLayerBarName" data-layer-bar-name maxlength="80" spellcheck="false" autocomplete="off" aria-label="Nama layer" title="Ketuk untuk mengganti nama layer">'+
      '<button type="button" class="omsLayerBarDelete" data-layer-bar-delete aria-label="Hapus layer" title="Hapus layer">'+TRASH+'</button>';
    top.append(bar);
    input=bar.querySelector('[data-layer-bar-name]');

    bar.querySelector('[data-layer-bar-back]').onclick=()=>window.ui?.closeDrawer?.();

    bar.querySelector('[data-layer-bar-delete]').onclick=()=>{
      const l=layerById(bar.dataset.layerId);
      if(!l)return;
      const name=l.name||'Layer';
      history.push();
      for(const cam of model.layers.filter(x=>x.type==='camera'&&x.orbitTargetId===l.id))ui.cameraOrbitDisable?.(cam);
      model.removeLayer(l.id);
      ui.closeDrawer();
      ui.rebuildAll();
      try{toast(`Layer "${name}" dihapus`)}catch(e){}
    };

    const commit=()=>{
      const l=layerById(bar.dataset.layerId);
      if(!l)return;
      const v=input.value.trim();
      if(!v){input.value=l.name||'';return}
      if(v===l.name)return;
      history.push();
      l.name=v;
      try{timeline.rebuild()}catch(e){}
      const pt=document.querySelector('#drawer .propTitle');
      const tn=pt&&[...pt.childNodes].find(n=>n.nodeType===3);
      if(tn)tn.nodeValue=v+' ';
      try{window.ui?.saveLocal?.(false)}catch(e){}
    };
    input.addEventListener('focus',()=>setTimeout(()=>{try{input.select()}catch(e){}},0));
    input.addEventListener('blur',commit);
    input.addEventListener('click',e=>e.stopPropagation());
    for(const ev of ['keydown','keyup','keypress'])input.addEventListener(ev,e=>e.stopPropagation());
    input.addEventListener('keydown',e=>{
      if(e.key==='Enter'){e.preventDefault();input.blur()}
      else if(e.key==='Escape'){e.preventDefault();const l=layerById(bar.dataset.layerId);input.value=l?.name||'';input.blur()}
    });
    return bar;
  }

  function activeLayer(){
    const ed=document.getElementById('editor'),d=document.getElementById('drawer');
    if(!ed||!d||!window.ui||!window.model)return null;
    if(ed.classList.contains('hidden')||ed.classList.contains('topBarCollapsed'))return null;
    if(d.classList.contains('hidden')||d.classList.contains('drawerClosing')||d.classList.contains('addDrawer')||d.classList.contains('multiSelectDrawer'))return null;
    if(ui.layerMultiSelectMode||!LAYER_MODES.includes(ui.drawerMode))return null;
    return model.selectedLayer?.()||null;
  }

  function sync(){
    queued=false;
    const ed=document.getElementById('editor');
    if(!ed)return;
    const l=activeLayer(),b=ensureBar();
    if(!b)return;
    if(!l){ed.classList.remove('omsLayerPanel250');return}
    b.dataset.layerId=l.id;
    const name=l.name||'Layer';
    if(document.activeElement!==input&&input.value!==name)input.value=name;
    ed.classList.add('omsLayerPanel250');
  }
  const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(sync)}};

  function init(){
    const d=document.getElementById('drawer');
    if(!d){return}
    new MutationObserver(schedule).observe(d,{attributes:true,attributeFilter:['class'],childList:true});
    const ed=document.getElementById('editor');
    if(ed)new MutationObserver(schedule).observe(ed,{attributes:true,attributeFilter:['class']});
    try{bus.on('model:changed',schedule)}catch(e){}
    schedule();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
