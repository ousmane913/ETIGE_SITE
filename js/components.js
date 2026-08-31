/**
 * ETIGE — Composants partagés
 * Header / Footer injectés dynamiquement.
 * Le toggle thème est géré ICI, directement après injection,
 * pour éviter tout problème de timing avec main.js.
 */

(function () {
  "use strict";

  /* ─────────────────────────────────────────────
   * 1. Thème — application immédiate (avant le paint)
   * ───────────────────────────────────────────── */
  function getStoredTheme() {
    const stored = localStorage.getItem("etige-theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("etige-theme", theme);

    // Mettre à jour les icônes si le header est déjà dans le DOM
    const sun  = document.getElementById("theme-icon-sun");
    const moon = document.getElementById("theme-icon-moon");
    if (sun && moon) {
      sun.style.display  = theme === "dark"  ? "block" : "none";
      moon.style.display = theme === "light" ? "block" : "none";
    }

    // Signaler le changement au canvas
    document.dispatchEvent(new CustomEvent("etige:themechange", { detail: { theme } }));
  }

  // Appliquer le thème immédiatement (évite le flash)
  applyTheme(getStoredTheme());

  /* ─────────────────────────────────────────────
   * 2. Détection de la page courante
   * ───────────────────────────────────────────── */
  function isActive(href) {
    const current = window.location.pathname.split("/").pop() || "index.html";
    return current === href ? "active" : "";
  }

  /* ─────────────────────────────────────────────
   * 3. HEADER HTML
   * ───────────────────────────────────────────── */
  const headerHTML = `
    <a href="#main-content" class="skip-link">Aller au contenu principal</a>

    <header id="site-header" role="banner" aria-label="En-tête du site">
      <div class="container">
        <div class="header-inner">

          <a href="index.html" class="logo-header" aria-label="ETIGE — Accueil">
            <img src="assets/images/logo.png" alt="Logo ETIGE" width="40" height="40">
            <span class="logo-name">ETIGE</span>
          </a>

          <nav class="nav-desktop" aria-label="Navigation principale">
            <a href="index.html"        class="nav-link ${isActive("index.html")}">Accueil</a>
            <a href="about.html"        class="nav-link ${isActive("about.html")}">À propos</a>
            <a href="services.html"     class="nav-link ${isActive("services.html")}">Services</a>
            <a href="realisations.html" class="nav-link ${isActive("realisations.html")}">Réalisations</a>
            <a href="contact.html"      class="nav-link ${isActive("contact.html")}">Contact</a>
          </nav>

          <div class="header-cta">
            <button id="theme-toggle" class="btn-icon" aria-label="Basculer le thème clair / sombre">
              <!-- Soleil → passer en mode JOUR -->
              <svg id="theme-icon-sun" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20" style="display:none;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              <!-- Lune → passer en mode NUIT -->
              <svg id="theme-icon-moon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20" style="display:none;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
            </button>
            <a href="contact.html#devis" class="btn btn-outline btn-sm">Demander un devis</a>
          </div>

          <button id="menu-toggle" class="menu-toggle" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="mobile-menu">
            <svg class="icon-menu" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            <svg class="icon-close" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

        </div>
      </div>
    </header>
 
    <div id="mobile-menu" class="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu de navigation" aria-hidden="true">
      <div class="mobile-menu__backdrop" id="menu-backdrop"></div>
      <nav class="mobile-menu__panel" aria-label="Navigation mobile">
        <div class="mobile-menu__header">
          <span class="mobile-menu__label">NAVIGATION</span>
          <button id="menu-close-btn" class="mobile-menu__close" aria-label="Fermer le menu">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <a href="index.html"        class="mobile-nav-link ${isActive("index.html")}">Accueil</a>
        <a href="about.html"        class="mobile-nav-link ${isActive("about.html")}">À propos</a>
        <a href="services.html"     class="mobile-nav-link ${isActive("services.html")}">Services</a>
        <a href="realisations.html" class="mobile-nav-link ${isActive("realisations.html")}">Réalisations</a>
        <a href="contact.html"      class="mobile-nav-link ${isActive("contact.html")}">Contact</a>
        <a href="contact.html#devis" class="btn btn-primary mt-auto">Demander un devis</a>
      </nav>
    </div>
  `;

  /* ─────────────────────────────────────────────
   * 4. FOOTER HTML
   * ───────────────────────────────────────────── */
  const footerHTML = `
    <footer id="site-footer" role="contentinfo" aria-label="Pied de page">
      <div class="container">
        <div class="footer-grid">

          <div class="footer-brand">
            <a href="index.html" aria-label="ETIGE — Accueil">
              <img src="assets/images/logo.png" alt="Logo ETIGE" class="footer-logo">
            </a>
            <p class="footer-tagline">Entreprise des Travaux Télécom, Informatique, Génie Civil et Énergie.</p>
          </div>

          <nav class="footer-nav" aria-label="Navigation du pied de page">
            <h4 class="footer-heading">Navigation</h4>
            <ul>
              <li><a href="index.html">Accueil</a></li>
              <li><a href="about.html">À propos</a></li>
              <li><a href="services.html">Services</a></li>
              <li><a href="realisations.html">Réalisations</a></li>
              <li><a href="contact.html">Contact</a></li>
            </ul>
          </nav>

          <div class="footer-contact">
            <h4 class="footer-heading">Coordonnées</h4>
            <ul>
              <li>Avenue 15, Rue 15</li>
              <li>Treichville, Abidjan — CI</li>
              <li><a href="tel:+2252721538310">+225 27 21 53 83 10</a></li>
              <li><a href="tel:+2250505757810">+225 05 05 75 78 10</a></li>
              <li><a href="mailto:info@etige-services.ci">info@etige-services.ci</a></li>
            </ul>
          </div>

          <div class="footer-legal">
            <h4 class="footer-heading">Légal</h4>
            <ul>
              <li><a href="mentions-legales.html">Mentions légales</a></li>
              <li><a href="mentions-legales.html#confidentialite">Confidentialité</a></li>
            </ul>
          </div>

        </div>

        <div class="footer-bottom">
          <p class="footer-copy">© 2022–2026 ETIGE. Tous droits réservés.</p>
          <p class="footer-domain">etige-services.ci</p>
        </div>
      </div>
    </footer>
  `;

  /* ─────────────────────────────────────────────
   * 5. Injection dans le DOM
   * ───────────────────────────────────────────── */
  function inject() {
    const main = document.getElementById("main-content");
    if (main) {
      main.insertAdjacentHTML("beforebegin", headerHTML);
      main.insertAdjacentHTML("afterend", footerHTML);
    }

    // ── Attacher le toggle MAINTENANT que le bouton existe ──
    const btn  = document.getElementById("theme-toggle");
    btn?.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      applyTheme(current === "light" ? "dark" : "light");
    });

    // Synchroniser les icônes avec le thème courant
    applyTheme(document.documentElement.getAttribute("data-theme") || "dark");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }

})();
