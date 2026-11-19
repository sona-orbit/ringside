/* Ringside website: language handling only. Every page works without it.
   - English page + Chinese browser (navigator.languages[0] starts with zh) → the same page in zh-Hant (location.replace).
   - zh-Hant page + non-Chinese browser → show the English hint bar at the top (no automatic redirect, so crawlers that
     read in English still see the Chinese pages).
   - A language picked from the header / footer / hint bar is remembered in localStorage['ringside-language'];
     closing the hint stores ringside-en-hint=off. Every storage access is wrapped in try/catch (private mode). */
(function () {
  "use strict";
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  var page = document.body && document.body.getAttribute("data-lang");
  if (!page) return;
  var browser = ((navigator.languages && navigator.languages[0]) || navigator.language || "").toLowerCase();
  var zh = /^zh(?:-|$)/.test(browser);
  var saved = get("ringside-language");

  function alt(lang) {
    var l = document.querySelector('link[rel="alternate"][hreflang="' + lang + '"]');
    if (!l) return null;
    try { return new URL(l.href).pathname; } catch (e) { return null; }
  }

  if (page === "en" && zh && saved !== "en") {
    var to = alt("zh-Hant");
    if (to && to !== location.pathname) { location.replace(to + location.hash); return; }
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-lang-link]");
    if (a) set("ringside-language", a.getAttribute("data-lang-link"));
  });

  if (page === "zh-Hant" && !zh && saved !== "zh-Hant" && get("ringside-en-hint") !== "off") {
    var bar = document.querySelector("[data-en-hint]");
    var en = alt("en");
    if (bar && en) {
      var link = bar.querySelector("a");
      if (link) link.setAttribute("href", en + location.hash);
      bar.hidden = false;
      var x = bar.querySelector("[data-hint-close]");
      if (x) x.addEventListener("click", function () { bar.hidden = true; set("ringside-en-hint", "off"); });
    }
  }
})();
