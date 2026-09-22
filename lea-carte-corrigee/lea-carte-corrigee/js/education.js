/**
 * MODULE PÉDAGOGIQUE DE VULGARISATION POUR LE PUBLIC NON-EXPERT
 * LAGUNES EXPLORATION AFRIQUE (LEA)
 */

class LEAEducation {
  constructor() {
    this.data = window.LEA_DATA || {};
    this.currentSiteForCore = this.data.sites ? this.data.sites[0] : null;
  }

  // Rendu de la frise des 5 étapes
  renderExplorationSteps(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !this.data.explorationCycle) return;

    let html = `
      <div class="steps-intro">
        <h3>Le Cycle d'Exploration Minière en 5 Étapes Simples</h3>
        <p>L'exploration est une enquête scientifique non destructive menée avec rigueur par des géologues avant toute décision d'exploitation.</p>
      </div>
      <div class="steps-timeline">
    `;

    this.data.explorationCycle.forEach(step => {
      html += `
        <div class="step-card" data-step="${step.step}">
          <div class="step-header">
            <span class="step-badge">Étape ${step.step}</span>
            <span class="step-duration">⏱ ${step.duration}</span>
          </div>
          <h4 class="step-name">${step.name}</h4>
          <div class="step-metaphor">💡 <em>« ${step.metaphor} »</em></div>
          
          <div class="step-body">
            <p><strong>Objectif :</strong> ${step.objective}</p>
            <p><strong>Comment ça marche :</strong> ${step.howItWorks}</p>
            
            <div class="step-tools">
              <strong>Outils utilisés :</strong>
              <div class="tools-tags">
                ${step.tools.map(t => `<span class="tool-tag">${t}</span>`).join("")}
              </div>
            </div>

            <div class="step-env">
              <span class="env-icon">🌱</span>
              <span><strong>Environnement :</strong> ${step.environmentalImpact}</span>
            </div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }

  // Rendu de la comparaison Exploration vs Exploitation
  renderComparison(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !this.data.comparison) return;

    const comp = this.data.comparison;
    container.innerHTML = `
      <div class="comp-box">
        <h3 class="comp-title">${comp.title}</h3>
        <div class="comp-grid">
          <div class="comp-col exploration">
            <div class="comp-header">
              <h4>${comp.exploration.title}</h4>
              <span class="comp-badge status-wip">${comp.exploration.status}</span>
            </div>
            <ul class="comp-list">
              ${comp.exploration.activities.map(a => `<li>✓ ${a}</li>`).join("")}
            </ul>
            <div class="comp-footer">
              <strong>Mission :</strong> ${comp.exploration.goal}
            </div>
          </div>

          <div class="comp-col exploitation">
            <div class="comp-header">
              <h4>${comp.exploitation.title}</h4>
              <span class="comp-badge status-neutral">${comp.exploitation.status}</span>
            </div>
            <ul class="comp-list">
              ${comp.exploitation.activities.map(a => `<li>⚙ ${a}</li>`).join("")}
            </ul>
            <div class="comp-footer">
              <strong>Mission :</strong> ${comp.exploitation.goal}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Inspecteur interactif de carotte de forage (Virtual Core Sample)
  renderCoreSampleInspector(containerId, siteId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const site = this.data.sites.find(s => s.id === siteId) || this.data.sites[0];
    this.currentSiteForCore = site;

    const strata = site.coreSample || [];

    let html = `
      <div class="core-inspector-wrapper">
        <div class="core-intro">
          <h4>🔬 Inspecteur Didactique de Carotte : ${site.name}</h4>
          <p class="core-subtitle">Ce cylindre de roche représente ce que le carottier diamanté extrait du sous-sol en profondeur.</p>
        </div>

        <div class="core-interactive-layout">
          <!-- Tube 3D représentatif de la carotte géologique -->
          <div class="core-tube-container">
            <div class="core-depth-axis">
              <span>0 m</span>
              <span>25 m</span>
              <span>50 m</span>
              <span>75 m</span>
              <span>100 m</span>
            </div>
            <div class="core-tube">
              ${strata.map((s, idx) => `
                <div class="core-strata ${s.hasGold ? 'has-gold' : ''}" 
                     style="background: ${s.color};"
                     data-idx="${idx}"
                     title="${s.title} (${s.depth})">
                  ${s.hasGold ? '<span class="gold-sparkle">✨ OR DÉTECTÉ</span>' : ''}
                  ${s.isLithium ? '<span class="lithium-sparkle">🔋 LITHIUM</span>' : ''}
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Panneau d'explication de la strate sélectionnée -->
          <div class="core-details-panel" id="core-strata-details">
            <div class="core-active-card">
              <span class="core-badge" id="core-card-depth">${strata[0]?.depth || '0m - 5m'}</span>
              <h5 id="core-card-title">${strata[0]?.title || 'Couche géologique'}</h5>
              <p id="core-card-desc">${strata[0]?.desc || ''}</p>
              <div id="core-card-grade">
                ${strata[0]?.grade ? `<div class="grade-tag">Teneur certifiée : <strong>${strata[0].grade}</strong></div>` : ''}
              </div>
            </div>

            <div class="core-instructions">
              👉 <em>Cliquez ou survolez les tronçons du cylindre pour analyser les différentes strates rocheuses.</em>
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Ajout des interactions sur chaque strate
    const strataEls = container.querySelectorAll(".core-strata");
    strataEls.forEach(el => {
      el.addEventListener("mouseenter", () => {
        const idx = parseInt(el.getAttribute("data-idx"));
        const data = strata[idx];
        if (!data) return;

        strataEls.forEach(s => s.classList.remove("active"));
        el.classList.add("active");

        document.getElementById("core-card-depth").textContent = data.depth;
        document.getElementById("core-card-title").textContent = data.title;
        document.getElementById("core-card-desc").textContent = data.desc;

        const gradeBox = document.getElementById("core-card-grade");
        if (data.grade) {
          gradeBox.innerHTML = `<div class="grade-tag">💎 Concentration mesurée : <strong>${data.grade}</strong></div>`;
        } else {
          gradeBox.innerHTML = `<div class="grade-sterile">Roche stérile encaissante (support géologique)</div>`;
        }
      });
    });

    // Activer la première strate
    if (strataEls.length > 0) {
      strataEls[0].classList.add("active");
    }
  }

  // Rendu du lexique vulgarisé
  renderGlossary(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !this.data.glossary) return;

    let html = `
      <div class="glossary-header">
        <h3>📖 Lexique Minier Simplifié</h3>
        <p>Les mots du secteur géologique expliqués sans jargon technique.</p>
        <input type="text" id="glossary-search" placeholder="Rechercher un terme (ex: carotte, teneur...)" class="glossary-input">
      </div>
      <div class="glossary-grid" id="glossary-items">
    `;

    this.data.glossary.forEach(item => {
      html += `
        <div class="glossary-card">
          <h5 class="glossary-term">${item.term}</h5>
          <p class="glossary-def">${item.definition}</p>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;

    // Filtre temps réel du lexique
    const input = document.getElementById("glossary-search");
    if (input) {
      input.addEventListener("input", (e) => {
        const val = e.target.value.toLowerCase();
        const cards = container.querySelectorAll(".glossary-card");
        cards.forEach(card => {
          const text = card.textContent.toLowerCase();
          card.style.display = text.includes(val) ? "block" : "none";
        });
      });
    }
  }
}

// Export global
if (typeof window !== "undefined") {
  window.LEAEducation = LEAEducation;
}
