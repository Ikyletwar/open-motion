(function () {
  "use strict";

  var modal = document.getElementById("aboutModal");
  if (!modal) return;

  var card = modal.querySelector(".aboutCard");
  var closeBtn = modal.querySelector("[data-about-close]");
  var body = modal.querySelector("[data-about-body]");
  var eyebrow = modal.querySelector("[data-about-eyebrow]");
  var footer = modal.querySelector("[data-about-footer]");
  var lastFocus = null;

  var SCHOOL = "SMK Negeri 1 Maluku Tengah";
  var CLASS = "XI TJKT 1";

  var I18N = {
    id: {
      trigger: "TENTANG",
      close: "Tutup",
      eyebrow: "TENTANG APLIKASI",
      lead: "Open Motion adalah editor gerak berbasis web yang dibuat agar motion graphics bisa dipelajari dan dipakai tanpa alur kerja yang rumit, perangkat mahal, atau ketergantungan pada langganan.",
      why: "Mengapa dibuat",
      whyText: "Banyak orang ingin membuat animasi gerak, tetapi berhenti karena aplikasi berat, fitur terlalu padat, atau biaya lisensi. Open Motion mengambil jalur lebih ringan: berjalan langsung di browser dan menyimpan proyek di perangkat sendiri.",
      principles: [
        ["Lokal-first.", "Proyek disimpan di perangkat, bukan di server pihak lain."],
        ["Ringan & langsung.", "Tanpa proses build, tanpa instalasi berat, cukup buka browser."],
        ["Terbuka untuk belajar.", "Struktur modular agar mudah dibaca, diubah, dan dikembangkan."]
      ],
      audience: "Cocok untuk",
      chips: ["Pelajar & mahasiswa", "Kreator pemula", "Guru & pengajar", "Konten media sosial", "Perangkat terbatas"],
      note: "Belum ditujukan untuk produksi broadcast atau film skala besar, render 3D berat, dan kolaborasi real-time. Aplikasi ini masih tahap eksperimen.",
      creator: "Pembuat",
      school: "Sekolah",
      classLabel: "Kelas",
      role: "Peran",
      roleValue: "Pengembang & pemelihara",
      footer: "Dibangun dengan HTML, CSS, dan JavaScript modular.",
      avatar: "Foto profil belum tersedia"
    },
    en: {
      trigger: "ABOUT",
      close: "Close",
      eyebrow: "ABOUT THE APP",
      lead: "Open Motion is a browser-based motion editor built so motion graphics can be learned and used without a complicated workflow, expensive hardware, or a subscription.",
      why: "Why it exists",
      whyText: "Many people want to make motion graphics but stop at heavy apps, crowded interfaces, or license costs. Open Motion takes a lighter path: it runs directly in the browser and keeps projects on your own device.",
      principles: [
        ["Local-first.", "Projects stay on your device, not on someone else's server."],
        ["Lightweight & direct.", "No build step, no heavy install. Just open the browser."],
        ["Open for learning.", "A modular structure that is easy to read, change, and extend."]
      ],
      audience: "Best for",
      chips: ["Students", "Beginner creators", "Teachers", "Social media content", "Limited devices"],
      note: "Not intended for large broadcast or film production, heavy 3D rendering, or real-time collaboration. This app is still experimental.",
      creator: "Creator",
      school: "School",
      classLabel: "Class",
      role: "Role",
      roleValue: "Developer & maintainer",
      footer: "Built with modular HTML, CSS, and JavaScript.",
      avatar: "Profile photo not available yet"
    }
  };

  function currentLang() {
    try {
      if (typeof homeLanguage !== "undefined" && I18N[homeLanguage]) return homeLanguage;
    } catch (e) {}
    var lang = document.documentElement.lang;
    return I18N[lang] ? lang : "en";
  }

  function esc(value) {
    return String(value).replace(/[&<>"]/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch];
    });
  }

  function render() {
    var t = I18N[currentLang()] || I18N.en;

    if (eyebrow) eyebrow.textContent = t.eyebrow;
    if (footer) footer.textContent = t.footer;
    if (closeBtn) closeBtn.setAttribute("aria-label", t.close);

    document.querySelectorAll("[data-about-label]").forEach(function (el) {
      el.textContent = t.trigger;
    });
    document.querySelectorAll("[data-about-trigger]").forEach(function (el) {
      el.title = t.trigger + " Open Motion";
      el.setAttribute("aria-label", t.trigger + " Open Motion");
    });

    if (!body) return;

    var principles = t.principles.map(function (item) {
      return "<li><b>" + esc(item[0]) + "</b> " + esc(item[1]) + "</li>";
    }).join("");

    var chips = t.chips.map(function (chip) {
      return "<span>" + esc(chip) + "</span>";
    }).join("");

    body.innerHTML =
      '<p id="aboutLead" class="aboutLead">' + esc(t.lead) + "</p>" +
      '<section class="aboutSection">' +
        "<h3>" + esc(t.why) + "</h3>" +
        "<p>" + esc(t.whyText) + "</p>" +
        '<ul class="aboutPrinciples">' + principles + "</ul>" +
      "</section>" +
      '<section class="aboutSection">' +
        "<h3>" + esc(t.audience) + "</h3>" +
        '<div class="aboutChips">' + chips + "</div>" +
        '<p class="aboutMuted">' + esc(t.note) + "</p>" +
      "</section>" +
      '<section class="aboutSection aboutCreator">' +
        "<h3>" + esc(t.creator) + "</h3>" +
        '<div class="aboutProfile">' +
          '<div class="aboutAvatar" role="img" aria-label="' + esc(t.avatar) + '"></div>' +
          '<div class="aboutIdentity">' +
            "<b>Hizkia Letwar</b>" +
            '<span class="aboutAlias">Nihongo</span>' +
            '<dl class="aboutMeta">' +
              "<div><dt>" + esc(t.school) + "</dt><dd>" + esc(SCHOOL) + "</dd></div>" +
              "<div><dt>" + esc(t.classLabel) + "</dt><dd>" + esc(CLASS) + "</dd></div>" +
              "<div><dt>" + esc(t.role) + "</dt><dd>" + esc(t.roleValue) + "</dd></div>" +
            "</dl>" +
          "</div>" +
        "</div>" +
      "</section>";
  }

  function isOpen() {
    return !modal.classList.contains("hidden");
  }

  function open() {
    if (isOpen()) return;
    lastFocus = document.activeElement;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("about-open");
    if (closeBtn) closeBtn.focus();
    else if (card) card.focus();
  }

  function close() {
    if (!isOpen()) return;
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("about-open");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    lastFocus = null;
  }

  document.addEventListener("click", function (event) {
    var opener = event.target.closest("[data-about-open]");
    if (opener) {
      event.preventDefault();
      open();
      return;
    }
    if (event.target.closest("[data-about-close]")) {
      event.preventDefault();
      close();
    }
  });

  modal.addEventListener("click", function (event) {
    if (event.target === modal) close();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && isOpen()) {
      event.preventDefault();
      close();
    }
  });

  if (window.MutationObserver) {
    new MutationObserver(render).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"]
    });
  }
  document.addEventListener("click", function (event) {
    if (event.target.closest("[data-language]")) setTimeout(render, 0);
  });

  render();
  window.OmsAbout = { open: open, close: close, render: render };
})();
