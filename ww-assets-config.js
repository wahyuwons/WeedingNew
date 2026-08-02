/* ==========================================================
   EDIT ASSETS HERE
   Cukup ubah nama file di bagian ini.
   ========================================================== */

window.WW_ASSETS = {
  rightBackgrounds: [
    {
      name: "Main right parallax",
      selector: ".elementor-element-7d40ab52",
      src: "Assets/Aruna-BACKGROUND-PARRALAX-1.webp",
      position: "center center",
      attachment: "fixed"
    },

    {
      name: "Home cover",
      selector: "#home",

      // Kosongkan jika ingin mempertahankan video/background asli.
      src: "",

      position: "center center",
      attachment: "scroll"
    },

    {
      name: "Bride and Groom",
      selector: "#couple",
      src: "Assets/Aruna-BACKGROUND-PARRALAX-1.webp",
      position: "center center",
      attachment: "scroll"
    },

    {
      name: "Wedding Event",
      selector: "#event",
      src: "Assets/Aruna-BACKGROUND-PARRALAX-1.webp",
      position: "center center",
      attachment: "scroll"
    },

    {
      name: "Gallery",
      selector: "#gallery-wrapper",

      // Kosong berarti background original tidak diubah.
      src: "",

      position: "center center",
      attachment: "scroll"
    },

    {
      name: "Quote",
      selector: "#quote",
      src: "",
      position: "center center",
      attachment: "scroll"
    },

    {
      name: "RSVP",
      selector: "#formRSVP",
      src: "",
      position: "center center",
      attachment: "scroll"
    }
  ],

  weddingFrame: {
    src: "Assets/Aruna-Frame-Mempelai.webp"
  }
};


/* ==========================================================
   JANGAN UBAH BAGIAN DI BAWAH INI
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const settings = window.WW_ASSETS || {};

  function applyBackground(item) {
    if (!item.selector || !item.src) {
      return;
    }

    document.querySelectorAll(item.selector).forEach(function (element) {
      const backgroundValue = `url("${item.src}")`;

      element.style.setProperty(
        "background-image",
        backgroundValue,
        "important"
      );

      element.style.setProperty(
        "background-position",
        item.position || "center center",
        "important"
      );

      element.style.setProperty(
        "background-size",
        "cover",
        "important"
      );

      element.style.setProperty(
        "background-repeat",
        "no-repeat",
        "important"
      );

      element.style.setProperty(
        "background-attachment",
        item.attachment || "scroll",
        "important"
      );

      /*
       * Elementor terkadang memasang background pada
       * motion-effects layer, bukan langsung pada container.
       */
      const motionLayers = element.querySelectorAll(
        ":scope > .elementor-motion-effects-container " +
        "> .elementor-motion-effects-layer"
      );

      motionLayers.forEach(function (layer) {
        layer.style.setProperty(
          "background-image",
          backgroundValue,
          "important"
        );

        layer.style.setProperty(
          "background-position",
          item.position || "center center",
          "important"
        );

        layer.style.setProperty(
          "background-size",
          "cover",
          "important"
        );

        layer.style.setProperty(
          "background-repeat",
          "no-repeat",
          "important"
        );
      });
    });
  }

  (settings.rightBackgrounds || []).forEach(applyBackground);

  /*
   * Menyediakan frame sebagai CSS variable juga,
   * apabila preview frame memakai background-image.
   */
  if (settings.weddingFrame?.src) {
    document.documentElement.style.setProperty(
      "--ww-frame-image",
      `url("${settings.weddingFrame.src}")`
    );
  }
});

/* ==========================================================
   ALL RIGHT-SIDE SECTION BACKGROUNDS
   Ubah hanya nama file pada --ww-right-section-bg
   ========================================================== */

:root {
  --ww-right-section-bg:
    url("Assets/Aruna-BACKGROUND-PARRALAX-1.webp");
}

/* Main right panel and all main sections */
.elementor-element.elementor-element-227e1f02,
.elementor-element.elementor-element-227e1f02 > .e-con:not(#header),
.elementor-element.elementor-element-7d40ab52,
#home,
#couple,
#event,
#gallery-wrapper,
#quote,
#wishes,
#formRSVP,
#gift,
.ww-frame-section {
  background-image: var(--ww-right-section-bg) !important;
  background-position: center center !important;
  background-size: cover !important;
  background-repeat: no-repeat !important;
  background-color: transparent !important;
}

/* Elementor may place backgrounds on motion-effect layers */
.elementor-element.elementor-element-227e1f02
.elementor-motion-effects-layer,
#home .elementor-motion-effects-layer,
#couple .elementor-motion-effects-layer,
#event .elementor-motion-effects-layer,
#gallery-wrapper .elementor-motion-effects-layer,
#quote .elementor-motion-effects-layer,
#wishes .elementor-motion-effects-layer,
#formRSVP .elementor-motion-effects-layer,
#gift .elementor-motion-effects-layer {
  background-image: var(--ww-right-section-bg) !important;
  background-position: center center !important;
  background-size: cover !important;
  background-repeat: no-repeat !important;
}

/* Disable the original Elementor background video on Home */
#home .elementor-background-video-container,
#home .elementor-background-video-hosted {
  display: none !important;
}

/* Mobile stability */
@media (max-width: 1024px) {
  .elementor-element.elementor-element-227e1f02,
  .elementor-element.elementor-element-227e1f02 > .e-con:not(#header),
  .elementor-element.elementor-element-7d40ab52,
  #home,
  #couple,
  #event,
  #gallery-wrapper,
  #quote,
  #wishes,
  #formRSVP,
  #gift,
  .ww-frame-section {
    background-attachment: scroll !important;
  }
}