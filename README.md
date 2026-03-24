# leitstellenspiel-autohire
# 🚒 Leitstellenspiel – Auto-Werbe-Skript

Automatisch alle Wachen auf Personalsuche stellen – ohne jede Wache einzeln anklicken zu müssen.

---

## ✨ Was macht das Skript?

- Lädt alle deine Gebäude über die Leitstellenspiel-API
- Stellt bei **jeder Wache** automatisch die Personalsuche auf **3 Tage** (oder 1/2 Tage – einstellbar)
- Überspringt Leitstellen (die haben kein Personal)
- Zeigt in der Konsole den Fortschritt für jede Wache

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

Falls das nicht geht, funktioniert meist ein Klick auf 3 Striche (meist oben rechts), und dann unter "Weitere Tools" -> "Entwickleroptionen".

### 3. Skript einfügen & starten

Den Inhalt der Datei `leitstellenspiel_suche.js` komplett kopieren, in die Konsole einfügen und `Enter` drücken.

### 4. Warten

Das Skript läuft automatisch durch alle Wachen. In der Konsole siehst du den Fortschritt:

```
📋 Lade alle Gebäude...
✅ 80 Gebäude gefunden.
✅ [XXX] Freiwillige Feuerwehr Musterstadt
✅ [XXX] Berufsfeuerwehr Musterstadt
...
─────────────────────────────────────
🏁 Fertig! Erfolg: 78 | Fehler: 0 | Übersprungen: 2
```

---

## ⚙️ Einstellungen

Am Anfang des Skripts kannst du zwei Werte anpassen:


const TAGE = 3;       // Werbe-Dauer: 1, 2 oder 3 Tage
const PAUSE_MS = 300; // Pause zwischen Anfragen in Millisekunden


> ⚠️ `PAUSE_MS` nicht zu niedrig stellen – sonst könnten zu viele Anfragen auf einmal gesendet werden.

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
