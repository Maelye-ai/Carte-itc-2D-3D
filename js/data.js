/**
 * DONNÉES GÉOLOGIQUES SYNTHÉTIQUES & VULGARISÉES
 * LAGUNES EXPLORATION AFRIQUE (LEA)
 */

const LEA_DATA = {
  company: {
    name: "LAGUNES EXPLORATION AFRIQUE",
    acronym: "LEA",
    tagline: "L'exploration minière responsable, scientifique et transparente"
  },

  // Sites miniers LEA avec fiches RÉSUMÉES et directes pour non-experts
  sites: [
    {
      id: "bongouanou",
      name: "Bongouanou",
      region: "Région du Moronou",
      commune: "Bongouanou / Andé",
      lat: 6.6167,
      lon: -4.2000,
      status: "wip",
      statusLabel: "Forages en cours",
      progress: 55,
      minerals: ["Or (Au)", "Bauxite (Al)"],
      mineralPrimary: "Or (Au)",
      permitNumber: "PR-084",
      permitAreaKm2: 280,
      drilledMeters: 1850,
      samplesAnalyzed: 420,
      summary: "Sondages profonds (carottages de roche) pour localiser et mesurer l'épaisseur du filon d'or sous la terre.",
      keyWork: [
        "12 forages profonds réalisés (1 850 mètres cumulés)",
        "420 échantillons de roche envoyés en analyse certifiée"
      ],
      environment: "Plateformes de forage 100% rebouchées et revégétalisées sans produits chimiques nocifs."
    },
    {
      id: "beoumi",
      name: "Béoumi",
      region: "Région du Gbêkê",
      commune: "Béoumi / Bodokro",
      lat: 7.6667,
      lon: -5.5667,
      status: "todo",
      statusLabel: "Prospection à démarrer",
      progress: 15,
      minerals: ["Lithium (Li)", "Or (Au)"],
      mineralPrimary: "Lithium (Li)",
      permitNumber: "PR-112",
      permitAreaKm2: 340,
      drilledMeters: 0,
      samplesAnalyzed: 85,
      summary: "Cartographie par satellite et prélèvements pédestres de surface à la recherche de pegmatites à lithium.",
      keyWork: [
        "Analyse d'images satellites radar et géomatique",
        "Reconnaissance pédestre sans engins lourds"
      ],
      environment: "Impact écologique nul : aucune machinerie lourde utilisée lors de la phase préliminaire."
    },
    {
      id: "gagnoa",
      name: "Gagnoa",
      region: "Région du Gôh",
      commune: "Gagnoa / Ouragahio",
      lat: 6.1319,
      lon: -5.9506,
      status: "ok",
      statusLabel: "Phase 1 validée",
      progress: 100,
      minerals: ["Or (Au)"],
      mineralPrimary: "Or (Au)",
      permitNumber: "PR-095",
      permitAreaKm2: 210,
      drilledMeters: 920,
      samplesAnalyzed: 1450,
      summary: "Campagne géophysique et géochimique terminée avec succès. Découverte d'une anomalie aurifère majeure sur 3,5 km.",
      keyWork: [
        "1 450 échantillons de sol analysés au laboratoire",
        "Axe de faille minéralisé repéré par magnétométrie"
      ],
      environment: "Concertation avec les comités villageois et 100% des sites d'échantillonnage remis en état initial."
    },
    {
      id: "tiassale",
      name: "Tiassalé",
      region: "District des Lagunes",
      commune: "Tiassalé / N'Douci",
      lat: 5.8983,
      lon: -4.8228,
      status: "wip",
      statusLabel: "Reconnaissance régionale",
      progress: 40,
      minerals: ["Or (Au)", "Manganèse (Mn)"],
      mineralPrimary: "Or & Manganèse",
      permitNumber: "PR-130",
      permitAreaKm2: 310,
      drilledMeters: 450,
      samplesAnalyzed: 620,
      summary: "Étude géologique préliminaire le long de la faille du fleuve Bandama dans le bassin des Lagunes.",
      keyWork: [
        "Prélèvements alluvionnaires en rivière",
        "Cartographie structurale de surface"
      ],
      environment: "Protection stricte des berges du fleuve et conventions d'accès partagé avec les planteurs."
    }
  ],

  // 4 étapes simplifiées au maximum pour le grand public
  simpleSteps: [
    {
      step: 1,
      title: "Télédétection & Terrain",
      desc: "Étude des photos satellites radar et prélèvements de ruisseaux par des géologues à pied.",
      env: "Impact nul : aucune excavation."
    },
    {
      step: 2,
      title: "Géophysique",
      desc: "Radiographie magnétique du sol avec des capteurs de surface pour repérer les failles sans creuser.",
      env: "Prélèvements de sol minimes aussitôt rebouchés."
    },
    {
      step: 3,
      title: "Forages d'échantillons",
      desc: "Extraction de cylindres de roche (carottes) à 100 m ou 200 m pour vérifier la teneur en or.",
      env: "Chantiers étroits (30 m²), sols nivelés et revégétalisés."
    },
    {
      step: 4,
      title: "Analyses de laboratoire",
      desc: "Mesure scientifique des grammes de métal par tonne de roche et concertation avec les villages.",
      env: "Traitement certifié et respect des populations locales."
    }
  ],

  // Contour lumineux de la Côte d'Ivoire
  ivoryCoastBounds: {
    center: [7.54, -5.55],
    zoom: 7,
    polygon: [
      [-2.85, 5.05], [-2.70, 6.00], [-3.15, 7.30], [-2.75, 8.50],
      [-3.00, 9.50], [-4.20, 10.45], [-5.60, 10.70], [-7.00, 10.30],
      [-8.20, 10.50], [-8.60, 9.50], [-8.45, 8.00], [-8.55, 7.30],
      [-7.50, 6.00], [-7.50, 4.35], [-6.00, 4.75], [-4.50, 5.15],
      [-3.50, 5.10], [-2.85, 5.05]
    ]
  }
};

if (typeof window !== "undefined") {
  window.LEA_DATA = LEA_DATA;
}
