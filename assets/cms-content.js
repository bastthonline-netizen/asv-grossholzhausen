/*
 * cms-content.js
 * Liest die vom Verein im /admin gepflegten Werte aus content/site.json
 * und traegt sie in die Seiten ein. Faellt JS aus, bleibt der statische
 * Inhalt (Platzhalter / Standardwerte) im HTML stehen.
 */
(function () {
  "use strict";

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function telHref(t) {
    return String(t).replace(/[^+\d]/g, "");
  }

  function setLinks(selector, url) {
    if (!url) return;
    document.querySelectorAll(selector).forEach(function (a) {
      a.setAttribute("href", url);
    });
  }

  function getPath(obj, path) {
    return String(path).split(".").reduce(function (o, k) {
      return o == null ? undefined : o[k];
    }, obj);
  }

  // Reiner Text (Vorstands-Namen, Trainer-Namen): textContent setzen.
  function fillTexts(data) {
    document.querySelectorAll("[data-cms-text]").forEach(function (el) {
      var v = getPath(data, el.getAttribute("data-cms-text"));
      if (v) el.textContent = v;
    });
  }

  // Telefon-/E-Mail-Links: href + sichtbares Label (Span) setzen, Icon bleibt.
  function fillLinkFields(data) {
    document.querySelectorAll("[data-cms-tel]").forEach(function (a) {
      var v = getPath(data, a.getAttribute("data-cms-tel"));
      if (!v) return;
      a.setAttribute("href", "tel:" + telHref(v));
      var span = a.querySelector("[data-cms-label]");
      if (span) span.textContent = v;
    });
    document.querySelectorAll("[data-cms-email]").forEach(function (a) {
      var v = getPath(data, a.getAttribute("data-cms-email"));
      if (!v) return;
      a.setAttribute("href", "mailto:" + v);
      var span = a.querySelector("[data-cms-label]");
      if (span) span.textContent = v;
    });
  }

  // Bestehendes <img>: nur src tauschen, wenn im CMS ein Bild gesetzt ist.
  function fillImages(data) {
    document.querySelectorAll("[data-cms-img]").forEach(function (el) {
      var v = getPath(data, el.getAttribute("data-cms-img"));
      if (v) el.setAttribute("src", v);
    });
  }

  // Foto-Platzhalter: ist ein Bild gesetzt, ersetzt es den Platzhalter-Inhalt.
  function fillPhotos(data) {
    document.querySelectorAll("[data-cms-photo]").forEach(function (el) {
      var v = getPath(data, el.getAttribute("data-cms-photo"));
      if (!v) return;
      var img = document.createElement("img");
      img.src = v;
      img.alt = el.getAttribute("data-cms-alt") || "";
      img.loading = "lazy";
      el.innerHTML = "";
      el.classList.add("has-photo");
      el.appendChild(img);
    });
  }

  function fillContacts(kontakte) {
    if (!kontakte) return;
    document.querySelectorAll("[data-cms-contact]").forEach(function (el) {
      var key = el.getAttribute("data-cms-contact");
      var c = kontakte[key];
      if (!c) return;
      var parts = [];
      if (c.name) parts.push(escapeHtml(c.name));
      if (c.tel) {
        parts.push('<a href="tel:' + telHref(c.tel) + '">' + escapeHtml(c.tel) + "</a>");
      }
      if (c.email) {
        parts.push('<a href="mailto:' + escapeHtml(c.email) + '">' + escapeHtml(c.email) + "</a>");
      }
      if (parts.length) el.innerHTML = parts.join(" &middot; ");
    });
  }

  fetch("content/site.json", { cache: "no-cache" })
    .then(function (res) {
      return res.ok ? res.json() : Promise.reject(res.status);
    })
    .then(function (data) {
      fillContacts(data.kontakte);
      fillTexts(data);
      fillLinkFields(data);
      fillImages(data);
      fillPhotos(data);
      setLinks('[data-cms-link="schuhbraeualmlauf"]', data.schuhbraeualmlauf_url);
      setLinks('[data-cms-link="belegung-sportheim"]', data.belegung_sportheim_url);
      setLinks('[data-cms-link="belegung-bus"]', data.belegung_bus_url);
    })
    .catch(function () {
      /* Statischer Fallback bleibt sichtbar. */
    });
})();
