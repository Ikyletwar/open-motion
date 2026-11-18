
  (()=>{
    const splash=document.getElementById('appSplashScreen');
    if(!splash)return;
    const fill=document.getElementById('omsSplashFill'),percent=document.getElementById('omsSplashPercent'),status=document.getElementById('omsSplashStatus'),error=document.getElementById('omsSplashError');
    let value=0,failed=false,done=false;
    const set=(v,msg)=>{value=Math.max(value,Math.min(100,v));fill.style.width=value+'%';percent.textContent=Math.floor(value)+'%';if(msg)status.textContent=msg;};
    const fail=(msg)=>{if(done)return;failed=true;status.textContent='Open Motion gagal dimuat';error.hidden=false;error.textContent=msg||'Terjadi kesalahan saat memulai aplikasi. Coba perbarui Chrome / Android System WebView.';};
    window.__omsStartup={progress:set,fail,ready:()=>{if(failed||done)return;done=true;set(100,'Open Motion siap');setTimeout(()=>{splash.classList.add('splashFadeOut');setTimeout(()=>splash.remove(),470);},280);}};
    set(5,'Menyiapkan antarmuka...');
    window.addEventListener('error',e=>{if(!done)fail('JavaScript: '+(e.message||'kesalahan tidak diketahui'));});
    window.addEventListener('unhandledrejection',e=>{if(!done)fail('Inisialisasi: '+String(e.reason?.message||e.reason||'Promise rejected'));});
    document.addEventListener('DOMContentLoaded',()=>{if(!failed)set(20,'Memuat komponen aplikasi...');},{once:true});
    window.addEventListener('load',()=>{if(!failed)set(35,'Memeriksa kesiapan engine...');},{once:true});
    setTimeout(()=>{if(!done&&!failed)fail('Waktu inisialisasi melebihi 30 detik. Periksa kompatibilitas browser dan koneksi.');},30000);
  })();
  
