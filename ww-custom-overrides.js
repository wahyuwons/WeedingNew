(function(){
  'use strict';

  const ASSETS = {
    couple: 'Assets/Utary-Bride-Groom-03.webp',
    landscape: 'Assets/Utary-Bride-Groom-03-e1763374114498.webp',
    frame: 'Assets/Aruna-Frame-Mempelai.webp',
    frameTop: 'Assets/Aruna-Frame-7-1.webp'
  };


  const LOCATION = {
    name: 'Graha Menur',
    address: 'Silakan buka Google Maps untuk petunjuk arah.',
    mapsUrl: 'https://share.google/2TSoRcSQcJFQ5wcij',
    embedUrl: 'https://www.google.com/maps?q=Graha%20Menur&output=embed'
  };

  const hideSelectors = [
    '[data-id="7abf14a"]',      // Dress code
    '[data-id="3302b707"]',    // Live streaming content
    '[data-id="13680383"]',    // Live video widget
    '[data-id="31983084"]',    // Join Live button
    '[data-id="42d4e705"]',    // YouTube block above RSVP & Wishes
    '[data-id="2dd6805"]',     // YouTube widget itself
    '#tombol-konfgift',          // Gift Registry button
    '[data-id="4d6228b3"]',    // E-amplop/Gift Registry switcher; details shown directly
    '[data-id="14b02dcb"]',    // Kirim Kado card
    '[data-id="5429278e"]',    // Konfirmasi Kirim Kado section
    '#form-konfgift'
  ];

  function hideRemovedSections(){
    hideSelectors.forEach(function(selector){
      document.querySelectorAll(selector).forEach(function(el){
        el.classList.add('ww-hidden');
        el.setAttribute('aria-hidden','true');
      });
    });
  }

  function replaceOldPhotos(){
    document.querySelectorAll('img').forEach(function(img){
      const sourceText = [
        img.getAttribute('src') || '',
        img.getAttribute('srcset') || '',
        img.currentSrc || ''
      ].join(' ');

      let replacement = '';
      if(sourceText.includes('Bagas-Naila-LIBLOP-PICTURE-2630245')){
        replacement = ASSETS.couple;
      }else if(sourceText.includes('Bagas-Naila-LIBLOP-PICTURE-2620927')){
        replacement = ASSETS.landscape;
      }

      if(replacement){
        img.setAttribute('src', replacement);
        img.removeAttribute('srcset');
        img.removeAttribute('sizes');
        img.removeAttribute('fetchpriority');
      }
    });

    // Covers CSS backgrounds, including the fixed desktop-left composition.
    document.querySelectorAll('body *').forEach(function(el){
      const inline = el.style && el.style.backgroundImage ? el.style.backgroundImage : '';
      let computed = '';
      try{ computed = getComputedStyle(el).backgroundImage || ''; }catch(e){}
      const bg = inline + ' ' + computed;

      if(bg.includes('Bagas-Naila-LIBLOP-PICTURE-2630245')){
        el.style.setProperty('background-image', 'url("' + ASSETS.couple + '")', 'important');
        el.style.setProperty('background-position', 'center center', 'important');
        el.style.setProperty('background-size', 'cover', 'important');
      }else if(bg.includes('Bagas-Naila-LIBLOP-PICTURE-2620927')){
        el.style.setProperty('background-image', 'url("' + ASSETS.landscape + '")', 'important');
        el.style.setProperty('background-position', 'center center', 'important');
        el.style.setProperty('background-size', 'cover', 'important');
      }
    });
  }

  function updateEAmplop(){
    const giftList = document.getElementById('gift-list');
    if(giftList){
      giftList.classList.add('ww-eamplop-visible');
      giftList.classList.remove('elementor-invisible');
    }

    const bca = document.querySelector('[data-id="2da07efd"]');
    if(bca && bca.dataset.wwGiftDone !== '1'){
      bca.dataset.wwGiftDone = '1';
      const content = bca.querySelector('.elementor-widget-text-editor .elementor-widget-container');
      if(content) content.innerHTML = '<p><strong>BCA</strong></p><p>0113422791</p><p>a.n. Wahyuwono</p>';
      const copy = bca.querySelector('.wdp-copy-btn');
      const hidden = bca.querySelector('.copy-content');
      if(copy) copy.setAttribute('data-clipboard-text','0113422791');
      if(hidden) hidden.textContent = '0113422791';
    }

    const mandiri = document.querySelector('[data-id="3a6dfdc1"]');
    if(mandiri && mandiri.dataset.wwGiftDone !== '1'){
      mandiri.dataset.wwGiftDone = '1';
      const content = mandiri.querySelector('.elementor-widget-text-editor .elementor-widget-container');
      if(content) content.innerHTML = '<p><strong>Bank Mandiri</strong></p><p>1450015775485</p><p>a.n. Jihan Selfie Ananda</p>';
      const copy = mandiri.querySelector('.wdp-copy-btn');
      const hidden = mandiri.querySelector('.copy-content');
      if(copy) copy.setAttribute('data-clipboard-text','1450015775485');
      if(hidden) hidden.textContent = '1450015775485';
    }
  }

  function simplifyFooter(){
    const footer = document.getElementById('watermark-brand');
    if(!footer || footer.dataset.wwDone === '1') return;
    footer.dataset.wwDone = '1';
    footer.classList.add('ww-simple-footer');
    footer.innerHTML = '<p class="ww-footer-love">Created with love by WW.</p>';
  }

  function loadImage(src){
    return new Promise(function(resolve,reject){
      const img = new Image();
      img.onload = function(){ resolve(img); };
      img.onerror = function(){ reject(new Error('Gambar tidak dapat dimuat: ' + src)); };
      img.src = src;
    });
  }

  function drawCover(ctx,img,width,height){
    const ratio = Math.max(width / img.naturalWidth, height / img.naturalHeight);
    const drawWidth = img.naturalWidth * ratio;
    const drawHeight = img.naturalHeight * ratio;
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;
    ctx.drawImage(img,x,y,drawWidth,drawHeight);
  }

  function updateVenueBox(selector){
    const box = document.querySelector(selector);
    if(!box) return;

    const title = box.querySelector('.elementor-icon-box-title span, .elementor-icon-box-title');
    const description = box.querySelector('.elementor-icon-box-description');
    if(title) title.textContent = LOCATION.name;
    if(description) description.textContent = LOCATION.address;
  }

  function setupSingleLocation(){
    updateVenueBox('[data-id="667269c4"]');
    updateVenueBox('[data-id="36850c35"]');

    // Akad and reception are held at one venue, so keep only one map button.
    const akadButton = document.querySelector('[data-id="6de79027"]');
    if(akadButton){
      akadButton.classList.add('ww-hidden');
      akadButton.setAttribute('aria-hidden','true');
    }

    const reception = document.querySelector('[data-id="675b33af"]');
    const receptionButton = document.querySelector('[data-id="4a983b1e"]');
    if(!reception) return;

    if(receptionButton){
      receptionButton.classList.remove('elementor-invisible');
      receptionButton.removeAttribute('aria-hidden');
      const link = receptionButton.querySelector('a.elementor-button');
      const label = receptionButton.querySelector('.elementor-button-text');
      if(link){
        link.href = LOCATION.mapsUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      if(label) label.textContent = 'Lihat Lokasi';
    }

    let map = reception.querySelector('.ww-event-map');
    if(!map){
      map = document.createElement('div');
      map.className = 'ww-event-map';
      map.innerHTML = '<iframe title="Lokasi pernikahan di Graha Menur" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen src="' + LOCATION.embedUrl + '"></iframe>';
    }

    // Place the iframe after the reception details and before the only location button.
    if(receptionButton){
      if(map.parentNode !== reception || map.nextElementSibling !== receptionButton){
        reception.insertBefore(map,receptionButton);
      }
    }else if(map.parentNode !== reception){
      reception.appendChild(map);
    }
  }

  function setupWeddingFrame(){
    const host = document.querySelector('[data-id="2ad1e232"]');
    if(!host || host.dataset.wwFrameReady === '1') return;
    host.dataset.wwFrameReady = '1';
    host.classList.remove('elementor-invisible');

    host.innerHTML = `
      <section class="ww-frame-section" aria-labelledby="wwFrameTitle">
        <p class="ww-frame-eyebrow">Capture Your Moments</p>
        <h2 class="ww-frame-title" id="wwFrameTitle">Wedding Frame</h2>
        <p class="ww-frame-copy">Pilih foto terbaikmu, sesuaikan otomatis ke dalam bingkai pernikahan Jihan &amp; Wahyu, lalu unduh atau bagikan hasilnya.</p>
        <div class="ww-frame-preview">
          <canvas id="wwFrameCanvas" width="1080" height="1920" aria-label="Preview wedding frame"></canvas>
        </div>
        <input class="ww-frame-file" id="wwFrameFile" type="file" accept="image/jpeg,image/png,image/webp" />
        <div class="ww-frame-actions">
          <label class="ww-frame-button" for="wwFrameFile">Pilih Foto</label>
          <button class="ww-frame-button" id="wwFrameDownload" type="button">Unduh Frame</button>
          <button class="ww-frame-button ww-frame-button--secondary" id="wwFrameShare" type="button">Bagikan</button>
        </div>
        <p class="ww-frame-status" id="wwFrameStatus" aria-live="polite">Format yang didukung: JPG, PNG, atau WebP. Maksimal 15 MB.</p>
      </section>`;

    const canvas = document.getElementById('wwFrameCanvas');
    const input = document.getElementById('wwFrameFile');
    const download = document.getElementById('wwFrameDownload');
    const share = document.getElementById('wwFrameShare');
    const status = document.getElementById('wwFrameStatus');
    const ctx = canvas.getContext('2d');
    let currentPhoto = null;
    let overlay = null;
    let topOverlay = null;

    function setStatus(message,isError){
      status.textContent = message;
      status.classList.toggle('is-error',Boolean(isError));
    }

    function render(){
      if(!currentPhoto) return;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0,0,w,h);
      drawCover(ctx,currentPhoto,w,h);

      const wash = ctx.createLinearGradient(0,0,0,h);
      wash.addColorStop(0,'rgba(20,15,12,.05)');
      wash.addColorStop(.58,'rgba(20,15,12,.08)');
      wash.addColorStop(1,'rgba(20,15,12,.78)');
      ctx.fillStyle = wash;
      ctx.fillRect(0,0,w,h);

      if(overlay){
        ctx.drawImage(
          overlay,
          0,
          0,
          w,
          h
        );
      }
      if(topOverlay){
        ctx.drawImage(topOverlay,0,0,w,Math.round(w * (topOverlay.naturalHeight/topOverlay.naturalWidth)));
      }

      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,.65)';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#fffaf3';

      /* Same font as Wedding Frame title */
      ctx.font = '400 96px "Pinyon Script", "Times New Roman", serif';
      ctx.fillText(
        'Jihan & Wahyu',
        w / 2,
        h - 220
      );

      ctx.font = '600 25px Arial, sans-serif';
      ctx.fillText(
        '23 OCTOBER 2026',
        w / 2,
        h - 145
      );

      ctx.font = '400 22px Arial, sans-serif';
      ctx.fillText(
        '#JihanWahyu',
        w / 2,
        h - 95
      );

      ctx.shadowBlur = 0;
    }

    async function initialize(){
      try{
        if(document.fonts){
          await document.fonts.load(
            '96px "Pinyon Script"'
          );
        }

        const loaded = await Promise.all([
          loadImage(ASSETS.couple),
          loadImage(ASSETS.frame).catch(function(){
            return null;
          }),
          ASSETS.frameTop
            ? loadImage(ASSETS.frameTop).catch(function(){
                return null;
              })
            : Promise.resolve(null)
        ]);

        currentPhoto = loaded[0];
        overlay = loaded[1];
        topOverlay = loaded[2];

        render();
      }catch(error){
        setStatus(error.message,true);
      }
    }

    input.addEventListener('change',function(){
      const file = input.files && input.files[0];
      if(!file) return;
      if(!/^image\/(jpeg|png|webp)$/.test(file.type)){
        input.value = '';
        setStatus('File ditolak. Gunakan JPG, PNG, atau WebP.',true);
        return;
      }
      if(file.size > 15 * 1024 * 1024){
        input.value = '';
        setStatus('Ukuran foto terlalu besar. Maksimal 15 MB.',true);
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = function(){
        currentPhoto = img;
        render();
        setStatus('Foto berhasil dimasukkan. Frame siap diunduh.',false);
        URL.revokeObjectURL(objectUrl);
      };
      img.onerror = function(){
        setStatus('Foto tidak dapat dibaca. Coba simpan ulang sebagai JPG atau PNG.',true);
        URL.revokeObjectURL(objectUrl);
      };
      img.src = objectUrl;
    });

    function canvasBlob(){
      return new Promise(function(resolve){ canvas.toBlob(resolve,'image/png',1); });
    }

    download.addEventListener('click',async function(){
      const blob = await canvasBlob();
      if(!blob){ setStatus('Frame gagal dibuat. Silakan coba lagi.',true); return; }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'Wedding-Frame-Jihan-Wahyu.png';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); },1000);
      setStatus('Frame berhasil diunduh.',false);
    });

    if(!navigator.share || !window.File){
      share.style.display = 'none';
    }else{
      share.addEventListener('click',async function(){
        try{
          const blob = await canvasBlob();
          const file = new File([blob],'Wedding-Frame-Jihan-Wahyu.png',{type:'image/png'});
          if(navigator.canShare && !navigator.canShare({files:[file]})){
            setStatus('Browser ini tidak mendukung berbagi gambar. Gunakan tombol Unduh Frame.',true);
            return;
          }
          await navigator.share({
            title:'Wedding Frame Jihan & Wahyu',
            text:'Jihan & Wahyu — 23 October 2026',
            files:[file]
          });
          setStatus('Frame siap dibagikan.',false);
        }catch(error){
          if(error && error.name !== 'AbortError'){
            setStatus('Frame tidak dapat dibagikan. Gunakan tombol Unduh Frame.',true);
          }
        }
      });
    }

    initialize();
  }

  function applyAll(){
    hideRemovedSections();
    replaceOldPhotos();
    updateEAmplop();
    simplifyFooter();
    setupSingleLocation();
    setupWeddingFrame();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',applyAll,{once:true});
  }else{
    applyAll();
  }
  window.addEventListener('load',function(){ setTimeout(applyAll,100); },{once:true});

  // Elementor and external scripts sometimes mutate the DOM after load.
  let scheduled = false;
  const observer = new MutationObserver(function(){
    if(scheduled) return;
    scheduled = true;
    requestAnimationFrame(function(){
      scheduled = false;
      applyAll();
    });
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(function(){ observer.disconnect(); },12000);
})();
