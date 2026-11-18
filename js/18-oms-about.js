(function () {
  "use strict";

  var modal = document.getElementById("aboutModal");
  if (!modal) return;

  var card = modal.querySelector(".aboutCard");
  var closeBtn = modal.querySelector("[data-about-close]");
  var lastFocus = null;

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

  window.OmsAbout = { open: open, close: close };
})();
