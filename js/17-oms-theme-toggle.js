/* V1.0 — Dark mode toggle
   Persists the user's choice in localStorage and keeps every [data-theme-toggle]
   control in sync. Runs before first paint because it is the last parser-blocking
   script in the document. */

(function(){
  'use strict';

  var STORAGE_KEY = 'oms_theme';
  var root = document.documentElement;
  var media = null;
  var current = 'light';

  try{ media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null; }catch(e){ media = null; }

  function stored(){
    try{
      var value = localStorage.getItem(STORAGE_KEY);
      return value === 'dark' || value === 'light' ? value : null;
    }catch(e){
      return null;
    }
  }

  function preferred(){
    return media && media.matches ? 'dark' : 'light';
  }

  function resolve(){
    return stored() || preferred();
  }

  function syncButtons(){
    var dark = current === 'dark';
    var nodes = document.querySelectorAll('[data-theme-toggle]');
    for(var i = 0; i < nodes.length; i++){
      var btn = nodes[i];
      btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
      btn.setAttribute('aria-label', dark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap');
      btn.setAttribute('title', dark ? 'Mode terang' : 'Mode gelap');
      btn.classList.toggle('theme-dark', dark);
    }
  }

  function apply(theme, persist){
    current = theme === 'dark' ? 'dark' : 'light';
    root.setAttribute('data-theme', current);
    root.style.colorScheme = current;
    syncButtons();
    if(persist){
      try{ localStorage.setItem(STORAGE_KEY, current); }catch(e){}
    }
  }

  function toggle(){
    apply(current === 'dark' ? 'light' : 'dark', true);
  }

  apply(resolve(), false);

  function bind(){
    var nodes = document.querySelectorAll('[data-theme-toggle]');
    for(var i = 0; i < nodes.length; i++){
      var btn = nodes[i];
      if(btn.getAttribute('data-theme-bound') === '1') continue;
      btn.setAttribute('data-theme-bound', '1');
      btn.addEventListener('click', toggle);
    }
    syncButtons();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bind, { once:true });
  }else{
    bind();
  }

  if(media){
    var onChange = function(){
      if(!stored()) apply(preferred(), false);
    };
    if(media.addEventListener) media.addEventListener('change', onChange);
    else if(media.addListener) media.addListener(onChange);
  }

  window.OmsTheme = {
    get: function(){ return current; },
    set: function(theme){ apply(theme, true); },
    toggle: toggle
  };
})();
