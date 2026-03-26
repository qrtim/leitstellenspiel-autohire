(async () => {

  const TAGE      = 3;    
  const PAUSE_MS  = 300;   
  const DRY_RUN   = false; 
  const MAX_RETRIES = 3;   

  const SKIP_TYPES = {
    0:  "Leitstelle",
    4:  "Krankenhaus",
    6:  "Schule",
    9:  "Bereitstellungsraum",
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, options);
        if (res.status === 429 && attempt < retries) {
          const wait = attempt * 1000;
          console.warn(`⏳ Rate-Limit (429) – warte ${wait / 1000}s (Versuch ${attempt}/${retries})`);
          await sleep(wait);
          continue;
        }
        return res;
      } catch (err) {
        if (attempt < retries) {
          const wait = attempt * 800;
          console.warn(`🔄 Netzwerkfehler – Retry in ${wait / 1000}s (Versuch ${attempt}/${retries}):`, err.message);
          await sleep(wait);
        } else {
          throw err;
        }
      }
    }
  }

  console.log("📋 Lade alle Gebäude...");
  let buildings;
  try {
    const buildingRes = await fetchWithRetry("/api/buildings");
    if (!buildingRes.ok) {
      console.error(`❌ Gebäude konnten nicht geladen werden (HTTP ${buildingRes.status}) – Abbruch.`);
      return;
    }
    buildings = await buildingRes.json();
  } catch (err) {
    console.error("❌ Kritischer Fehler beim Laden der Gebäude – Abbruch:", err.message);
    return;
  }

  const total = buildings.length;
  console.log(`✅ ${total} Gebäude gefunden.`);

  if (DRY_RUN) {
    console.log("%c🔍 DRY-RUN aktiv – es werden KEINE Requests gesendet.", "color: orange; font-weight: bold");
  }

  const hiringCandidates = buildings.filter(
    (b) => !(b.building_type in SKIP_TYPES) && !(b.hiring_phase > 0) && b.personal_count_max > 0
  ).length;
  const etaSec = Math.ceil((hiringCandidates * PAUSE_MS) / 1000);
  const etaMin  = Math.floor(etaSec / 60);
  const etaRest = etaSec % 60;
  console.log(
    `⏱️  Geschätzte Laufzeit: ~${etaMin > 0 ? etaMin + "m " : ""}${etaRest}s` +
    ` (${hiringCandidates} Wachen × ${PAUSE_MS}ms)`
  );

  const skipCounts = {};  
  let alreadyActive = 0;
  let erfolg        = 0;
  let fehler        = 0;
  let idx           = 0;

  const startTime = Date.now();
  const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? "";

  for (const building of buildings) {
    idx++;
    const tag = `[${idx}/${total}]`;
    const label = `${building.caption} (ID ${building.id})`;

    // Typ überspringen?
    if (building.building_type in SKIP_TYPES) {
      const typeName = SKIP_TYPES[building.building_type];
      skipCounts[typeName] = (skipCounts[typeName] ?? 0) + 1;
      continue;
    }

    if (!building.personal_count_max || building.personal_count_max === 0) {
      skipCounts["Kein Personal"] = (skipCounts["Kein Personal"] ?? 0) + 1;
      continue;
    }

    if (building.hiring_phase > 0) {
      alreadyActive++;
      console.log(`${tag} ⏩ ${label} – bereits aktiv`);
      continue;
    }

    await sleep(PAUSE_MS);

    if (DRY_RUN) {
      console.log(`${tag} 🔍 [DRY] ${label} → würde ${TAGE} Tage starten`);
      erfolg++;
      continue;
    }

    try {
      const res = await fetchWithRetry(
        `/buildings/${building.id}/hiring`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-CSRF-Token": csrf,
          },
          body: new URLSearchParams({
            "building_hiring[hiring_active]": 1,
            "building_hiring[hiring_days]":   TAGE,
          }).toString(),
        }
      );

      if (res.status === 404) {
        console.log(`${tag} ⏭️  ${label} → 404 (Typ unterstützt keine Suche)`);
        skipCounts["404-Typ"] = (skipCounts["404-Typ"] ?? 0) + 1;
      } else if (res.ok || res.status === 302) {
        console.log(`${tag} ✅ ${label} → ${TAGE} Tage Suche gestartet`);
        erfolg++;
      } else {
        console.warn(`${tag} ⚠️  ${label} → HTTP ${res.status}`);
        fehler++;
      }
    } catch (err) {
      console.error(`${tag} ❌ ${label} → Fehler:`, err.message);
      fehler++;
    }
  }

  const dauer   = Date.now() - startTime;
  const dauerSec = Math.round(dauer / 1000);
  const dauerMin = Math.floor(dauerSec / 60);
  const dauerRest = dauerSec % 60;

  console.log("─────────────────────────────────────────────────────");
  console.log(
    `🏁 Fertig! ` +
    `✅ Gestartet: ${erfolg}  ` +
    `⚠️  Fehler: ${fehler}  ` +
    `⏩ Bereits aktiv: ${alreadyActive}`
  );

  if (Object.keys(skipCounts).length > 0) {
    const skipSummary = Object.entries(skipCounts)
      .map(([k, v]) => `${v}× ${k}`)
      .join(", ");
    console.log(`⏭️  Übersprungen: ${skipSummary}`);
  }

  console.log(`⏱️  Laufzeit: ${dauerMin > 0 ? dauerMin + "m " : ""}${dauerRest}s`);
  if (DRY_RUN) {
    console.log("%c🔍 DRY-RUN – keine echten Änderungen vorgenommen.", "color: orange; font-weight: bold");
  }
  console.log("─────────────────────────────────────────────────────");

})();
