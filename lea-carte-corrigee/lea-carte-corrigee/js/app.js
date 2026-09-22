/**
 * CONTRÔLEUR GÉNÉRAL DE L'APPLICATION
 * LAGUNES EXPLORATION AFRIQUE (LEA) — STYLE GOOGLE MAPS 3D & INFOS SYNTHÉTIQUES
 */

class LEAApp {
  constructor() {
    this.currentView = "3d";
    this.activeSite = null;
    this.activeFilter = "all";
    this.searchQuery = "";
    this.isTourRunning = false;

    this.init();
  }

  init() {
    // 1. Initialisation des moteurs cartographiques 3D et 2D
    // (chacun est isolé dans un try/catch : si l'un échoue — ex. Leaflet
    // non chargé — l'autre continue de fonctionner et les boutons restent actifs)
    try {
      this.globe3d = new LEAGlobe3D("globe-3d-container", {
        onSiteSelect: (site) => this.selectSite(site, "3d")
      });
    } catch (err) {
      console.error("[LEA] Échec de l'initialisation du globe 3D :", err);
    }

    try {
      this.map2d = new LEAMap2D("map-2d-container", {
        onSiteSelect: (site) => this.selectSite(site, "2d")
      });
    } catch (err) {
      console.error("[LEA] Échec de l'initialisation de la carte 2D — vérifiez que libs/leaflet/leaflet.js est bien chargé AVANT js/map2d.js :", err);
    }

    // 2. Initialisation des composants graphiques
    this.renderBottomCarousel();
    this.setupEventListeners();
    this.renderSimpleGuide();

    // 3. Sélectionner le premier site par défaut
    if (window.LEA_DATA && window.LEA_DATA.sites.length > 0) {
      this.activeSite = window.LEA_DATA.sites[0];
    }

    window.LEAUi = this;
  }

  setupEventListeners() {
    // Bascule de Vue 3D / 2D
    const btn3d = document.getElementById("btn-view-3d");
    const btn2d = document.getElementById("btn-view-2d");
    const viewport3d = document.getElementById("globe-3d-container");
    const viewport2d = document.getElementById("map-2d-container");

    btn3d.addEventListener("click", () => {
      this.currentView = "3d";
      btn3d.classList.add("active");
      btn2d.classList.remove("active");
      viewport3d.classList.add("active");
      viewport2d.classList.remove("active");
      if (this.activeSite && this.globe3d) {
        this.globe3d.flyToSite(this.activeSite, 1400);
      }
    });

    btn2d.addEventListener("click", () => {
      this.currentView = "2d";
      btn2d.classList.add("active");
      btn3d.classList.remove("active");
      viewport2d.classList.add("active");
      viewport3d.classList.remove("active");

      if (!this.map2d) {
        console.error("[LEA] Clic sur \"Carte 2D\" ignoré : la carte 2D n'a jamais pu s'initialiser (voir l'erreur au chargement de la page).");
        return;
      }

      setTimeout(() => {
        this.map2d.invalidateSize();
        if (this.activeSite) {
          this.map2d.flyToSite(this.activeSite, 10);
        } else {
          this.map2d.fitBoundsAll();
        }
      }, 200);
    });

    // Recherche instantanée
    const searchInput = document.getElementById("global-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.filterAndRenderCarousel();
      });
    }

    // Filtres rapides (Chips)
    const filterChips = document.querySelectorAll(".filter-chip");
    filterChips.forEach(chip => {
      chip.addEventListener("click", () => {
        filterChips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        this.activeFilter = chip.getAttribute("data-filter");
        this.filterAndRenderCarousel();
      });
    });

    // Navigation droite (Zoom, Home, Boussole)
    const zoomInBtn = document.getElementById("nav-zoom-in");
    const zoomOutBtn = document.getElementById("nav-zoom-out");
    const homeBtn = document.getElementById("nav-home-btn");
    const compassBtn = document.getElementById("nav-compass-btn");

    if (zoomInBtn) {
      zoomInBtn.addEventListener("click", () => {
        if (this.currentView === "3d" && this.globe3d) {
          this.globe3d.camera.position.z = Math.max(11.5, this.globe3d.camera.position.z - 2.5);
        } else if (this.map2d) {
          this.map2d.map.zoomIn();
        }
      });
    }

    if (zoomOutBtn) {
      zoomOutBtn.addEventListener("click", () => {
        if (this.currentView === "3d" && this.globe3d) {
          this.globe3d.camera.position.z = Math.min(42, this.globe3d.camera.position.z + 3);
        } else if (this.map2d) {
          this.map2d.map.zoomOut();
        }
      });
    }

    if (homeBtn) {
      homeBtn.addEventListener("click", () => {
        if (this.currentView === "3d" && this.globe3d) {
          this.globe3d.focusOnIvoryCoast(true);
        } else if (this.map2d) {
          this.map2d.fitBoundsAll();
        }
      });
    }

    if (compassBtn) {
      compassBtn.addEventListener("click", () => {
        if (this.currentView === "3d" && this.globe3d) {
          this.globe3d.focusOnIvoryCoast(true);
        } else if (this.map2d) {
          this.map2d.fitBoundsAll();
        }
      });
    }

    // Bouton Visite Guidée 3D
    const tourBtn = document.getElementById("btn-start-tour");
    if (tourBtn) {
      tourBtn.addEventListener("click", () => this.toggleGuidedTour());
    }

    // Bouton Guide Pédagogique
    const eduBtn = document.getElementById("btn-open-edu");
    if (eduBtn) {
      eduBtn.addEventListener("click", () => this.openEducationModal());
    }

    // Fermeture du Drawer de site
    const closeDrawerBtn = document.getElementById("drawer-close-btn");
    if (closeDrawerBtn) {
      closeDrawerBtn.addEventListener("click", () => this.closeSiteDrawer());
    }

    // Fermeture de la Modale Pédagogique
    const closeEduBtn = document.getElementById("modal-edu-close");
    const modalOverlay = document.getElementById("modal-edu-overlay");
    if (closeEduBtn) {
      closeEduBtn.addEventListener("click", () => this.closeEducationModal());
    }
    if (modalOverlay) {
      modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) this.closeEducationModal();
      });
    }

    // Partage WhatsApp global
    const waGlobalBtn = document.getElementById("btn-share-wa");
    if (waGlobalBtn) {
      waGlobalBtn.addEventListener("click", () => this.shareOnWhatsApp());
    }
  }

  // Rendu du carrousel de sites en bas (format concis)
  renderBottomCarousel() {
    const container = document.getElementById("bottom-carousel");
    if (!container || !window.LEA_DATA) return;

    const sites = this.getFilteredSites();
    container.innerHTML = "";

    if (sites.length === 0) {
      container.innerHTML = `
        <div style="background:var(--panel-bg); padding:10px 18px; border-radius:12px; color:var(--text-muted); font-size:0.82rem;">
          Aucun site ne correspond aux filtres.
        </div>
      `;
      return;
    }

    sites.forEach(site => {
      const card = document.createElement("div");
      card.className = `carousel-site-card ${this.activeSite && this.activeSite.id === site.id ? 'active' : ''}`;
      card.id = `card-site-${site.id}`;

      const statusClass = `badge-${site.status}`;
      const fillCol = site.status === 'ok' ? '#10b981' : site.status === 'wip' ? '#d4af37' : '#38bdf8';

      card.innerHTML = `
        <div class="card-top-row">
          <div class="card-site-name">${site.name}</div>
          <span class="card-badge ${statusClass}">${site.statusLabel.split(' ')[0]}</span>
        </div>
        <div class="card-site-region">${site.region} • ${site.mineralPrimary}</div>
        <div class="card-progress-section">
          <div class="card-progress-track">
            <div class="card-progress-fill" style="width: ${site.progress}%; background: ${fillCol};"></div>
          </div>
          <div class="card-progress-text">${site.progress}%</div>
        </div>
      `;

      card.addEventListener("click", () => {
        this.selectSite(site);
      });

      container.appendChild(card);
    });
  }

  getFilteredSites() {
    let sites = window.LEA_DATA ? window.LEA_DATA.sites : [];

    if (this.activeFilter !== "all") {
      sites = sites.filter(s => {
        if (this.activeFilter === "wip") return s.status === "wip";
        if (this.activeFilter === "ok") return s.status === "ok";
        if (this.activeFilter === "todo") return s.status === "todo";
        if (this.activeFilter === "gold") return s.minerals.some(m => m.includes("Or"));
        if (this.activeFilter === "lithium") return s.minerals.some(m => m.includes("Lithium"));
        return true;
      });
    }

    if (this.searchQuery) {
      sites = sites.filter(s =>
        s.name.toLowerCase().includes(this.searchQuery) ||
        s.region.toLowerCase().includes(this.searchQuery) ||
        s.permitNumber.toLowerCase().includes(this.searchQuery) ||
        s.minerals.join(" ").toLowerCase().includes(this.searchQuery)
      );
    }

    return sites;
  }

  filterAndRenderCarousel() {
    this.renderBottomCarousel();
  }

  // Sélection d'un site
  selectSite(site, sourceView = null) {
    this.activeSite = site;

    document.querySelectorAll(".carousel-site-card").forEach(c => c.classList.remove("active"));
    const activeCard = document.getElementById(`card-site-${site.id}`);
    if (activeCard) {
      activeCard.classList.add("active");
      activeCard.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }

    if (this.currentView === "3d" && this.globe3d) {
      this.globe3d.flyToSite(site);
    } else if (this.map2d) {
      this.map2d.flyToSite(site, 11);
    }

    this.openSiteDrawer(site.id);
  }

  // Ouverture du panneau d'information RÉSUMÉ du site
  openSiteDrawer(siteId) {
    const site = window.LEA_DATA.sites.find(s => s.id === siteId) || this.activeSite;
    if (!site) return;

    this.activeSite = site;
    const drawer = document.getElementById("site-drawer");

    // Données d'en-tête
    document.getElementById("drawer-site-title").textContent = site.name;
    document.getElementById("drawer-site-region").textContent = `${site.region} — Permis ${site.permitNumber}`;

    const badgeEl = document.getElementById("drawer-site-badge");
    badgeEl.textContent = site.statusLabel;
    badgeEl.className = `card-badge badge-${site.status}`;

    // Pastilles chiffres clés condensées
    document.getElementById("stat-permit").textContent = site.permitNumber;
    document.getElementById("stat-area").textContent = `${site.permitAreaKm2} km²`;
    document.getElementById("stat-drilled").textContent = `${site.drilledMeters} m`;
    document.getElementById("stat-mineral").textContent = site.mineralPrimary;

    // Résumé en 1 phrase
    document.getElementById("drawer-site-summary").textContent = site.summary;

    // Travaux récents (2 puces synthétiques)
    const workListEl = document.getElementById("drawer-work-list");
    workListEl.innerHTML = site.keyWork.map(w => `<li>${w}</li>`).join("");

    // Garantie environnementale (1 phrase)
    document.getElementById("drawer-env-text").textContent = site.environment;

    // Partage WhatsApp du site
    const waSiteBtn = document.getElementById("drawer-wa-btn");
    if (waSiteBtn) {
      const msg = `Suivi d'exploration LEA — Site de ${site.name} (${site.region}) : ${site.statusLabel} (${site.progress}%) avec ${site.drilledMeters}m forés ! Découvrez la carte interactive : ${window.location.href}`;
      waSiteBtn.href = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    }

    drawer.classList.add("open");
  }

  closeSiteDrawer() {
    const drawer = document.getElementById("site-drawer");
    if (drawer) drawer.classList.remove("open");
  }

  // Guide pédagogique vulgarisé et condensé
  renderSimpleGuide() {
    const container = document.getElementById("guide-steps-container");
    if (!container || !window.LEA_DATA || !window.LEA_DATA.simpleSteps) return;

    let html = `
      <div style="background:rgba(212,175,55,0.1); border-left:4px solid var(--gold); padding:12px; border-radius:6px; margin-bottom:18px;">
        <h4 style="color:#fff; margin-bottom:4px; font-size:0.92rem;">💡 L'exploration minière en 1 phrase :</h4>
        <p style="font-size:0.82rem; color:#cbd5e1; line-height:1.4;">
          L'exploration n'est <strong>pas</strong> une mine à ciel ouvert. C'est une enquête géologique scientifique non destructrice pour cartographier le sous-sol avant toute décision.
        </p>
      </div>

      <div class="steps-timeline" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
    `;

    window.LEA_DATA.simpleSteps.forEach(s => {
      html += `
        <div class="step-card" style="padding:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span class="step-badge">Étape ${s.step}</span>
          </div>
          <div style="font-weight:700; color:#fff; font-size:0.88rem; margin-bottom:6px;">${s.title}</div>
          <p style="font-size:0.78rem; color:#94a3b8; line-height:1.4; margin-bottom:8px;">${s.desc}</p>
          <div style="font-size:0.72rem; color:#34d399; background:rgba(16,185,129,0.1); padding:4px 8px; border-radius:4px;">
            🌱 ${s.env}
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }

  // Visite guidée 3D
  toggleGuidedTour() {
    const tourBtn = document.getElementById("btn-start-tour");
    const tourBanner = document.getElementById("tour-indicator-banner");

    if (this.isTourRunning) {
      this.isTourRunning = false;
      this.globe3d.stopGuidedTour();
      tourBtn.innerHTML = "▶ Visite Guidée 3D";
      if (tourBanner) tourBanner.style.display = "none";
    } else {
      this.isTourRunning = true;
      if (this.currentView !== "3d") {
        document.getElementById("btn-view-3d").click();
      }
      tourBtn.innerHTML = "⏹ Arrêter la Visite";
      if (tourBanner) tourBanner.style.display = "flex";

      this.globe3d.startGuidedTour((site, index, total) => {
        this.selectSite(site);
        const tourTitle = document.getElementById("tour-banner-title");
        if (tourTitle) {
          tourTitle.textContent = `Étape ${index + 1}/${total} : ${site.name} (${site.mineralPrimary})`;
        }
      });
    }
  }

  openEducationModal() {
    const modal = document.getElementById("modal-edu-overlay");
    if (modal) modal.classList.add("open");
  }

  closeEducationModal() {
    const modal = document.getElementById("modal-edu-overlay");
    if (modal) modal.classList.remove("open");
  }

  shareOnWhatsApp() {
    const msg = `Découvrez la cartographie 3D interactive des sites d'exploration minière de LAGUNES EXPLORATION AFRIQUE (LEA) en Côte d'Ivoire : ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.app = new LEAApp();
});
