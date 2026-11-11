# Brotzeit – installierbare iPhone-PWA

## Installation
1. Alle Dateien aus diesem Ordner **unverändert zusammen** auf einem HTTPS-Webhost veröffentlichen (z. B. GitHub Pages oder Netlify).
2. Die HTTPS-Adresse auf dem iPhone in **Safari** öffnen.
3. Teilen → **Zum Home-Bildschirm** → Hinzufügen.
4. Die App über das Home-Bildschirm-Symbol starten. Nach dem ersten vollständigen Laden funktioniert sie auch offline.

**Wichtig:** Das lokale Öffnen der index.html über die Dateien-App reicht nicht für eine installierbare Offline-PWA. Für Service Worker ist HTTPS (oder localhost) erforderlich.

## Funktionen
- Fünf Grundrezepte: Ciabatta, Focaccia, italienisches Landbrot, Weizenbrot, Weizen-Roggen-Mischbrot.
- Mehlmenge, Wasser, Salz, Zutaten und Hefe skaliert; Hefemenge nur als grobe Schätzung.
- Eigene Rezepte erstellen, bearbeiten, löschen.
- Rückwärts-Backzeitplaner.
- JSON-Rezepte importieren und exportieren.
- Offline-Cache und lokale Speicherung via localStorage.

## JSON-Schema
```json
{"version":1,"recipes":[{"id":"mein-brot-1","name":"Mein Brot","flours":[{"name":"Weizenmehl Type 550","pct":70},{"name":"Roggenmehl Type 1150","pct":30}],"water":70,"salt":2,"extras":[{"name":"Olivenöl","pct":3}],"steps":["Zutaten vermischen.","Teig gehen lassen.","Backen."],"bake":"230 °C, 35 Minuten"}]}
```
Alle Zutatenanteile beziehen sich auf die gesamte Mehlmenge. Mehlanteile müssen zusammen 100 ergeben. Importierte Rezepte werden zusätzlich gespeichert; bestehende IDs werden nicht überschrieben.

## Hinweise
Der Rechner liefert keine wissenschaftlich genaue Hefeprognose. Zeit und Temperatur allein reichen nicht für die sichere Vorhersage der Teigreife. Der Zeitplaner berücksichtigt keine individuellen Übergangszeiten. Lokale Daten können beim Löschen von Browserdaten verloren gehen: regelmäßig exportieren.
