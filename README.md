# Brotzeit – iPhone-Web-App

Brotzeit ist eine offlinefähige Rezeptverwaltung und ein Teig- und Backzeitrechner.

## Veröffentlichung
Die Dateien **aus diesem Ordner** direkt in das Hauptverzeichnis eines GitHub-Pages-Repositories hochladen. `index.html`, `app.js`, `sw.js` und `manifest.webmanifest` müssen auf derselben Ebene liegen. Unter Settings → Pages die Veröffentlichung aus `main` und `/(root)` einschalten.

## Datensicherung
Unter **Import → Vollständiges Backup sichern** wird eine JSON-Datei mit eigenen Rezepten und Planer-Einstellungen heruntergeladen. Auf dem iPhone anschließend in **Dateien → iCloud Drive** speichern. Über **Backup wiederherstellen** wird die Sicherung eingelesen. Vor dem Ersetzen wird eine Sicherheitskopie zum Download angeboten. Die fünf Grundrezepte sind fest in der App und werden nicht gelöscht. Ein regelmäßiges Backup ist wichtig, da Browserdaten gelöscht werden können.

## Zeitplan
Rezept auswählen; die hinterlegten Richtwerte werden geladen. Alle Zeiten können überschrieben werden. Vorheizen läuft parallel zur Stückgare. Bei warmem Teig oder unterschiedlichen Gärzuständen Zeiten nach Bedarf korrigieren.

## Nutzung und Rechte
Es wurde bewusst keine Open-Source-Lizenz beigelegt. Für eigene rechtliche Hinweise und Veröffentlichungsbedingungen gegebenenfalls fachkundigen Rat einholen.

Version 1.1.1: Cache-Aktualisierung für GitHub Pages. Alle Dateien aus brotzeit-pwa direkt ins Repository-Hauptverzeichnis hochladen. Vor Änderungen eigene Rezepte exportieren.
