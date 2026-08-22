/**
 * ETIGE — Scripts principaux
 * Navigation mobile, scroll reveal, header scroll, filtre galerie, formulaire.
 * Toutes les fonctions sont isolées et ne polluent pas le scope global.
 */

(function () {
  "use strict";

  function initMain() {
    /* ─────────────────────────────────────────────
     * 1. Navigation mobile
     * ───────────────────────────────────────────── */
    const menuBtn    = document.getElementById("menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");
    const backdrop   = document.getElementById("menu-backdrop");
    const closeBtn   = document.getElementById("menu-close-btn");

    function openMenu() {
      if (!mobileMenu || !menuBtn) return;
      mobileMenu.classList.add("open");
      mobileMenu.setAttribute("aria-hidden", "false");
      menuBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      
      // Petit délai pour laisser la transition CSS se faire avant le focus
      setTimeout(() => {
        closeBtn?.focus();
      }, 100);
    }

    function closeMenu() {
      if (!mobileMenu || !menuBtn) return;
      if (!mobileMenu.classList.contains("open")) return;
      mobileMenu.classList.remove("open");
      mobileMenu.setAttribute("aria-hidden", "true");
      menuBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      menuBtn?.focus();
    }

    function toggleMenu() {
      if (mobileMenu?.classList.contains("open")) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    menuBtn?.addEventListener("click", toggleMenu);
    backdrop?.addEventListener("click", closeMenu);
    closeBtn?.addEventListener("click", closeMenu);

    // Fermer sur Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileMenu?.classList.contains("open")) {
        closeMenu();
      }
    });

    // Fermer quand on clique sur un lien mobile
    mobileMenu?.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    // Fermer le menu si la fenêtre est agrandie au-delà du mode mobile (évite le verrouillage du scroll)
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024 && mobileMenu?.classList.contains("open")) {
        closeMenu();
      }
    });

    // Évite le verrouillage du scroll lors des retours arrière via l'historique (bfcache de Safari/iOS)
    window.addEventListener("pageshow", (e) => {
      if (e.persisted) {
        closeMenu();
      }
    });

    // Piège à focus (Accessibility Focus Trap)
    mobileMenu?.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;

      const focusables = mobileMenu.querySelectorAll('button, [href], input, select, textarea, [tabindex="0"]');
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        // Shift + Tab -> boucle vers le dernier
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        // Tab -> boucle vers le premier
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    });

    /* Le toggle thème est géré dans components.js,
     * directement après l'injection du header dans le DOM. */

    /* ─────────────────────────────────────────────
     * 3. Header au scroll
     * ───────────────────────────────────────────── */
    const header = document.getElementById("site-header");

  if (header) {
    const onScroll = () => {
      header.classList.toggle("scrolled", window.scrollY > 48);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // état initial
  }


  /* ─────────────────────────────────────────────
   * 3. Scroll Reveal (Intersection Observer)
   * ───────────────────────────────────────────── */
  const revealEls = document.querySelectorAll(".reveal");

  if (revealEls.length > 0 && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    // Fallback : tout visible immédiatement
    revealEls.forEach((el) => el.classList.add("visible"));
  }


  /* ─────────────────────────────────────────────
   * 4. Filtre galerie (realisations.html)
   * ───────────────────────────────────────────── */
  const filterBtns   = document.querySelectorAll("[data-filter]");
  const galleryItems = document.querySelectorAll("[data-category]");

  if (filterBtns.length > 0) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.dataset.filter;

        filterBtns.forEach((b) => {
          b.classList.remove("active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");

        galleryItems.forEach((item) => {
          const cats = item.dataset.category.split(" ");
          const show = filter === "all" || cats.includes(filter);
          item.classList.toggle("hidden", !show);
        });
      });
    });
  }


  /* ─────────────────────────────────────────────
   * 5. Formulaire de contact (mailto)
   * ───────────────────────────────────────────── */
  const contactForm = document.getElementById("contact-form");

  contactForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const fd      = new FormData(contactForm);
    const name    = fd.get("name")    || "";
    const email   = fd.get("email")   || "";
    const phone   = fd.get("phone")   || "";
    const subject = fd.get("subject") || "Demande de contact";
    const message = fd.get("message") || "";

    const body = [
      `Nom : ${name}`,
      `Email : ${email}`,
      phone ? `Téléphone : ${phone}` : "",
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    const mailto = `mailto:info@etige-services.ci?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;

    const notice = document.getElementById("form-notice");
    if (notice) {
      notice.textContent =
        "Votre client mail va s'ouvrir. Si rien ne se passe, écrivez-nous directement à info@etige-services.ci";
      notice.style.display = "block";
    }
  });


  /* ─────────────────────────────────────────────
   * 6. Ancre smooth avec offset header fixe
   * ───────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const offset = (header?.offsetHeight || 72) + 16;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });

  } // End initMain

  // Initialize once the DOM is ready (including elements injected by components.js)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMain);
  } else {
    // If components.js has already run and injected the HTML, or DOM is ready
    // We defer slightly to ensure components.js inject() had time to run if they both fired on DOMContentLoaded
    setTimeout(initMain, 10);
  }

})();
