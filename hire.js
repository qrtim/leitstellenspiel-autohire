(async () => {
  // ═══════════════ EINSTELLUNGEN ═══════════════
  const TAGE = 3;            // Werbe-Dauer: 1, 2 oder 3 Tage
  const PAUSE_MS = 300;      // Pause zwischen Anfragen (ms)
  const DRY_RUN = false;     // true = nur Vorschau, keine Anfragen
  const MAX_RETRIES = 2;     // Wiederholungen bei Netzwerkfehlern
  const BACKOFF_MS = 2000;   // Wartezeit bei 429 (Rate Limit)

  // Gebäudetypen ohne Personalsuche (IDs → Namen)
  const SKIP_TYPES = {
    4:  "Krankenhaus",
    6:  "Leitstelle",
    8:  "Polizeischule",
    10: "Feuerwehrschule",
    14: "Bereitstellungsraum",
    21: "Rettungsschule",
  };
  // ═════════════════════════════════════════════

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // ── Gebäude laden ──
  console.log("📋 Lade alle Gebäude...");
  let buildings;
  try {
    const res = await fetch("/api/buildings");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    buildings = await res.json();
  } catch (e) {
    console.error(`❌ Gebäude konnten nicht geladen werden: ${e.message}`);
    return;
  }
  console.log(`✅ ${buildings.length} Gebäude gefunden.`);

  // ── Filtern ──
  const skippedCounts = {};
  const hireable = [];
  for (const b of buildings) {
    if (SKIP_TYPES[b.building_type]) {
      const name = SKIP_TYPES[b.building_type];
      skippedCounts[name] = (skippedCounts[name] || 0) + 1;
    } else if (b.hiring_phase > 0) {
      skippedCounts["Bereits aktiv"] = (skippedCounts["Bereits aktiv"] || 0) + 1;
    } else {
      hireable.push(b);
    }
  }

  // Übersprungene Zusammenfassung
  const skipEntries = Object.entries(skippedCounts);
  if (skipEntries.length) {
    console.log(`⏭️  Übersprungen: ${skipEntries.map(([k, v]) => `${v}× ${k}`).join(", ")}`);
  }

  if (hireable.length === 0) {
    console.log("ℹ️  Keine Gebäude zum Anwerben übrig.");
    return;
  }

  const total = hireable.length;
  const eta = ((total * (PAUSE_MS + 100)) / 1000).toFixed(0);
  console.log(`🚀 ${DRY_RUN ? "[DRY RUN] " : ""}Starte Personalsuche für ${total} Gebäude (~${eta}s)...`);

  // ── Hauptschleife ──
  let erfolg = 0, fehler = 0;
  const startTime = Date.now();

  for (let i = 0; i < total; i++) {
    const building = hireable[i];
    const progress = `[${i + 1}/${total}]`;

    if (DRY_RUN) {
      console.log(`🔍 ${progress} ${building.caption} (Typ ${building.building_type}) – würde angeworben`);
      erfolg++;
      continue;
    }

    await sleep(PAUSE_MS);

    let success = false;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const res = await fetch(`/buildings/${building.id}/hire_do/${TAGE}`);

        if (res.ok || res.status === 302) {
          console.log(`✅ ${progress} ${building.caption}`);
          erfolg++;
          success = true;
          break;
        } else if (res.status === 429) {
          console.warn(`⏳ ${progress} Rate Limit – warte ${BACKOFF_MS}ms (Versuch ${attempt + 1}/${MAX_RETRIES + 1})`);
          await sleep(BACKOFF_MS);
        } else if (res.status === 404) {
          console.warn(`⏭️  ${progress} ${building.caption} → 404 (nicht unterstützt)`);
          success = true; // don't count as error
          break;
        } else {
          console.warn(`⚠️ ${progress} ${building.caption} → HTTP ${res.status}`);
          break;
        }
      } catch (e) {
        console.warn(`🔁 ${progress} Netzwerkfehler – Versuch ${attempt + 1}/${MAX_RETRIES + 1}: ${e.message}`);
        await sleep(BACKOFF_MS);
      }
    }

    if (!success) fehler++;
  }

  // ── Zusammenfassung ──
  const dauer = ((Date.now() - startTime) / 1000).toFixed(1);
  const skipped = buildings.length - total;
  console.log("─────────────────────────────────────");
  console.log(`🏁 Fertig in ${dauer}s! ${DRY_RUN ? "[DRY RUN] " : ""}Erfolg: ${erfolg} | Fehler: ${fehler} | Übersprungen: ${skipped}`);
})();
