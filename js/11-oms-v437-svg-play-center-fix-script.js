
(()=>{
  // Original Alight Motion Play & Pause vectors (from APK resources)
  const AM_PLAY='<svg class="transportPlaySvg play" viewBox="0 0 96 96" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M80 46.18L21.5 12.41C19.5 11.25 17 12.7 17 15L17 82.55C17 84.86 19.5 86.31 21.5 85.15L80 51.38C82 50.22 82 47.34 80 46.18Z"/></svg>';
  const AM_PAUSE='<svg class="transportPlaySvg pause" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
  const AM_PLAY_LOOP='<svg class="transportPlaySvg play loop" viewBox="0 0 96 96" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M60.27 47.06L42.26 36.46C41.07 35.76 39.57 36.61 39.57 38L39.57 59.2C39.57 60.58 41.07 61.44 42.26 60.74L60.27 50.14C61.44 49.45 61.44 47.75 60.27 47.06Z"/><path fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" d="M60.07 12.5L69.78 22.21"/><path fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" d="M37.43 84.42L27.72 74.71"/><path fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" d="M12.5 69.48V27.43C12.5 24.55 14.84 22.21 17.72 22.21H69.78"/><path fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" d="M85 27.43V69.48C85 72.37 82.66 74.71 79.78 74.71H27.72"/></svg>';
  const AM_PAUSE_LOOP='<svg class="transportPlaySvg pause loop" viewBox="0 0 19 19" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M12 1L15 4"/><path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M7 18L4 15"/><path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" d="M1 15V5.215C1 4.544 1.572 4 2.277 4H15"/><path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" d="M18 4V13.785C18 14.456 17.428 15 16.723 15H4"/><path fill="currentColor" d="M11.42 6.5H12.08C12.31 6.5 12.5 6.69 12.5 6.92V12.08C12.5 12.31 12.31 12.5 12.08 12.5H11.42C11.19 12.5 11 12.31 11 12.08V6.92C11 6.69 11.19 6.5 11.42 6.5Z"/><path fill="currentColor" d="M7.42 6.5H8.08C8.31 6.5 8.5 6.69 8.5 6.92V12.08C8.5 12.31 8.31 12.5 8.08 12.5H7.42C7.19 12.5 7 12.31 7 12.08V6.92C7 6.69 7.19 6.5 7.42 6.5Z"/></svg>';

  window.omsPlaybackLoop = window.omsPlaybackLoop || false;

  window.omsSetPlayButtonVisual=function omsSetPlayButtonVisual(playing){
    const btn=document.getElementById('playBtn');
    if(!btn)return;
    const isLoop=!!window.omsPlaybackLoop;
    if(isLoop){
      btn.innerHTML=playing?AM_PAUSE_LOOP:AM_PLAY_LOOP;
      btn.classList.add('loopActive');
    }else{
      btn.innerHTML=playing?AM_PAUSE:AM_PLAY;
      btn.classList.remove('loopActive');
    }
    btn.classList.toggle('playing',!!playing);
    btn.setAttribute('aria-label',playing?'Jeda':'Putar');
    btn.setAttribute('title',playing?(isLoop?'Jeda (Looping)':'Jeda'):(isLoop?'Putar (Looping)':'Putar'));
    btn.dataset.playVisual=playing?'pause':'play';
  };

  function initPlayButtonHold(){
    const btn=document.getElementById('playBtn');
    if(!btn||btn._omsHoldInit)return;
    btn._omsHoldInit=true;

    let pressTimer=null;
    let isLongPress=false;
    let lastLongPressTime=0;
    let startX=0,startY=0;

    function toggleLoopMode(){
      window.omsPlaybackLoop=!window.omsPlaybackLoop;
      const isLoop=window.omsPlaybackLoop;
      if(navigator.vibrate)try{navigator.vibrate(40)}catch(e){}
      window.omsSetPlayButtonVisual?.(!!(typeof model!=='undefined'&&model.playing));
      showLoopToast(isLoop?'Mode Putar Berulang: Aktif':'Mode Putar Sekali: Aktif');
    }

    function showLoopToast(text){
      let t=document.getElementById('oms-loop-toast');
      if(!t){
        t=document.createElement('div');
        t.id='oms-loop-toast';
        t.style.cssText='position:fixed;bottom:70px;left:50%;transform:translateX(-50%);background:rgba(20,25,35,0.92);color:#00ffa8;border:1px solid rgba(0,255,168,0.3);padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;z-index:9999;pointer-events:none;transition:opacity 0.2s ease;box-shadow:0 4px 12px rgba(0,0,0,0.5);';
        document.body.appendChild(t);
      }
      t.textContent=text;
      t.style.opacity='1';
      clearTimeout(t._timer);
      t._timer=setTimeout(()=>{t.style.opacity='0'},1600);
    }

    btn.oncontextmenu=(e)=>{
      e.preventDefault();
      // On Android mobile/PWA, holding finger triggers contextmenu ~500ms after pointerdown.
      // Ignore this contextmenu event if toggleLoopMode was already executed by the hold timer within 1200ms!
      if(Date.now()-lastLongPressTime<1200)return;
      toggleLoopMode();
    };

    btn.addEventListener('pointerdown',(e)=>{
      if(e.button!==undefined&&e.button!==0)return;
      isLongPress=false;
      startX=e.clientX;
      startY=e.clientY;
      clearTimeout(pressTimer);
      pressTimer=setTimeout(()=>{
        isLongPress=true;
        lastLongPressTime=Date.now();
        toggleLoopMode();
      },450);
    },{passive:true});

    btn.addEventListener('pointermove',(e)=>{
      if(!pressTimer)return;
      // Allow minor natural finger roll (up to 22px) without cancelling hold
      if(Math.hypot(e.clientX-startX,e.clientY-startY)>22){
        clearTimeout(pressTimer);
        pressTimer=null;
      }
    },{passive:true});

    const handlePointerEnd=()=>{
      clearTimeout(pressTimer);
      pressTimer=null;
      // In PWA on Android, synthetic 'click' might not be dispatched after long press hold.
      // Auto-clear isLongPress after 350ms so subsequent taps to play are never blocked!
      if(isLongPress){
        setTimeout(()=>{isLongPress=false;},350);
      }
    };
    btn.addEventListener('pointerup',handlePointerEnd,{passive:true});
    btn.addEventListener('pointercancel',handlePointerEnd,{passive:true});

    btn.addEventListener('click',(e)=>{
      if(isLongPress||(Date.now()-lastLongPressTime<400)){
        e.preventDefault();
        e.stopImmediatePropagation();
        isLongPress=false;
      }
    },true);
  }

  const sync=()=>{
    initPlayButtonHold();
    window.omsSetPlayButtonVisual?.(!!(typeof model!=='undefined'&&model.playing));
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});
  else sync();
  setTimeout(sync,0);
  setTimeout(sync,400);
})();
