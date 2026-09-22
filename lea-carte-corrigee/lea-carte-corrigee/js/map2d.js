/**
 * MOTEUR 2D CARTOGRAPHIQUE INTERACTIF (LEAFLET + ESRI SATELLITE + OSM)
 * LAGUNES EXPLORATION AFRIQUE (LEA)
 */

class LEAMap2D {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.options = Object.assign({
      initialCenter: [7.2, -5.2],
      initialZoom: 7,
      onSiteSelect: null
    }, options);

    this.sites = window.LEA_DATA ? window.LEA_DATA.sites : [];
    this.markers = {};
    this.polygons = {};
    this.init();
  }

  init() {
    // Initialisation de la carte Leaflet
    this.map = L.map(this.containerId, {
      zoomControl: false,
      attributionControl: false
    }).setView(this.options.initialCenter, this.options.initialZoom);

    // Contrôleur de zoom en bas à droite
    L.control.zoom({ position: "bottomright" }).addTo(this.map);

    // 1. Fond Satellite haute résolution (Esri World Imagery)
    this.satelliteLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, attribution: "Esri World Imagery" }
    );

    // 2. Fond OpenStreetMap standard (avec routes et localités)
    this.osmLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { maxZoom: 19, attribution: "OpenStreetMap contributors" }
    );

    // 3. Fond Clair CartoDB Positron
    this.cartoLayer = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      { maxZoom: 19, attribution: "CartoDB" }
    );

    // Par défaut, activer le fond Satellite HD
    this.satelliteLayer.addTo(this.map);
    this.currentTileLayer = "satellite";

    this.renderMarkers();
    this.renderConcessionPolygons();
    this.renderIvoryCoastContour();
  }

  // Bascule des couches cartographiques
  setTileLayer(type) {
    this.map.removeLayer(this.satelliteLayer);
    this.map.removeLayer(this.osmLayer);
    this.map.removeLayer(this.cartoLayer);

    if (type === "satellite") {
      this.satelliteLayer.addTo(this.map);
    } else if (type === "osm") {
      this.osmLayer.addTo(this.map);
    } else if (type === "carto") {
      this.cartoLayer.addTo(this.map);
    }
    this.currentTileLayer = type;
  }

  // Création des marqueurs 2D stylisés
  renderMarkers() {
    const statusColors = {
      ok: "#10b981",   // Terminé / vert
      wip: "#d4af37",  // En cours / or LEA
      todo: "#38bdf8"  // À démarrer / bleu
    };

    const statusIcons = {
      ok: "✓",
      wip: "⛏",
      todo: "🔍"
    };

    this.sites.forEach(site => {
      const color = statusColors[site.status] || "#d4af37";
      const iconSymbol = statusIcons[site.status] || "⛏";

      // Création d'une icône HTML personnalisée pulsante
      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div class="marker-pulse-wrapper status-${site.status}">
            <div class="marker-pulse"></div>
            <div class="marker-pin" style="background:${color}; border: 2px solid #ffffff;">
              <span class="marker-icon">${iconSymbol}</span>
            </div>
            <div class="marker-label">${site.name}</div>
          </div>
        `,
        iconSize: [42, 42],
        iconAnchor: [21, 38],
        popupAnchor: [0, -38]
      });

      const marker = L.marker([site.lat, site.lon], { icon: customIcon }).addTo(this.map);

      // Contenu du Popup 2D
      const popupHtml = `
        <div class="lea-leaflet-popup">
          <div class="popup-badge status-${site.status}">${site.statusLabel}</div>
          <h3 class="popup-title">${site.name}</h3>
          <p class="popup-region">${site.region} • ${site.commune}</p>
          <div class="popup-meta">
            <div><strong>Minerai :</strong> ${site.minerals.join(", ")}</div>
            <div><strong>Permis :</strong> ${site.permitNumber} (${site.permitAreaKm2} km²)</div>
            <div><strong>Avancement :</strong> ${site.progress}%</div>
          </div>
          <div class="popup-progress-bar">
            <div class="popup-progress-fill" style="width:${site.progress}%; background:${color};"></div>
          </div>
          <button class="popup-btn" onclick="window.LEAUi.openSiteDrawer('${site.id}')">
            Consulter la fiche détaillée &amp; carottes →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 310,
        className: "lea-custom-popup",
        autoPanPaddingTopLeft: [20, 110],
        autoPanPaddingBottomRight: [20, 130]
      });

      marker.on("click", () => {
        if (typeof this.options.onSiteSelect === "function") {
          this.options.onSiteSelect(site);
        }
      });

      this.markers[site.id] = marker;
    });
  }

  // Périmètres approximatifs des concessions d'exploration (polygones)
  renderConcessionPolygons() {
    const statusColors = {
      ok: "#10b981",
      wip: "#d4af37",
      todo: "#38bdf8"
    };

    this.sites.forEach(site => {
      // Générer une boîte englobante polygonale réaliste de concession autour du point
      const deltaLat = 0.08;
      const deltaLon = 0.09;
      const coords = [
        [site.lat - deltaLat, site.lon - deltaLon],
        [site.lat - deltaLat * 0.7, site.lon + deltaLon * 1.1],
        [site.lat + deltaLat * 1.2, site.lon + deltaLon * 0.8],
        [site.lat + deltaLat * 0.9, site.lon - deltaLon * 0.9]
      ];

      const col = statusColors[site.status] || "#d4af37";

      const poly = L.polygon(coords, {
        color: col,
        weight: 2,
        dashArray: "4, 6",
        fillColor: col,
        fillOpacity: 0.12
      }).addTo(this.map);

      poly.bindTooltip(`Périmètre du permis ${site.permitNumber} (${site.permitAreaKm2} km²)`, {
        sticky: true,
        className: "leaflet-concession-tooltip"
      });

      this.polygons[site.id] = poly;
    });
  }

  // Délimitation générale de la Côte d'Ivoire
  renderIvoryCoastContour() {
    if (!window.LEA_DATA || !window.LEA_DATA.ivoryCoastBounds) return;
    const polyCoords = window.LEA_DATA.ivoryCoastBounds.polygon.map(pt => [pt[1], pt[0]]);

    L.polygon(polyCoords, {
      color: "#d4af37",
      weight: 1.5,
      opacity: 0.45,
      fill: false,
      dashArray: "3, 6"
    }).addTo(this.map);
  }

  // Zoomer et centrer sur un site spécifique
  flyToSite(site, zoom = 12) {
    this.map.flyTo([site.lat, site.lon], zoom, {
      animate: true,
      duration: 1.5
    });

    if (this.markers[site.id]) {
      setTimeout(() => {
        this.markers[site.id].openPopup();
      }, 1200);
    }
  }

  // Recentrer sur toute la Côte d'Ivoire
  fitBoundsAll() {
    const latLngs = this.sites.map(s => [s.lat, s.lon]);
    if (latLngs.length > 0) {
      this.map.fitBounds(L.latLngBounds(latLngs), { padding: [50, 50], maxZoom: 8 });
    }
  }

  invalidateSize() {
    this.map.invalidateSize();
  }
}

// Export global
if (typeof window !== "undefined") {
  window.LEAMap2D = LEAMap2D;
}
