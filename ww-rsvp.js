(function(){
  'use strict';

  const DEFAULTS = {
    endpoint: 'https://script.google.com/macros/s/AKfycbwZUjlpQmu69yfG_NSEH0Vv2PV0BniHBQgIXXahbiNaSpV1Se2YbQZngO78ugH4pFhn/exec',
    storageKey: 'ww-rsvp-jihan-wahyu-v1',
    privateStorageKey: 'ww-my-rsvp-jihan-wahyu-v1',
    refreshInterval: 30000,
    displayLimit: 50,
    coupleName: 'Jihan & Wahyu'
  };

  const CONFIG = Object.assign(
    {},
    DEFAULTS,
    window.WW_RSVP_CONFIG || {}
  );

  const FORM_SELECTOR =
    '#formRSVP form.elementor-form';

  const BUTTON_SELECTOR =
    '#submit-formRSVP';

  const LEGACY_COMMENT_URL =
    'attarivitation.com/wp-admin/admin-ajax.php';

  let submitting = false;

  function endpointReady(){
    return Boolean(
      CONFIG.endpoint &&
      /^https:\/\/script\.google\.com\/macros\/s\//i.test(
        CONFIG.endpoint
      ) &&
      /\/exec(?:\?|$)/i.test(
        CONFIG.endpoint
      )
    );
  }

  function text(value){
    return String(
      value == null ? '' : value
    ).trim();
  }

  function uid(){
    if(
      window.crypto &&
      typeof window.crypto.randomUUID === 'function'
    ){
      return window.crypto.randomUUID();
    }

    return (
      'rsvp-' +
      Date.now() +
      '-' +
      Math.random().toString(16).slice(2)
    );
  }

  function getInvitee(){
    const params =
      new URLSearchParams(
        window.location.search
      );

    return text(
      params.get('to') ||
      params.get('dear') ||
      params.get('kepada') ||
      'Tamu Undangan'
    );
  }

  function getPrivateStorageKey(){
    const invitee = getInvitee()
      .toLowerCase()
      .normalize('NFKD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .replace(
        /[^a-z0-9]+/g,
        '-'
      )
      .replace(
        /^-+|-+$/g,
        ''
      )
      .slice(0, 80);

    return (
      String(
        CONFIG.privateStorageKey ||
        DEFAULTS.privateStorageKey
      ) +
      '::' +
      (invitee || 'tamu-undangan')
    );
  }

  function getForm(){
    return document.querySelector(
      FORM_SELECTOR
    );
  }

  function getFields(form){
    return {
      name: form.querySelector(
        '#form-field-form_namalengkap'
      ),

      attendance: form.querySelector(
        'input[name="form_fields[form_konfkehadiran]"]:checked'
      ),

      attendanceInputs: Array.from(
        form.querySelectorAll(
          'input[name="form_fields[form_konfkehadiran]"]'
        )
      ),

      guests: form.querySelector(
        '#form-field-form_jumlahtamu'
      ),

      guestGroup: form.querySelector(
        '.elementor-field-group-form_jumlahtamu'
      ),

      wish: form.querySelector(
        '#form-field-form_ucapan'
      ),

      invitedName: form.querySelector(
        '#form-field-nama_terundang'
      ),

      button: form.querySelector(
        BUTTON_SELECTOR
      ),

      buttonText: form.querySelector(
        BUTTON_SELECTOR +
        ' .elementor-button-text'
      )
    };
  }

  function ensureStatus(form){
    let status =
      form.querySelector(
        '.ww-rsvp-status'
      );

    if(!status){
      status =
        document.createElement('div');

      status.className =
        'ww-rsvp-status';

      status.setAttribute(
        'role',
        'status'
      );

      status.setAttribute(
        'aria-live',
        'polite'
      );

      const buttons =
        form.querySelector(
          '.e-form__buttons'
        ) ||
        form.lastElementChild;

      if(
        buttons &&
        buttons.parentNode
      ){
        buttons.parentNode.insertBefore(
          status,
          buttons.nextSibling
        );
      }else{
        form.appendChild(status);
      }
    }

    return status;
  }

  function setStatus(
    form,
    message,
    type
  ){
    const status =
      ensureStatus(form);

    status.textContent = message;

    status.className =
      'ww-rsvp-status' +
      (
        type
          ? ' is-' + type
          : ''
      );
  }

  function setBusy(
    fields,
    busy
  ){
    if(fields.button){
      fields.button.disabled = busy;

      fields.button.setAttribute(
        'aria-busy',
        String(busy)
      );
    }

    if(fields.buttonText){
      fields.buttonText.textContent =
        busy
          ? 'Mengirim...'
          : 'Kirim';
    }
  }

  function syncGuestField(form){
    const fields =
      getFields(form);

    const selected =
      form.querySelector(
        'input[name="form_fields[form_konfkehadiran]"]:checked'
      );

    const attending =
      selected &&
      text(selected.value)
        .toLowerCase() === 'hadir';

    if(fields.guestGroup){
      fields.guestGroup.classList.toggle(
        'ww-rsvp-hidden-field',
        !attending
      );

      fields.guestGroup.classList.toggle(
        'hiddenn',
        !attending
      );
    }

    if(fields.guests){
      fields.guests.required =
        Boolean(attending);

      fields.guests.disabled =
        !attending;

      if(!attending){
        fields.guests.value = '';
      }
    }
  }

  function initializeForm(){
    const form = getForm();

    if(
      !form ||
      form.dataset.wwRsvpReady === '1'
    ){
      return;
    }

    form.dataset.wwRsvpReady = '1';

    form.setAttribute(
      'action',
      'javascript:void(0)'
    );

    form.setAttribute(
      'novalidate',
      'novalidate'
    );

    const fields =
      getFields(form);

    const invitee =
      getInvitee();

    if(fields.invitedName){
      fields.invitedName.value =
        invitee;
    }

    if(
      fields.name &&
      invitee &&
      invitee !== 'Tamu Undangan' &&
      !text(fields.name.value)
    ){
      fields.name.value =
        invitee;
    }

    fields.attendanceInputs.forEach(
      function(input){
        input.addEventListener(
          'change',
          function(){
            syncGuestField(form);
          }
        );
      }
    );

    ensureStatus(form);
    syncGuestField(form);

    const legacySuccess =
      form.parentElement &&
      form.parentElement.querySelector(
        '.extensions-for-elementor-form.custom-sucess-message'
      );

    if(legacySuccess){
      legacySuccess.classList.add(
        'ww-rsvp-legacy-hidden'
      );
    }

    const savedRecord =
      readPrivateRsvp();

    if(savedRecord){
      renderPrivateRsvp(
        form,
        savedRecord
      );
    }
  }

  function validate(form){
    const fields =
      getFields(form);

    const name = text(
      fields.name &&
      fields.name.value
    );

    const attendance =
      fields.attendance
        ? text(
            fields.attendance.value
          )
        : '';

    const guests = text(
      fields.guests &&
      fields.guests.value
    );

    const wish = text(
      fields.wish &&
      fields.wish.value
    );

    if(!name){
      setStatus(
        form,
        'Silakan isi nama terlebih dahulu.',
        'error'
      );

      if(fields.name){
        fields.name.focus();
      }

      return null;
    }

    if(!attendance){
      setStatus(
        form,
        'Silakan pilih konfirmasi kehadiran.',
        'error'
      );

      return null;
    }

    if(
      attendance.toLowerCase() ===
        'hadir' &&
      !guests
    ){
      setStatus(
        form,
        'Silakan pilih jumlah tamu yang hadir.',
        'error'
      );

      if(fields.guests){
        fields.guests.focus();
      }

      return null;
    }

    if(!wish){
      setStatus(
        form,
        'Silakan tuliskan doa atau ucapan.',
        'error'
      );

      if(fields.wish){
        fields.wish.focus();
      }

      return null;
    }

    return {
      id: uid(),

      timestamp:
        new Date().toISOString(),

      name:
        name.slice(0, 120),

      attendance:
        attendance.slice(0, 40),

      guests:
        attendance.toLowerCase() ===
          'hadir'
          ? guests.slice(0, 30)
          : '0 Orang',

      wish:
        wish.slice(0, 1000),

      invitee:
        getInvitee().slice(0, 120),

      page:
        window.location.href.slice(
          0,
          500
        )
    };
  }

  function savePrivateRsvp(record){
    try{
      localStorage.setItem(
        getPrivateStorageKey(),
        JSON.stringify(record)
      );
    }catch(error){
      console.warn(
        'WW RSVP: gagal menyimpan preview RSVP pribadi.',
        error
      );
    }
  }

  function readPrivateRsvp(){
    try{
      const value =
        localStorage.getItem(
          getPrivateStorageKey()
        );

      return value
        ? JSON.parse(value)
        : null;
    }catch(error){
      console.warn(
        'WW RSVP: gagal membaca preview RSVP pribadi.',
        error
      );

      return null;
    }
  }

  async function sendRemote(record){
    if(!endpointReady()){
      return {
        mode: 'local'
      };
    }

    const body =
      new URLSearchParams();

    body.set(
      'action',
      'submit'
    );

    body.set(
      'payload',
      JSON.stringify(record)
    );

    await fetch(
      CONFIG.endpoint,
      {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-store',

        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded;charset=UTF-8'
        },

        body:
          body.toString()
      }
    );

    return {
      mode: 'remote'
    };
  }

  function formatDate(value){
    const date =
      new Date(value);

    if(
      Number.isNaN(
        date.getTime()
      )
    ){
      return '';
    }

    try{
      return new Intl.DateTimeFormat(
        'id-ID',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }
      ).format(date);
    }catch(error){
      return date.toLocaleString(
        'id-ID'
      );
    }
  }

  function createElement(
    tagName,
    className,
    value
  ){
    const element =
      document.createElement(
        tagName
      );

    if(className){
      element.className =
        className;
    }

    element.textContent =
      text(value);

    return element;
  }

  function appendPreviewRow(
    container,
    labelValue,
    contentValue,
    extraClass
  ){
    const row =
      document.createElement('div');

    row.className =
      'ww-my-rsvp__row';

    const label =
      createElement(
        'strong',
        '',
        labelValue
      );

    const content =
      createElement(
        'span',
        extraClass || '',
        contentValue || '—'
      );

    row.appendChild(label);
    row.appendChild(content);

    container.appendChild(row);
  }

  function ensurePrivatePreview(form){
    let preview =
      document.getElementById(
        'wwMyRsvp'
      );

    if(preview){
      return preview;
    }

    preview =
      document.createElement(
        'section'
      );

    preview.id =
      'wwMyRsvp';

    preview.className =
      'ww-my-rsvp';

    preview.setAttribute(
      'aria-live',
      'polite'
    );

    preview.setAttribute(
      'aria-label',
      'Konfirmasi RSVP Anda'
    );

    form.insertAdjacentElement(
      'afterend',
      preview
    );

    return preview;
  }

  function renderPrivateRsvp(
    form,
    record
  ){
    if(
      !form ||
      !record
    ){
      return;
    }

    const preview =
      ensurePrivatePreview(form);

    const attending =
      text(record.attendance)
        .toLowerCase() === 'hadir';

    preview.replaceChildren();

    preview.appendChild(
      createElement(
        'p',
        'ww-my-rsvp__label',
        'Konfirmasi Anda'
      )
    );

    preview.appendChild(
      createElement(
        'h3',
        'ww-my-rsvp__title',
        'Terima kasih, ' +
          (
            text(record.name) ||
            'Tamu Undangan'
          )
      )
    );

    preview.appendChild(
      createElement(
        'p',
        'ww-my-rsvp__privacy',
      )
    );

    appendPreviewRow(
      preview,
      'Kehadiran',
      record.attendance || '—'
    );

    appendPreviewRow(
      preview,
      'Jumlah Tamu',
      attending
        ? record.guests ||
          '1 Orang'
        : '—'
    );

    appendPreviewRow(
      preview,
      'Doa & Ucapan',
      record.wish || '—',
      'ww-my-rsvp__wish'
    );

    appendPreviewRow(
      preview,
      'Dikirim',
      formatDate(
        record.timestamp
      ) || '—'
    );

    preview.classList.add(
      'is-visible'
    );
  }

  function removePublicRsvpPreview(){
    [
      '#wishes-list',
      '#btn-wisheslist',
      '#realtime-comments',
      '#ww-rsvp-list',
      '.ww-rsvp-list',
      '[data-ww-rsvp-list]',
      '.cui-wrapper'
    ].forEach(
      function(selector){
        document
          .querySelectorAll(
            selector
          )
          .forEach(
            function(element){
              element.remove();
            }
          );
      }
    );
  }

  async function submitForm(form){
    if(submitting){
      return;
    }

    const record =
      validate(form);

    if(!record){
      return;
    }

    submitting = true;

    const fields =
      getFields(form);

    setBusy(
      fields,
      true
    );

    setStatus(
      form,
      'Sedang mengirim konfirmasi...',
      'info'
    );

    try{
      const result =
        await sendRemote(record);

      savePrivateRsvp(record);

      renderPrivateRsvp(
        form,
        record
      );

      if(
        result.mode === 'remote'
      ){
        setStatus(
          form,
          'Terima kasih. Konfirmasi dan ucapan Anda berhasil dikirim.',
          'success'
        );
      }else{
        setStatus(
          form,
          'Konfirmasi tersimpan dalam mode preview. Hubungkan Google Sheets agar kiriman tersimpan secara terpusat.',
          'warning'
        );
      }

      if(fields.wish){
        fields.wish.value = '';
      }

      if(fields.guests){
        fields.guests.value = '';
      }

      fields.attendanceInputs.forEach(
        function(input){
          input.checked = false;
        }
      );

      syncGuestField(form);
    }catch(error){
      setStatus(
        form,
        'Konfirmasi belum dapat dikirim. Periksa koneksi internet lalu coba lagi.',
        'error'
      );

      console.error(
        'WW RSVP submit error:',
        error
      );
    }finally{
      submitting = false;

      setBusy(
        fields,
        false
      );
    }
  }

  function isSubmitButton(target){
    return Boolean(
      target &&
      (
        target.id ===
          'submit-formRSVP' ||
        (
          target.closest &&
          target.closest(
            BUTTON_SELECTOR
          )
        )
      )
    );
  }

  document.addEventListener(
    'click',
    function(event){
      if(
        !isSubmitButton(
          event.target
        )
      ){
        return;
      }

      const form =
        event.target.closest
          ? event.target.closest(
              'form'
            )
          : getForm();

      if(
        !form ||
        !form.closest(
          '#formRSVP'
        )
      ){
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      submitForm(form);
    },
    true
  );

  document.addEventListener(
    'submit',
    function(event){
      const form =
        event.target;

      if(
        !form ||
        !form.matches ||
        !form.matches(
          FORM_SELECTOR
        )
      ){
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      submitForm(form);
    },
    true
  );

  if(
    typeof window.fetch ===
    'function'
  ){
    const nativeFetch =
      window.fetch.bind(window);

    window.fetch =
      function(input, init){
        const url =
          typeof input ===
            'string'
            ? input
            : (
                input &&
                input.url
                  ? input.url
                  : ''
              );

        const requestBody =
          String(
            init &&
            init.body
              ? init.body
              : ''
          );

        if(
          url.indexOf(
            LEGACY_COMMENT_URL
          ) >= 0 &&
          (
            url.indexOf(
              'get_realtime_comments'
            ) >= 0 ||
            requestBody.indexOf(
              'delete_comment'
            ) >= 0
          )
        ){
          return Promise.resolve(
            new Response(
              JSON.stringify({
                success: false,
                data: {
                  updated: false
                }
              }),
              {
                status: 200,

                headers: {
                  'Content-Type':
                    'application/json'
                }
              }
            )
          );
        }

        return nativeFetch(
          input,
          init
        );
      };
  }

  function boot(){
    removePublicRsvpPreview();
    initializeForm();

    const observer =
      new MutationObserver(
        function(){
          removePublicRsvpPreview();
        }
      );

    observer.observe(
      document.body,
      {
        childList: true,
        subtree: true
      }
    );

    window.setTimeout(
      function(){
        observer.disconnect();
      },
      20000
    );
  }

  if(
    document.readyState ===
    'loading'
  ){
    document.addEventListener(
      'DOMContentLoaded',
      boot,
      {
        once: true
      }
    );
  }else{
    boot();
  }
})();