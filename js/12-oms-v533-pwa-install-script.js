
(() => {
  'use strict';
  const installBtn=document.getElementById('homeInstallBtn');
  const notifBanner=document.getElementById('mPwaInstallNotification');
  const notifInstallBtn=document.getElementById('mPwaNotifInstallBtn');
  const notifCloseBtn=document.getElementById('mPwaNotifCloseBtn');
  const notifTrigger=document.getElementById('mPwaNotifTrigger');

  let deferredInstallPrompt=null;
  const isStandalone=()=>window.matchMedia?.('(display-mode: standalone)').matches===true ||
    window.navigator.standalone===true;

  const updateNotifLang=()=>{
    const isId=(typeof homeLanguage!=='undefined'&&homeLanguage==='id')||(document.documentElement.lang==='id');
    const title=document.getElementById('mPwaNotifTitle');
    const desc=document.getElementById('mPwaNotifDesc');
    const btn=document.getElementById('mPwaNotifInstallBtn');
    if(title)title.textContent=isId?'Pasang Open Motion':'Install Open Motion';
    if(desc)desc.textContent=isId?'Aplikasi lebih cepat & layar penuh':'Faster access & fullscreen';
    if(btn)btn.textContent=isId?'Instal':'Install';
  };
  window.omsUpdatePwaNotifLang=updateNotifLang;

  const refreshState=()=>{
    const standalone=isStandalone();
    if(installBtn){
      installBtn.hidden=standalone;
      installBtn.classList.toggle('ready',!!deferredInstallPrompt&&!standalone);
      installBtn.title=deferredInstallPrompt?'Instal Open Motion':'Instal Open Motion';
    }
    const isDismissed=(sessionStorage.getItem('oms_pwa_notif_dismissed')==='1');
    if(notifBanner){
      if(standalone||isDismissed){
        notifBanner.classList.add('hidden');
      }else{
        notifBanner.classList.remove('hidden');
        updateNotifLang();
      }
    }
    const root=document.documentElement;
    root.classList.toggle('omsStandalone',standalone);
    const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1);
    if(standalone && isIOS){
      root.classList.add('omsIOSStandalone');
      if(window.screen && window.screen.height){
        const isLandscape=window.innerWidth > window.innerHeight;
        const screenH=isLandscape 
          ? Math.min(window.screen.width, window.screen.height) 
          : Math.max(window.screen.width, window.screen.height);
        root.style.setProperty('--oms-screen-height', screenH + 'px');
      }
    } else {
      root.classList.remove('omsIOSStandalone');
      root.style.removeProperty('--oms-screen-height');
    }
  };

  const triggerInstall=async(source='btn')=>{
    if(isStandalone()){refreshState();return}
    const isId=(typeof homeLanguage!=='undefined'&&homeLanguage==='id')||(document.documentElement.lang==='id');
    const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1);

    if(!deferredInstallPrompt){
      if(isIOS){
        window.toast?.(isId
          ? 'Di Safari: Ketuk tombol Bagikan ⎋ lalu pilih "Tambah ke Layar Utama"'
          : 'In Safari: Tap Share ⎋ then "Add to Home Screen"');
        return;
      }
      const isLanIp=/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(location.hostname);
      if(isLanIp || !window.isSecureContext){
        window.toast?.(isId
          ? 'Chrome memblokir PWA di HTTP IP lokal. Buka menu ⋮ Chrome → "Tambahkan ke Layar Utama", atau buka versi HTTPS di GitHub.'
          : 'Chrome blocks PWA install on HTTP LAN. Tap Chrome menu ⋮ → "Add to Home Screen", or open HTTPS on GitHub.');
        return;
      }
      const local=location.protocol==='file:'||location.protocol==='content:';
      window.toast?.(local
        ? (isId ? 'Instal PWA hanya tersedia dari situs HTTPS. Buka Open Motion melalui GitHub Pages.' : 'PWA install requires HTTPS.')
        : (isId ? 'Ketuk menu browser ⋮ lalu pilih "Instal aplikasi" / "Tambahkan ke layar utama".' : 'Tap browser menu ⋮ then select "Install app".'));
      return;
    }

    if(installBtn)installBtn.setAttribute('aria-busy','true');
    try{
      const promptEvent=deferredInstallPrompt;
      const result=await promptEvent.prompt();
      deferredInstallPrompt=null;
      refreshState();
      if(result?.outcome==='accepted'){
        if(notifBanner)notifBanner.classList.add('hidden');
        try{sessionStorage.setItem('oms_pwa_notif_dismissed','1')}catch(_){}
        window.toast?.(isId?'Memasang Open Motion…':'Installing Open Motion…');
      }else if(result?.outcome==='dismissed'){
        try{window.toast?.(isId?'Instalasi dibatalkan.':'Installation dismissed.')}catch(_){}
      }
    }catch(error){
      console.warn('[Open Motion PWA] install prompt gagal:',error);
      deferredInstallPrompt=null;
      refreshState();
      try{window.toast?.(isId?'Prompt instal belum tersedia. Coba menu ⋮ browser.':'Install prompt unavailable. Try browser menu ⋮.')}catch(_){}
    }finally{
      if(installBtn)installBtn.removeAttribute('aria-busy');
    }
  };

  window.addEventListener('beforeinstallprompt',event=>{
    // Keep Chrome's install event so both the notification and home button can invoke it.
    event.preventDefault();
    deferredInstallPrompt=event;
    refreshState();
  });

  if(installBtn){
    installBtn.addEventListener('click',()=>triggerInstall('header'));
  }

  if(notifInstallBtn){
    notifInstallBtn.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      triggerInstall('notif-btn');
    });
  }

  if(notifTrigger){
    notifTrigger.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      triggerInstall('notif-card');
    });
  }

  if(notifCloseBtn){
    notifCloseBtn.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      if(notifBanner)notifBanner.classList.add('hidden');
      try{sessionStorage.setItem('oms_pwa_notif_dismissed','1')}catch(_){}
    });
  }

  window.addEventListener('appinstalled',()=>{
    deferredInstallPrompt=null;
    if(notifBanner)notifBanner.classList.add('hidden');
    try{sessionStorage.setItem('oms_pwa_notif_dismissed','1')}catch(_){}
    refreshState();
    try{window.toast?.('Open Motion berhasil diinstal.')}catch(_){}
  });

  window.matchMedia?.('(display-mode: standalone)').addEventListener?.('change',refreshState);
  refreshState();
  setTimeout(refreshState, 150);
  setTimeout(refreshState, 600);

  if('serviceWorker' in navigator && (location.protocol==='https:' ||
      location.hostname==='localhost' || location.hostname==='127.0.0.1')){
    window.addEventListener('load',()=>{
      navigator.serviceWorker.register('./sw.js',{scope:'./'})
        .catch(error=>console.warn('[Open Motion PWA] service worker gagal:',error));
    },{once:true});
  }
})();
