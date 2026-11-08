/* architettomantova.it — JS minimo: menu, modulo, consenso cookie e GA4. */
(function () {
  "use strict";

  var GA4_ID = "[GA4_ID]"; // sostituire con l'ID reale, es. G-XXXXXXXXXX
  var CONSENT_KEY = "cr-consenso-cookie";
  var root = document.documentElement;
  var body = document.body;

  /* ---------- Header: bordo allo scroll ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = !body.classList.contains("nav-open");
      body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.querySelector(".nav-toggle__label").textContent = open ? "Chiudi" : "Menu";
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && body.classList.contains("nav-open")) { toggle.click(); toggle.focus(); }
    });
  }

  /* ---------- Sottomenu Servizi ---------- */
  var subToggle = document.querySelector(".nav-sub-toggle");
  var sub = document.getElementById("nav-servizi");
  if (subToggle && sub) {
    var setSub = function (open) { subToggle.setAttribute("aria-expanded", String(open)); sub.hidden = !open; };
    setSub(window.matchMedia("(max-width: 63.99em)").matches);
    subToggle.addEventListener("click", function () { setSub(sub.hidden); });
    document.addEventListener("click", function (e) {
      if (window.matchMedia("(min-width: 64em)").matches && !subToggle.parentNode.contains(e.target)) setSub(false);
    });
    subToggle.parentNode.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !sub.hidden) { setSub(false); subToggle.focus(); }
    });
  }

  /* ---------- Modulo (Formspree) ---------- */
  document.querySelectorAll("form[data-formspree]").forEach(function (form) {
    var status = form.querySelector(".form__status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (form.action.indexOf("[FORMSPREE_ID]") !== -1 || form.action.indexOf("%5BFORMSPREE_ID%5D") !== -1) {
        status.className = "form__status is-error";
        status.textContent = "Bozza: il modulo non è ancora collegato a Formspree. Nel frattempo puoi chiamare o scrivere su WhatsApp.";
        return;
      }
      var btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      status.className = "form__status";
      status.textContent = "Invio in corso…";
      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          form.reset();
          status.className = "form__status is-ok";
          status.textContent = "Grazie, ho ricevuto la tua richiesta. Ti ricontatto al più presto.";
        })
        .catch(function () {
          status.className = "form__status is-error";
          status.textContent = "Il messaggio non è partito. Riprova tra poco oppure chiamami al 340 409 2130.";
        })
        .finally(function () { btn.disabled = false; });
    });
  });

  /* ---------- Consenso cookie e GA4 ---------- */
  function readConsent() { try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; } }
  function saveConsent(v) { try { localStorage.setItem(CONSENT_KEY, v); } catch (e) { /* storage non disponibile */ } }

  function loadGA() {
    if (window.__gaLoaded || !GA4_ID || GA4_ID.charAt(0) === "[") return;
    window.__gaLoaded = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA4_ID);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA4_ID);
  }

  var banner = document.getElementById("cookie-banner");
  function showBanner(show) {
    if (!banner) return;
    banner.hidden = !show;
    root.classList.toggle("has-cookie-banner", show);
    if (show) root.style.setProperty("--cookie-h", banner.offsetHeight + "px");
  }
  function decide(v) {
    saveConsent(v);
    showBanner(false);
    if (v === "accettato") loadGA();
  }

  var consent = readConsent();
  if (consent === "accettato") loadGA();
  else if (!consent) showBanner(true);

  if (banner) {
    banner.querySelector("[data-consent=accept]").addEventListener("click", function () { decide("accettato"); });
    banner.querySelector("[data-consent=reject]").addEventListener("click", function () { decide("rifiutato"); });
  }
  document.querySelectorAll("[data-cookie-settings]").forEach(function (b) {
    b.addEventListener("click", function () { showBanner(true); banner.querySelector("button").focus(); });
  });
})();
