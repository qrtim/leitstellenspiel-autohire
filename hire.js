(async () => {
  const TAGE = 3; // 1, 2 oder 3
  const PAUSE_MS = 300;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  console.log("📋 Lade alle Gebäude...");
  const buildings = await fetch("/api/buildings").then(r => r.json());
  console.log(`✅ ${buildings.length} Gebäude gefunden.`);

  let erfolg = 0, fehler = 0, uebersprungen = 0;

  for (const building of buildings) {
    // Leitstellen überspringen (kein Personal)
    if (building.building_type === 6) { uebersprungen++; continue; }

    await sleep(PAUSE_MS);

    const res = await fetch(`/buildings/${building.id}/hire_do/${TAGE}`);

    if (res.ok || res.status === 302) {
      console.log(`✅ [${building.id}] ${building.caption}`);
      erfolg++;
    } else {
      console.warn(`⚠️ [${building.id}] ${building.caption} → HTTP ${res.status}`);
      fehler++;
    }
  }

  console.log("─────────────────────────────────────");
  console.log(`🏁 Fertig! Erfolg: ${erfolg} | Fehler: ${fehler} | Übersprungen: ${uebersprungen}`);
})();
