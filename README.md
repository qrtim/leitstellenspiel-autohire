# leitstellenspiel-autohire
# 🚒 Leitstellenspiel – Auto-Werbe-Skript

Automatisch alle Wachen auf Personalsuche stellen – ohne jede Wache einzeln anklicken zu müssen.

---

## ✨ Was macht das Skript?

- Lädt alle deine Gebäude über die Leitstellenspiel-API
- Stellt bei **jeder Wache** automatisch die Personalsuche auf **3 Tage** (oder 1/2 Tage – einstellbar)
- Überspringt Leitstellen, Krankenhäuser, Schulen und andere Gebäude ohne Personal
- Überspringt Gebäude, die bereits eine laufende Personalsuche haben
- Zeigt in der Konsole den Fortschritt für jede Wache (`[12/78]`)
- Zusammenfassung der übersprungenen Gebäude nach Typ
- **Dry-Run-Modus**: Vorschau ohne tatsächliche Anfragen
- **Retry-Logik**: Automatische Wiederholung bei Netzwerkfehlern & Rate Limits
- Geschätzte und tatsächliche Laufzeit

---

## 🚀 Anleitung

### 1. Einloggen
Öffne [leitstellenspiel.de](https://www.leitstellenspiel.de) und logge dich ein.

### 2. Browser-Konsole öffnen

| Browser | Tastenkürzel |
|---|---|
| Brave / Chrome | `F12` oder `Strg + Shift + J` |
| Firefox | `F12` oder `Strg + Shift + K` |
| Edge | `F12` oder `Strg + Shift + J` |

Dann oben auf den Reiter **"Console"** klicken.

Falls das nicht geht, funktioniert meist ein Klick auf 3 Striche (Burgermenü 🍔), und dann unter "Weitere Tools" -> "Entwickleroptionen".

### 3. Skript einfügen & starten

Den Inhalt der Datei `leitstellenspiel_suche.js` komplett kopieren, in die Konsole einfügen und `Enter` drücken.

### 4. Warten

Das Skript läuft automatisch durch alle Wachen. In der Konsole siehst du den Fortschritt:

```
📋 Lade alle Gebäude...
✅ 80 Gebäude gefunden.
⏭️  Übersprungen: 2× Leitstelle, 1× Krankenhaus, 5× Bereits aktiv
🚀 Starte Personalsuche für 72 Gebäude (~24s)...
✅ [1/72] Freiwillige Feuerwehr Musterstadt
✅ [2/72] Berufsfeuerwehr Musterstadt
...
─────────────────────────────────────
🏁 Fertig in 23.4s! Erfolg: 72 | Fehler: 0 | Übersprungen: 8
```

---

## ⚙️ Einstellungen

Am Anfang des Skripts kannst du folgende Werte anpassen:

```js
const TAGE = 3;            // Werbe-Dauer: 1, 2 oder 3 Tage
const PAUSE_MS = 300;      // Pause zwischen Anfragen in Millisekunden
const DRY_RUN = false;     // true = nur Vorschau, keine Anfragen senden
const MAX_RETRIES = 2;     // Wiederholungsversuche bei Netzwerkfehlern
const BACKOFF_MS = 2000;   // Wartezeit bei Rate Limit (429)
```

Die `SKIP_TYPES`-Liste bestimmt, welche Gebäudetypen übersprungen werden. Du kannst dort IDs hinzufügen oder entfernen.

---


## ❓ Häufige Fragen

**Einige Wachen zeigen einen Fehler – ist das schlimm?**  
Nein. Manche Gebäudetypen (z.B. Krankenhäuser, Schulen) unterstützen keine Personalsuche und geben einen 404 zurück. Das ist normal.

**Muss ich das jeden Tag neu starten?**  
Ja, da Werbeaktionen nach 1–3 Tagen ablaufen. Du kannst das Skript einfach täglich einmal ausführen.

**Funktioniert das auch auf Missionschief / anderen Servern?**  
Möglicherweise – wenn die URL-Struktur gleich ist. Einfach ausprobieren. 

---

## ⚠️ Hinweis

Dieses Skript läuft ausschließlich im Browser und sendet nur Anfragen, die du auch manuell senden würdest. Es werden keine Daten gespeichert oder weitergegeben. Nutzung auf eigene Verantwortung.
